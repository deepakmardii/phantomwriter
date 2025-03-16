'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SUBSCRIPTION_PLANS } from '@/utils/razorpay';

export default function Subscription() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('monthly');

  useEffect(() => {
    // Check token only if the user is trying to make a purchase
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('No authentication token found');
        // Don't redirect immediately, let users view plans
      }
    } catch (error) {
      console.error('Error accessing localStorage:', error);
    }
  }, []);

  const initializeRazorpay = () => {
    return new Promise((resolve, reject) => {
      if (!window?.ENV?.NEXT_PUBLIC_RAZORPAY_KEY_ID) {
        reject(new Error('Razorpay key not found'));
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => reject(new Error('Failed to load Razorpay SDK'));
      document.body.appendChild(script);
    });
  };

  const handleSubscription = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/auth/login?redirect=/subscription');
      return;
    }

    setError('');
    setLoading(true);

    try {
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

      await initializeRazorpay().catch(err => {
        console.error('Razorpay initialization error:', err);
        throw new Error(`Payment system initialization failed: ${err.message}`);
      });

      const options = {
        key: window?.ENV?.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: data.order.amount,
        currency: data.order.currency,
        name: 'PhantomWriter',
        description: `${data.plan.name} Subscription ($${data.plan.price} USD)`,
        order_id: data.order.id,
        notes: {
          original_amount_usd: data.plan.price,
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

            if (verifyData.success) {
              router.push('/dashboard?subscription=success');
            } else {
              throw new Error('Payment verification failed');
            }
          } catch (err) {
            setError('Payment verification failed. Please contact support.');
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
              <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg mb-6">
                {error}
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {Object.entries(SUBSCRIPTION_PLANS).map(([key, plan]) => (
                <div
                  key={key}
                  className={`bg-white rounded-lg p-6 cursor-pointer border-2 shadow-sm ${
                    selectedPlan === key ? 'border-orange-500' : 'border-gray'
                  }`}
                  onClick={() => setSelectedPlan(key)}
                >
                  <h3 className="text-xl font-bold text-gray-800 mb-4">{plan.name}</h3>
                  <div className="mb-4">
                    <p className="text-5xl font-extrabold text-gray-800">
                      ${plan.price}
                      <span className="text-xl text-gray-600">
                        {key === 'monthly' ? '/month' : '/year'}
                      </span>
                    </p>
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
                      <span>Unlimited AI-generated LinkedIn posts</span>
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
                    onClick={handleSubscription}
                    disabled={loading}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                  >
                    {loading ? 'Processing...' : `Choose ${plan.name}`}
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
