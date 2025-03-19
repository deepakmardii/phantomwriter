import { NextResponse } from 'next/server';
import { authenticate } from '@/middleware/auth';
import { generateTopicWithAI } from '@/utils/ai';
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
    validateRequestBody(body, ['category']);

    // Connect to database
    await dbConnect();

    // Generate topic based on category
    const { category } = body;
    const topics = await generateTopicWithAI(category);

    // Ensure we always return an array of topics
    const topicsArray = Array.isArray(topics) ? topics : [topics];

    return successResponse(topicsArray);
  }, 'Failed to generate topic');
}
