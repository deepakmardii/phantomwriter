import Razorpay from 'razorpay';
const { createHmac } = require('crypto');

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
  const generated_signature = createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(text)
    .digest('hex');

  return generated_signature === signature;
}

export const TRIAL_DURATION = 3; // 3 days trial

export const SUBSCRIPTION_PLANS = {
  monthly: {
    price: 49,
    duration: 30,
    name: 'Monthly Plan',
    savings: null,
    postsLimit: 45,
    trialEnabled: true,
    description: '3-day free trial, then $49/month for 45 AI-generated posts',
  },
  yearly: {
    price: 299,
    duration: 365,
    name: 'Yearly Plan',
    savings: '50% off',
    postsLimit: 45,
    trialEnabled: true,
    description: '3-day free trial, then $299/year for 45 AI-generated posts per month',
  },
};

export function calculateTrialEndDate() {
  const trialEnd = new Date();
  trialEnd.setDate(trialEnd.getDate() + TRIAL_DURATION);
  return trialEnd;
}

export function isTrialExpired(trialStartDate) {
  if (!trialStartDate) return true;
  const now = new Date();
  const trialEnd = new Date(trialStartDate);
  trialEnd.setDate(trialEnd.getDate() + TRIAL_DURATION);
  return now >= trialEnd;
}
