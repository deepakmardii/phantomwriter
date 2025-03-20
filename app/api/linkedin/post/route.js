/* eslint-disable no-console */
import { getServerSession } from 'next-auth/next';
import { NextResponse } from 'next/server';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/utils/db';
import User from '@/models/User';
import Post from '@/models/Post';
import LinkedInToken from '@/models/LinkedInToken';
import { createPost, getUserInfo } from '@/utils/linkedin';

export async function POST(request) {
  let post;
  let user;
  let content;

  try {
    await dbConnect();

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const linkedInToken = await LinkedInToken.findOne({ user: user._id });
    console.log('LinkedIn token status:', {
      userId: user._id,
      hasToken: !!linkedInToken,
      expiresAt: linkedInToken?.expiresAt,
    });

    if (!linkedInToken?.accessToken) {
      return NextResponse.json({ error: 'LinkedIn not connected' }, { status: 400 });
    }

    if (linkedInToken.isExpired?.()) {
      return NextResponse.json(
        { error: 'LinkedIn token has expired. Please reconnect your account.' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    content = formData.get('content');
    if (!content?.trim()) {
      return NextResponse.json(
        { error: 'Content is required and cannot be empty' },
        { status: 400 }
      );
    }

    // Validate LinkedIn token
    try {
      await getUserInfo(linkedInToken.accessToken);
    } catch (error) {
      console.error('LinkedIn token validation failed:', error);
      return NextResponse.json(
        { error: 'LinkedIn authentication failed. Please reconnect your LinkedIn account.' },
        { status: 401 }
      );
    }

    const image = formData.get('image');
    const isScheduled = formData.get('isScheduled') === 'true';
    const scheduledFor = formData.get('scheduledFor');

    if (isScheduled && scheduledFor) {
      const timezone = formData.get('timezone');
      if (!timezone) {
        return NextResponse.json({ error: 'Timezone is required for scheduling' }, { status: 400 });
      }

      // Convert the local time to UTC
      const localDate = new Date(scheduledFor);
      const utcDate = new Date(localDate.getTime() - localDate.getTimezoneOffset() * 60000);

      console.log('Scheduling post:', {
        localTime: localDate.toISOString(),
        utcTime: utcDate.toISOString(),
        timezone,
      });

      const now = new Date();
      const minScheduleTime = new Date(now.getTime() + 5 * 60 * 1000); // 5 minutes from now

      if (utcDate <= now) {
        return NextResponse.json(
          { error: 'Scheduled date must be in the future' },
          { status: 400 }
        );
      }

      if (utcDate < minScheduleTime) {
        return NextResponse.json(
          { error: 'Please schedule at least 5 minutes in advance to ensure proper processing' },
          { status: 400 }
        );
      }

      try {
        post = await Post.create({
          user: user._id,
          content,
          isScheduled: true,
          scheduledFor: utcDate,
          topic: formData.get('topic') || 'Scheduled Post',
          tone: formData.get('tone') || 'professional',
        });

        console.log('Created scheduled post:', {
          postId: post._id,
          scheduledFor: utcDate.toISOString(),
        });
      } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 400 });
      }

      return NextResponse.json({
        message: 'Post scheduled successfully',
        post,
        scheduledTime: {
          utc: utcDate.toISOString(),
          local: localDate.toISOString(),
        },
      });
    } else {
      // Share immediately
      let imageBuffer = null;
      let imageType = null;

      if (image) {
        const arrayBuffer = await image.arrayBuffer();
        imageBuffer = Buffer.from(arrayBuffer);
        imageType = image.type;
      }

      try {
        const response = await createPost(
          linkedInToken.accessToken,
          content,
          imageBuffer,
          imageType
        );

        post = await Post.create({
          user: user._id,
          content,
          topic: 'Direct Share',
          tone: 'professional',
          linkedinPostId: response.postId,
          isPublished: true,
          publishedAt: new Date(),
        });

        console.log('Successfully shared post:', {
          postId: post._id,
          linkedinPostId: response.postId,
        });

        return NextResponse.json({
          message: 'Post shared successfully',
          post,
          linkedinPostId: response.postId,
        });
      } catch (error) {
        if (error.message.includes('duplicate')) {
          const linkedinId = error.message.match(/urn:li:share:(\d+)/)?.[1];
          console.log('Duplicate post detected:', {
            linkedinId,
            content: content.substring(0, 50) + '...',
          });

          post = await Post.create({
            user: user._id,
            content,
            topic: 'Direct Share',
            tone: 'professional',
            linkedinPostId: linkedinId || 'duplicate-post',
            isPublished: true,
            publishedAt: new Date(),
            status: 'duplicate',
          });

          return NextResponse.json(
            {
              message: 'This content was already shared on LinkedIn',
              post,
              linkedinId,
              status: 'duplicate',
            },
            { status: 200 }
          );
        }
        throw error;
      }
    }
  } catch (error) {
    console.error('LinkedIn post error:', error);
    return NextResponse.json(
      {
        error: 'Failed to process LinkedIn post: ' + error.message,
        details: process.env.NODE_ENV === 'development' ? error : undefined,
      },
      { status: 500 }
    );
  }
}
