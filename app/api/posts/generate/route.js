import { NextResponse } from 'next/server';
import { authenticate } from '@/middleware/auth';
import { generateLinkedInPost } from '@/utils/ai';
import Post from '@/models/Post';
import User from '@/models/User';
import dbConnect from '@/utils/db';
import {
  successResponse,
  errorResponse,
  withErrorHandling,
  validateRequestBody,
} from '@/utils/api-helpers';

export async function POST(request) {
  return withErrorHandling(async () => {
    // Authenticate request
    const authRequest = await authenticate(request);
    if (authRequest instanceof NextResponse) {
      return authRequest;
    }

    // Validate request body
    const body = await request.json();
    validateRequestBody(body, ['topic', 'tone']);

    // Connect to database
    await dbConnect();

    // Check subscription and monthly limits
    const user = authRequest.user;
    const now = new Date();
    const lastReset = new Date(user.postUsage.lastResetDate);

    // Reset monthly count if it's a new month
    if (lastReset.getMonth() !== now.getMonth() || lastReset.getFullYear() !== now.getFullYear()) {
      user.postUsage.count = 0;
      user.postUsage.lastResetDate = now;
      await user.save();
    }

    // Check if user has reached monthly limit
    if (user.postUsage.count >= user.postUsage.monthlyLimit) {
      return errorResponse(
        `Monthly limit of ${user.postUsage.monthlyLimit} posts reached. Please wait for next month.`,
        403
      );
    }

    // Generate post content
    const { topic, tone, keywords = [] } = body;
    const generatedContent = await generateLinkedInPost({
      topic,
      tone,
      keywords,
    });

    if (!generatedContent.success) {
      return errorResponse('Failed to generate content', 500);
    }

    // Save post to database and update usage count
    const post = await Post.create({
      user: user._id,
      content: generatedContent.content,
      topic,
      tone,
      keywords,
      isPublished: false,
    });

    // Increment usage count and save
    user.postUsage.count += 1;
    await user.save();

    return successResponse({
      message: 'Post generated successfully',
      post,
      remainingPosts: user.postUsage.monthlyLimit - user.postUsage.count,
    });
  }, 'Failed to generate post');
}
