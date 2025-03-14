import Post from '@/models/Post';
import dbConnect from '@/utils/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { successResponse, withErrorHandling } from '@/utils/api-helpers';

export async function GET(request) {
  return withErrorHandling(async () => {
    // Get session
    const session = await getServerSession(authOptions);
    if (!session) {
      return new Response(JSON.stringify({ success: false, message: 'Unauthorized' }), {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    // Connect to database
    await dbConnect();

    // Get user's posts with pagination
    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get('page')) || 1;
    const limit = Number(searchParams.get('limit')) || 20;
    const skip = (page - 1) * limit;

    const [posts, total] = await Promise.all([
      Post.find({ user: session.user.id }).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Post.countDocuments({ user: session.user.id }),
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
  }, 'Failed to fetch posts');
}
