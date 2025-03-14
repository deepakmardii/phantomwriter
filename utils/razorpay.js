import Razorpay from "razorpay";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export async function createOrder(amount) {
  try {
    const order = await razorpay.orders.create({
      amount: amount * 100, // Convert to smallest currency unit (paise)
      currency: "INR",
      payment_capture: 1,
    });

    return {
      success: true,
      order,
    };
  } catch (error) {
    console.error("Razorpay order creation error:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

export function validatePaymentSignature(orderId, paymentId, signature) {
  const text = orderId + "|" + paymentId;
  const generated_signature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(text)
    .digest("hex");

  return generated_signature === signature;
}

export const SUBSCRIPTION_PLANS = {
  monthly: {
    price: 999, // ₹999
    duration: 30, // days
    name: "Monthly Plan",
  },
  yearly: {
    price: 9999, // ₹9,999
    duration: 365, // days
    name: "Yearly Plan",
  },
};
