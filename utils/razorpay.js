import Razorpay from 'razorpay';

let razorpay;

// Only initialize Razorpay on the server side
if (typeof window === 'undefined') {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new Error('Razorpay credentials are not configured');
  }
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
}

export async function createOrder(amount) {
  if (!razorpay) {
    throw new Error('Razorpay is not initialized');
  }
  try {
    // Convert USD to INR (approximate conversion rate)
    const USD_TO_INR_RATE = 80;
    const amountInINR = Math.round(amount * USD_TO_INR_RATE);
    const amountInPaise = amountInINR * 100; // Convert to smallest currency unit (paise)

    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      payment_capture: 1,
      notes: {
        original_amount_usd: amount,
        conversion_rate: USD_TO_INR_RATE,
      },
    });

    return {
      success: true,
      order,
    };
  } catch (error) {
    console.error('Razorpay order creation error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

export function validatePaymentSignature(orderId, paymentId, signature) {
  const text = orderId + '|' + paymentId;
  const generated_signature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(text)
    .digest('hex');

  return generated_signature === signature;
}

export const SUBSCRIPTION_PLANS = {
  monthly: {
    price: 49,
    duration: 30,
    name: 'Monthly Plan',
    savings: null,
  },
  yearly: {
    price: 299,
    duration: 365,
    name: 'Yearly Plan',
    savings: '50% off',
  },
};
