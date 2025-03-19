import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import User from '@/models/User';
import { successResponse, errorResponse, withErrorHandling } from '@/utils/api-helpers';
import dbConnect from '@/utils/db';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  return withErrorHandling(async () => {
    const session = await getServerSession(authOptions);
    if (!session) {
      return errorResponse('Unauthorized', 401);
    }

    await dbConnect();
    const user = await User.findById(session.user.id).select('postUsage subscription');

    if (!user) {
      return errorResponse('User not found', 404);
    }

    return successResponse({
      stats: {
        postUsage: user.postUsage,
        subscription: user.subscription,
      },
    });
  }, 'Failed to fetch user stats');
}
