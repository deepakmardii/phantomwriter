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
  try {
    await dbConnect();

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const linkedInToken = await LinkedInToken.findOne({ user: user._id });
    // Debug log the token status
    console.log('LinkedIn post attempt:', {
      userId: session.user.id,
      hasToken: !!linkedInToken,
      tokenData: linkedInToken
        ? {
            accessToken: !!linkedInToken.accessToken,
            createdAt: linkedInToken.createdAt,
            expiresAt: linkedInToken.expiresAt,
            isExpired: linkedInToken.isExpired?.(),
          }
        : null,
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
    // Debug log the form data and user info
    console.log('Form data and auth info:', {
      content: formData.get('content'),
      image: formData.get('image')?.name,
      isScheduled: formData.get('isScheduled'),
      scheduledFor: formData.get('scheduledFor'),
      timezone: formData.get('timezone'),
      userId: session?.user?.id,
      hasLinkedInToken: !!linkedInToken?.accessToken,
    });

    const content = formData.get('content');
    if (!content?.trim()) {
      return NextResponse.json(
        { error: 'Content is required and cannot be empty' },
        { status: 400 }
      );
    }

    // Validate LinkedIn token
    if (linkedInToken?.accessToken) {
      console.log('LinkedIn token found, validating...');
      try {
        // Test token by getting user info
        await getUserInfo(linkedInToken.accessToken);
      } catch (error) {
        console.error('LinkedIn token validation failed:', error);
        return NextResponse.json(
          { error: 'LinkedIn authentication failed. Please reconnect your LinkedIn account.' },
          { status: 401 }
        );
      }
    }

    const image = formData.get('image');
    const isScheduled = formData.get('isScheduled') === 'true';
    const scheduledFor = formData.get('scheduledFor');

    let post;

    if (isScheduled && scheduledFor) {
      const timezone = formData.get('timezone');
      if (!timezone) {
        return NextResponse.json({ error: 'Timezone is required for scheduling' }, { status: 400 });
      }

      // Parse date with timezone
      const scheduledDate = new Date(
        new Date(scheduledFor).toLocaleString('en-US', { timeZone: timezone })
      );
      const now = new Date();
      const minScheduleTime = new Date(now.getTime() + 5 * 60 * 1000); // 5 minutes from now

      if (scheduledDate <= now) {
        return NextResponse.json(
          { error: 'Scheduled date must be in the future' },
          { status: 400 }
        );
      }

      if (scheduledDate < minScheduleTime) {
        return NextResponse.json(
          { error: 'Please schedule at least 5 minutes in advance to ensure proper processing' },
          { status: 400 }
        );
      }

      try {
        // Create a scheduled post
        post = await Post.create({
          user: user._id,
          content,
          isScheduled: true,
          scheduledFor: scheduledDate,
          topic: formData.get('topic') || 'Scheduled Post',
          tone: formData.get('tone') || 'professional',
        });
      } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 400 });
      }

      return NextResponse.json({ message: 'Post scheduled successfully', post });
    } else {
      // Share immediately
      let imageBuffer = null;
      let imageType = null;

      if (image) {
        const arrayBuffer = await image.arrayBuffer();
        imageBuffer = Buffer.from(arrayBuffer);
        imageType = image.type;
      }

      const response = await createPost(linkedInToken.accessToken, content, imageBuffer, imageType);

      if (response.success) {
        post = await Post.create({
          user: user._id,
          content,
          topic: 'Direct Share',
          tone: 'professional',
          linkedinPostId: response.postId,
          isPublished: true,
          publishedAt: new Date(),
        });
      }

      return NextResponse.json({ message: 'Post shared successfully', post });
    }
  } catch (error) {
    console.error('Error in LinkedIn post route:', error);

    // Handle duplicate content error
    if (error.message.includes('duplicate')) {
      // Still create the post in our database
      post = await Post.create({
        user: user._id,
        content,
        topic: 'Direct Share',
        tone: 'professional',
        isPublished: false, // Mark as not published since LinkedIn rejected it
        publishedAt: new Date(),
        error: 'LinkedIn rejected as duplicate content',
      });

      return NextResponse.json(
        { error: 'This content has already been posted to LinkedIn', post },
        { status: 400 }
      );
    }

    // For other errors
    return NextResponse.json(
      {
        error: 'Failed to post to LinkedIn: ' + error.message,
        details: process.env.NODE_ENV === 'development' ? error : undefined,
      },
      { status: 500 }
    );
  }
}
