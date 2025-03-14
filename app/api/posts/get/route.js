import { authenticate } from "@/middleware/auth";
import Post from "@/models/Post";
import connectDB from "@/utils/db";
import { successResponse, withErrorHandling } from "@/utils/api-helpers";

export async function GET(request) {
  return withErrorHandling(async () => {
    // Authenticate request
    const authRequest = await authenticate(request);
    if (authRequest instanceof Response) {
      return authRequest;
    }

    // Connect to database
    await connectDB();

    // Get user's posts with pagination
    const page = Number(request.nextUrl.searchParams.get("page")) || 1;
    const limit = Number(request.nextUrl.searchParams.get("limit")) || 20;
    const skip = (page - 1) * limit;

    const [posts, total] = await Promise.all([
      Post.find({ user: authRequest.user._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Post.countDocuments({ user: authRequest.user._id }),
    ]);

    return successResponse({
      posts,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalPosts: total,
        hasMore: skip + posts.length < total,
      },
    });
  }, "Failed to fetch posts");
}
