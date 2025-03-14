import { NextResponse } from "next/server";
import { authenticate } from "@/middleware/auth";
import { generateLinkedInPost } from "@/utils/ai";
import Post from "@/models/Post";
import connectDB from "@/utils/db";
import {
  successResponse,
  errorResponse,
  withErrorHandling,
  validateRequestBody,
} from "@/utils/api-helpers";

export async function POST(request) {
  return withErrorHandling(async () => {
    // Authenticate request
    const authRequest = await authenticate(request);
    if (authRequest instanceof NextResponse) {
      return authRequest;
    }

    // Validate request body
    const body = await request.json();
    validateRequestBody(body, ["topic", "tone"]);

    // Connect to database
    await connectDB();

    // Check user's subscription and post limits
    const user = authRequest.user;
    if (user.subscription.status === "free") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const postsToday = await Post.countDocuments({
        user: user._id,
        createdAt: { $gte: today },
      });

      if (postsToday >= 3) {
        return errorResponse(
          "Free tier daily limit reached. Please upgrade your subscription.",
          403
        );
      }
    }

    // Generate post content
    const { topic, tone, keywords = [] } = body;
    const generatedContent = await generateLinkedInPost({
      topic,
      tone,
      keywords,
    });

    if (!generatedContent.success) {
      return errorResponse("Failed to generate content", 500);
    }

    // Save post to database
    const post = await Post.create({
      user: user._id,
      content: generatedContent.content,
      topic,
      tone,
      keywords,
      isPublished: false,
    });

    return successResponse({
      message: "Post generated successfully",
      post,
    });
  }, "Failed to generate post");
}
