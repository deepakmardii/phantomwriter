import { NextResponse } from 'next/server';
import { authenticate } from '@/middleware/auth';
import { createOrder, SUBSCRIPTION_PLANS } from '@/utils/razorpay';
import dbConnect from '@/utils/db';

export async function POST(request) {
  try {
    // Authenticate request
    const authRequest = await authenticate(request);
    if (authRequest instanceof NextResponse) {
      return authRequest;
    }

    const { plan } = await request.json();

    if (!plan || !SUBSCRIPTION_PLANS[plan]) {
      return NextResponse.json(
        { success: false, message: 'Invalid subscription plan' },
        { status: 400 }
      );
    }

    const selectedPlan = SUBSCRIPTION_PLANS[plan];

    // Create Razorpay order
    const orderResponse = await createOrder(selectedPlan.price);

    if (!orderResponse.success) {
      return NextResponse.json(
        { success: false, message: 'Failed to create order' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      order: orderResponse.order,
      plan: selectedPlan,
    });
  } catch (error) {
    console.error('Create order error:', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
