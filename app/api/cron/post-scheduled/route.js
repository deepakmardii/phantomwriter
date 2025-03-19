/* eslint-disable no-console */
import { NextResponse } from 'next/server';
import dbConnect from '@/utils/db';
import Post from '@/models/Post';
import LinkedInToken from '@/models/LinkedInToken';
import { createPost } from '@/utils/linkedin';

export async function POST(request) {
  // Check if this is a Vercel Cron invocation
  const isVercelCron = request.headers.get('x-vercel-cron') === 'true';

  console.log('Post scheduled check initiated:', {
    source: isVercelCron ? 'Vercel Cron' : 'Client Polling',
    timestamp: new Date().toISOString(),
  });
  try {
    await dbConnect();

    // Get current time in UTC and IST for logging
    const now = new Date();
    const istTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));

    console.log('Cron job execution time:', {
      utc: now.toISOString(),
      ist: istTime.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }),
    });

    const scheduledPosts = await Post.find({
      isScheduled: true,
      scheduledFor: { $lte: now },
      isPublished: false,
    }).populate('user');

    // Debug log each post's scheduling details
    scheduledPosts.forEach(post => {
      const postScheduledTime = new Date(post.scheduledFor);
      const postIstTime = new Date(
        postScheduledTime.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })
      );

      console.log('Post scheduling details:', {
        id: post._id,
        content: post.content.slice(0, 30),
        timezone: post.timezone,
        scheduledFor: {
          utc: postScheduledTime.toISOString(),
          ist: postIstTime.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }),
        },
        currentTime: {
          utc: now.toISOString(),
          ist: istTime.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }),
        },
        timeDiff: Math.floor((now - postScheduledTime) / 1000) + ' seconds',
      });
    });

    console.log(
      `Found ${scheduledPosts.length} scheduled posts to process at ${istTime.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })}`
    );

    const results = [];

    for (const post of scheduledPosts) {
      try {
        // Get LinkedIn token for the user
        const linkedInToken = await LinkedInToken.findOne({ user: post.user._id });

        if (!linkedInToken?.accessToken || linkedInToken.isExpired?.()) {
          console.log(`Skipping post ${post._id} - No valid LinkedIn token`);
          continue;
        }

        // Post to LinkedIn
        try {
          const response = await createPost(linkedInToken.accessToken, post.content);

          // Update post status on success
          await Post.findByIdAndUpdate(post._id, {
            linkedinPostId: response.postId,
            isPublished: true,
            publishedAt: new Date(),
          });

          results.push({
            postId: post._id,
            status: 'success',
            linkedinPostId: response.postId,
          });
        } catch (error) {
          console.log('Processing error for post:', {
            postId: post._id,
            error: error.message,
            isDuplicate: error.message?.includes('duplicate'),
          });

          // Check if error is due to duplicate content
          if (error.message?.includes('duplicate')) {
            const linkedinId = error.message.match(/urn:li:share:(\d+)/)?.[1];
            console.log('Found duplicate post with LinkedIn ID:', linkedinId);

            const updateResult = await Post.findByIdAndUpdate(
              post._id,
              {
                isPublished: true,
                publishedAt: new Date(),
                linkedinPostId: linkedinId || 'duplicate-post',
              },
              { new: true } // Return updated document
            );

            console.log('Updated post status:', {
              postId: post._id,
              isPublished: updateResult.isPublished,
              linkedinPostId: updateResult.linkedinPostId,
            });

            results.push({
              postId: post._id,
              status: 'success',
              message: 'Post was already shared',
              linkedinId,
            });

            // Force a refresh of the posts in the calendar
            await Post.findById(post._id);
          } else {
            throw error;
          }
        }
      } catch (error) {
        console.error(`Error processing scheduled post ${post._id}:`, error);
        results.push({
          postId: post._id,
          status: 'error',
          error: error.message,
        });
      }
    }

    return NextResponse.json({
      message: `Processed ${scheduledPosts.length} scheduled posts`,
      results,
    });
  } catch (error) {
    console.error('Error in scheduled posts cron:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Only allow POST requests
export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}
