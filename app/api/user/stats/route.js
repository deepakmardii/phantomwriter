import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import User from '@/models/User';
import { successResponse, errorResponse, withErrorHandling } from '@/utils/api-helpers';
import dbConnect from '@/utils/db';

export const dynamic = 'force-dynamic';

export async function GET(_request) {
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

    // Check if trial has expired
    if (
      user.subscription.status === 'trial' &&
      user.subscription.expiresAt &&
      new Date(user.subscription.expiresAt) < new Date()
    ) {
      // Update user subscription status to expired
      user.subscription.status = 'expired';
      await user.save();
    }

    // Set appropriate usage limits based on subscription status
    const postUsage = {
      ...user.postUsage,
      monthlyLimit: user.subscription.status === 'active' ? user.postUsage.monthlyLimit : 0, // No limit for free/expired users
    };

    return successResponse({
      stats: {
        postUsage,
        subscription: user.subscription,
      },
    });
  }, 'Failed to fetch user stats');
}
