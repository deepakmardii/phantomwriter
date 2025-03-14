"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { SUBSCRIPTION_PLANS } from "@/utils/razorpay";

export default function Subscription() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedPlan, setSelectedPlan] = useState("monthly");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/auth/login");
    }
  }, [router]);

  const initializeRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleSubscription = async () => {
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ plan: selectedPlan }),
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.message || "Failed to create order");
      }

      const razorpayLoaded = await initializeRazorpay();

      if (!razorpayLoaded) {
        throw new Error("Razorpay SDK failed to load");
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: data.order.amount,
        currency: data.order.currency,
        name: "PhantomWriter",
        description: `${data.plan.name} Subscription`,
        order_id: data.order.id,
        handler: async (response) => {
          try {
            const verifyRes = await fetch("/api/payment/verify", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`,
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
              router.push("/dashboard?subscription=success");
            } else {
              throw new Error("Payment verification failed");
            }
          } catch (err) {
            setError("Payment verification failed. Please contact support.");
          }
        },
        prefill: {
          name: "User Name",
          email: "user@example.com",
        },
        theme: {
          color: "#2563EB",
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
    <div className="min-h-screen bg-gray-900">
      <nav className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="text-xl font-bold text-white">PhantomWriter</div>
            <button
              onClick={() => router.push("/dashboard")}
              className="text-gray-300 hover:text-white"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-gray-800 rounded-lg shadow px-5 py-6 sm:px-6">
            <h2 className="text-2xl font-bold text-white mb-8 text-center">
              Choose Your Plan
            </h2>

            {error && (
              <div className="bg-red-600 text-white p-3 rounded mb-6">
                {error}
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {Object.entries(SUBSCRIPTION_PLANS).map(([key, plan]) => (
                <div
                  key={key}
                  className={`bg-gray-700 rounded-lg p-6 cursor-pointer border-2 ${
                    selectedPlan === key
                      ? "border-blue-500"
                      : "border-transparent"
                  }`}
                  onClick={() => setSelectedPlan(key)}
                >
                  <h3 className="text-xl font-bold text-white mb-4">
                    {plan.name}
                  </h3>
                  <p className="text-3xl font-bold text-white mb-4">
                    ₹{plan.price}
                    <span className="text-lg text-gray-400">/mo</span>
                  </p>
                  <ul className="text-gray-300 space-y-2 mb-6">
                    <li>✓ Unlimited AI-generated posts</li>
                    <li>✓ Advanced analytics</li>
                    <li>✓ Priority support</li>
                    <li>✓ Custom tone settings</li>
                  </ul>
                  <button
                    onClick={handleSubscription}
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    {loading ? "Processing..." : `Choose ${plan.name}`}
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
