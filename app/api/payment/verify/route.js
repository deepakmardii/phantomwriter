import { NextResponse } from 'next/server';
import { authenticate } from '@/middleware/auth';
import { validatePaymentSignature, SUBSCRIPTION_PLANS } from '@/utils/razorpay';
import User from '@/models/User';
import dbConnect from '@/utils/db';

export async function POST(request) {
  try {
    // Authenticate request
    const authRequest = await authenticate(request);
    if (authRequest instanceof NextResponse) {
      return authRequest;
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan } =
      await request.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !plan) {
      return NextResponse.json(
        { success: false, message: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Verify payment signature
    const isValid = validatePaymentSignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    if (!isValid) {
      return NextResponse.json(
        { success: false, message: 'Invalid payment signature' },
        { status: 400 }
      );
    }

    // Get subscription details
    const selectedPlan = SUBSCRIPTION_PLANS[plan];
    if (!selectedPlan) {
      return NextResponse.json(
        { success: false, message: 'Invalid subscription plan' },
        { status: 400 }
      );
    }

    // Update user subscription
    await dbConnect();

    // Get current user
    const user = await User.findById(authRequest.user._id);

    const now = new Date();
    const monthlyPostLimit = 45; // Fixed 45 posts per month for all plans

    let subscriptionUpdate = {};

    if (!user.subscription.trialStartedAt) {
      // Trial period (3 days)
      const trialEndsAt = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
      subscriptionUpdate = {
        status: 'trial',
        plan: selectedPlan.name.toLowerCase(),
        trialStartedAt: now,
        trialEndsAt,
        expiresAt: trialEndsAt, // During trial, expiry is same as trial end
      };
    } else {
      // Regular subscription - calculate based on plan duration
      const durationInDays = selectedPlan.duration || 30; // Default to 30 if not specified
      const expiryDate = new Date(now.getTime() + durationInDays * 24 * 60 * 60 * 1000);

      subscriptionUpdate = {
        status: 'active',
        plan: selectedPlan.name.toLowerCase(),
        expiresAt: expiryDate,
      };
    }

    const updatedUser = await User.findByIdAndUpdate(
      authRequest.user._id,
      {
        subscription: subscriptionUpdate,
        postUsage: {
          count: 0, // Reset post count
          monthlyLimit: monthlyPostLimit,
          lastResetDate: now,
        },
      },
      { new: true }
    );

    if (!updatedUser) {
      throw new Error('Failed to update user subscription');
    }

    return NextResponse.json({
      success: true,
      message:
        user.subscription.status === 'trial'
          ? 'Trial period activated'
          : 'Payment verified and subscription activated',
      subscription: updatedUser.subscription,
      postUsage: updatedUser.postUsage,
      expiresAt: updatedUser.subscription.expiresAt,
      trialEndsAt: updatedUser.subscription.trialEndsAt,
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
