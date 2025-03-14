import { NextResponse } from "next/server";
import { authenticate } from "@/middleware/auth";
import { validatePaymentSignature, SUBSCRIPTION_PLANS } from "@/utils/razorpay";
import User from "@/models/User";
import connectDB from "@/utils/db";

export async function POST(request) {
  try {
    // Authenticate request
    const authRequest = await authenticate(request);
    if (authRequest instanceof NextResponse) {
      return authRequest;
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan } =
      await request.json();

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature ||
      !plan
    ) {
      return NextResponse.json(
        { success: false, message: "Missing required parameters" },
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
        { success: false, message: "Invalid payment signature" },
        { status: 400 }
      );
    }

    // Get subscription details
    const selectedPlan = SUBSCRIPTION_PLANS[plan];
    if (!selectedPlan) {
      return NextResponse.json(
        { success: false, message: "Invalid subscription plan" },
        { status: 400 }
      );
    }

    // Update user subscription
    await connectDB();
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + selectedPlan.duration);

    const user = await User.findByIdAndUpdate(
      authRequest.user._id,
      {
        subscription: {
          status: "active",
          expiresAt: expiryDate,
        },
      },
      { new: true }
    );

    return NextResponse.json({
      success: true,
      message: "Payment verified and subscription activated",
      subscription: user.subscription,
    });
  } catch (error) {
    console.error("Payment verification error:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
