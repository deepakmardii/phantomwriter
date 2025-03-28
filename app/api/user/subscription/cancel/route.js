import { NextResponse } from 'next/server';
import { authenticate } from '@/middleware/auth';
import dbConnect from '@/utils/db';
import User from '@/models/User';

export async function POST(request) {
  try {
    const authRequest = await authenticate(request);
    if (authRequest instanceof NextResponse) {
      return authRequest;
    }

    await dbConnect();
    const user = await User.findById(authRequest.user._id);

    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    if (user.subscription.status !== 'trial') {
      return NextResponse.json(
        { success: false, message: 'Only trial subscriptions can be cancelled' },
        { status: 400 }
      );
    }

    // Reset subscription to free status
    const updatedUser = await User.findByIdAndUpdate(
      authRequest.user._id,
      {
        subscription: {
          status: 'free',
          trialStartedAt: null,
          trialEndsAt: null,
          expiresAt: null,
          plan: null,
        },
        postUsage: {
          count: 0,
          monthlyLimit: 0,
          lastResetDate: new Date(),
        },
      },
      { new: true }
    );

    return NextResponse.json({
      success: true,
      message: 'Trial cancelled successfully',
      subscription: updatedUser.subscription,
    });
  } catch (error) {
    console.error('Error cancelling trial:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to cancel trial' },
      { status: 500 }
    );
  }
}
