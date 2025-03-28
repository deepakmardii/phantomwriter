'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';

const PricingCard = ({ plan, isPopular, index }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      className={`relative p-8 rounded-2xl bg-white ${
        isPopular
          ? 'border-2 border-orange-500 shadow-2xl shadow-orange-100/50'
          : 'border border-orange-100 shadow-xl shadow-orange-50/20'
      } ${isHovered ? 'scale-105' : 'scale-100'} transition-all duration-300`}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {isPopular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <div className="px-4 py-1 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 text-white text-sm font-medium shadow-lg shadow-orange-500/20">
            Most Popular
          </div>
        </div>
      )}

      <div className="relative">
        {/* Plan name and price */}
        <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
        <div className="flex items-baseline mb-2">
          <span className="text-4xl font-bold text-gray-900">${plan.price}</span>
          <span className="text-gray-500 ml-2">{plan.period}</span>
        </div>
        {plan.savings && (
          <div className="mb-4">
            <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
              {plan.savings}
            </span>
          </div>
        )}
        {plan.monthly && (
          <p className="text-gray-600 text-sm mb-4">
            That&apos;s just ${plan.monthly}/month, billed annually
          </p>
        )}

        {/* Trial badge */}
        <div className="mb-6">
          <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
            3 Days Free Trial
          </span>
        </div>

        {/* Features list */}
        <ul className="space-y-4 mb-8">
          <li className="flex items-center gap-3">
            <svg
              className="w-5 h-5 text-orange-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <span className="text-gray-700">45 AI-generated posts per month</span>
          </li>
          <li className="flex items-center gap-3">
            <svg
              className="w-5 h-5 text-orange-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <span className="text-gray-700">Advanced tone & style customization</span>
          </li>
          <li className="flex items-center gap-3">
            <svg
              className="w-5 h-5 text-orange-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <span className="text-gray-700">Direct LinkedIn integration</span>
          </li>
          <li className="flex items-center gap-3">
            <svg
              className="w-5 h-5 text-orange-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <span className="text-gray-700">Schedule & auto-publish posts</span>
          </li>
          <li className="flex items-center gap-3">
            <svg
              className="w-5 h-5 text-orange-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <span className="text-gray-700">Post performance analytics</span>
          </li>
          <li className="flex items-center gap-3">
            <svg
              className="w-5 h-5 text-orange-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <span className="text-gray-700">Priority email support</span>
          </li>
        </ul>

        {/* CTA Button */}
        <button
          className={`w-full py-4 rounded-xl font-semibold transition-all duration-300 ${
            isPopular
              ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:opacity-90'
              : 'bg-orange-50 text-orange-600 hover:bg-orange-100'
          }`}
        >
          Get Started
        </button>
      </div>
    </motion.div>
  );
};

export default function Pricing() {
  const plans = [
    {
      name: 'Monthly Plan',
      price: '49',
      period: '/month',
      savings: null,
      features: true,
    },
    {
      name: 'Yearly Plan',
      price: '299',
      period: '/year',
      savings: '50% off',
      monthly: '25',
      features: true,
    },
  ];

  return (
    <section className="relative py-20 bg-gray-50/50 overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0">
        <div className="absolute w-[500px] h-[500px] bg-orange-500/5 rounded-full blur-[80px] top-0 left-0" />
        <div className="absolute w-[500px] h-[500px] bg-orange-400/5 rounded-full blur-[80px] bottom-0 right-0" />
      </div>

      <div className="relative container mx-auto px-4">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <motion.div
            className="inline-block mb-4 px-4 py-1 rounded-full bg-orange-50 border border-orange-100"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-sm font-medium text-orange-600">💎 Simple Pricing</span>
          </motion.div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
            Ready to Supercharge Your LinkedIn Presence?
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Choose your plan and start generating engaging LinkedIn content with AI today. Save 50%
            with yearly billing!
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan, index) => (
            <PricingCard key={index} plan={plan} isPopular={index === 1} index={index} />
          ))}
        </div>

        {/* Additional Information */}
        <div className="mt-16 text-center">
          <p className="text-gray-500 mb-4">All plans include:</p>
          <div className="flex flex-wrap justify-center gap-6">
            {[
              'LinkedIn Integration',
              'Performance Analytics',
              'Scheduled Posts',
              'AI-Powered Content',
              'Priority Support',
            ].map((feature, index) => (
              <span key={index} className="inline-flex items-center text-gray-600">
                <svg
                  className="w-4 h-4 mr-2 text-orange-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                </svg>
                {feature}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
