'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/providers/AuthProvider';
import { SUBSCRIPTION_PLANS } from '@/utils/razorpay';

export default function Subscription() {
  const router = useRouter();
  const { token, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('monthly');

  const loadRazorpayScript = () => {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => reject(new Error('Failed to load Razorpay SDK'));
      document.body.appendChild(script);
    });
  };

  const handleSubscription = async () => {
    try {
      setError('');
      setLoading(true);

      if (!isAuthenticated || !token) {
        router.push('/auth/login?redirect=/subscription');
        return;
      }

      const res = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ plan: selectedPlan }),
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.message || 'Failed to create order');
      }

      // Load and verify Razorpay
      await loadRazorpayScript();
      const razorpayKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;

      if (!razorpayKey) {
        throw new Error(
          'Payment system not configured. Please try again later or contact support.'
        );
      }

      // Create payment options
      const options = {
        key: razorpayKey,
        amount: data.order.amount,
        currency: data.order.currency,
        name: 'PhantomWriter',
        description: `${data.plan.name} Subscription ($${data.plan.price} USD)`,
        order_id: data.order.id,
        notes: {
          original_amount_usd: data.plan.price,
        },
        modal: {
          confirm_close: true,
          escape: false,
          backdropclose: false,
        },
        handler: async response => {
          try {
            const verifyRes = await fetch('/api/payment/verify', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                plan: selectedPlan,
              }),
            });

            const verifyData = await verifyRes.json();

            if (!verifyData.success) {
              throw new Error(verifyData.message || 'Payment verification failed');
            }

            // Use replace instead of push to prevent back navigation to payment page
            router.replace('/dashboard?subscription=success');
          } catch (error) {
            console.error('Payment verification error:', error);
            setError(error.message || 'Payment verification failed. Please contact support.');
            setLoading(false);
          }
        },
        prefill: {
          name: 'User Name',
          email: 'user@example.com',
        },
        theme: {
          color: '#f97316', // orange-500
        },
      };

      const razorpay = new window.Razorpay(options);

      // Add event handlers
      razorpay.on('payment.failed', function (response) {
        console.error('Payment failed:', response.error);
        setError(`Payment failed: ${response.error.description}`);
        setLoading(false);
      });

      razorpay.on('modal.closed', function () {
        setLoading(false);
      });

      razorpay.open();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* <nav className="bg-white border-b border-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="text-xl font-bold text-gray-800">PhantomWriter</div>
            <button
              onClick={() => router.push('/dashboard')}
              className="text-gray-600 hover:text-gray-800"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </nav> */}

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white rounded-lg shadow-sm border border-gray px-5 py-6 sm:px-6">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-extrabold text-gray-800 mb-4">
                Ready to Supercharge Your LinkedIn Presence?
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Choose your plan and start generating engaging LinkedIn content with AI today. Save
                50% with yearly billing!
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg mb-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-red-400"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Payment Error</h3>
                    <div className="mt-2 text-sm text-red-700">{error}</div>
                  </div>
                </div>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {Object.entries(SUBSCRIPTION_PLANS).map(([key, plan]) => (
                <div
                  key={key}
                  className={`bg-white rounded-lg p-6 cursor-pointer border-2 shadow-sm ${
                    selectedPlan === key ? 'border-orange-500' : 'border-gray'
                  }`}
                  onClick={e => {
                    e.preventDefault();
                    setSelectedPlan(key);
                  }}
                >
                  <h3 className="text-xl font-bold text-gray-800 mb-4">{plan.name}</h3>
                  <div className="mb-4">
                    {plan.trialEnabled && (
                      <div className="mb-2">
                        <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                          3 Days Free Trial
                        </span>
                      </div>
                    )}
                    <div className="mt-3">
                      <p className="text-5xl font-extrabold text-gray-800">
                        ${plan.price}
                        <span className="text-xl text-gray-600">
                          {key === 'monthly' ? '/month' : '/year'}
                        </span>
                      </p>
                    </div>
                    {plan.savings && (
                      <div className="mt-2">
                        <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                          {plan.savings}
                        </span>
                      </div>
                    )}
                    {key === 'yearly' && (
                      <p className="text-gray-600 text-sm mt-2">
                        That&apos;s just ${Math.round(plan.price / 12)}/month, billed annually
                      </p>
                    )}
                    <p className="text-gray-600 text-sm mt-2">{plan.description}</p>
                  </div>
                  <ul className="text-gray-600 space-y-3 mb-6">
                    <li className="flex items-start">
                      <svg
                        className="h-6 w-6 text-orange-500 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span>45 AI-generated LinkedIn posts per month</span>
                    </li>
                    <li className="flex items-start">
                      <svg
                        className="h-6 w-6 text-orange-500 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span>Advanced tone & style customization</span>
                    </li>
                    <li className="flex items-start">
                      <svg
                        className="h-6 w-6 text-green-500 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span>Direct LinkedIn integration</span>
                    </li>
                    <li className="flex items-start">
                      <svg
                        className="h-6 w-6 text-orange-500 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span>Schedule & auto-publish posts</span>
                    </li>
                    <li className="flex items-start">
                      <svg
                        className="h-6 w-6 text-orange-500 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span>Post performance analytics</span>
                    </li>
                    <li className="flex items-start">
                      <svg
                        className="h-6 w-6 text-orange-500 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span>Priority email support</span>
                    </li>
                  </ul>
                  <button
                    onClick={e => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleSubscription();
                    }}
                    disabled={loading}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <svg className="animate-spin h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24">
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        Processing Payment...
                      </div>
                    ) : (
                      `Get ${plan.name}`
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
