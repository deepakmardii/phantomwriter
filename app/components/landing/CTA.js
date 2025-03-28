'use client';

import { motion } from 'framer-motion';

export default function CTA() {
  return (
    <section className="relative py-20 bg-gradient-to-b from-white to-orange-50 overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0">
        <div className="absolute w-[500px] h-[500px] bg-orange-500/10 rounded-full blur-[80px] top-0 left-0" />
        <div className="absolute w-[500px] h-[500px] bg-orange-400/10 rounded-full blur-[80px] bottom-0 right-0" />
      </div>

      <div className="relative container mx-auto px-4">
        <motion.div
          className="max-w-4xl mx-auto text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-orange-600 via-orange-500 to-orange-400 bg-clip-text text-transparent">
            Ready to revolutionize your LinkedIn presence?
          </h2>
          <p className="text-xl md:text-2xl text-gray-600 mb-12">
            Join thousands of professionals who are already using our platform to grow their network
          </p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <button className="group relative px-8 py-4 rounded-xl text-lg font-semibold bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:opacity-90 transition-all duration-200">
              Try Free for 3 Days
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 opacity-50 blur-xl group-hover:opacity-75 transition-opacity" />
            </button>
            <button className="px-8 py-4 rounded-xl text-lg font-semibold border-2 border-orange-200 text-orange-600 hover:bg-orange-50 transition-colors">
              View Pricing
            </button>
          </motion.div>

          {/* Pricing highlight */}
          <motion.div
            className="mt-12 py-8 px-6 rounded-2xl bg-white shadow-xl shadow-orange-100/20 border border-orange-100"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
          >
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Yearly Plan</h3>
            <p className="text-gray-600 mb-4">Most popular choice for professionals</p>
            <div className="mb-2">
              <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                Save 50%
              </span>
            </div>
            <div className="text-4xl font-bold text-orange-600 mb-2">
              $299<span className="text-lg text-gray-500">/year</span>
            </div>
            <p className="text-gray-600 mb-6">That&apos;s just $25/month, billed annually</p>
            <ul className="flex flex-wrap justify-center gap-x-8 gap-y-3 mb-6">
              <li className="flex items-center text-gray-700">
                <svg
                  className="w-5 h-5 mr-2 text-orange-500"
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
                45 Posts/Month
              </li>
              <li className="flex items-center text-gray-700">
                <svg
                  className="w-5 h-5 mr-2 text-orange-500"
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
                3 Days Free Trial
              </li>
              <li className="flex items-center text-gray-700">
                <svg
                  className="w-5 h-5 mr-2 text-orange-500"
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
                AI Scheduling
              </li>
            </ul>
            <button className="px-8 py-3 rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold hover:opacity-90 transition-opacity">
              Get Started with Yearly Plan
            </button>
          </motion.div>

          {/* Trust badges */}
          <motion.div
            className="mt-16 pt-16 border-t border-orange-100"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6 }}
          >
            <p className="text-sm text-gray-500 mb-8">Trusted by professionals from</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center justify-items-center">
              {[1, 2, 3, 4].map(index => (
                <div
                  key={index}
                  className="h-12 w-32 bg-white rounded-lg shadow-md shadow-orange-100/20 border border-orange-100 flex items-center justify-center"
                >
                  <div className="text-gray-400 font-medium">Logo {index}</div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Additional benefits */}
          <motion.div
            className="mt-16 grid md:grid-cols-3 gap-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.8 }}
          >
            {[
              {
                icon: '🔒',
                title: 'Secure & Private',
                description: 'Enterprise-grade security for your data',
              },
              {
                icon: '🚀',
                title: 'Quick Setup',
                description: 'Get started in less than 2 minutes',
              },
              {
                icon: '💬',
                title: '24/7 Support',
                description: 'Always here to help you succeed',
              },
            ].map((item, index) => (
              <div
                key={index}
                className="p-6 rounded-xl bg-white shadow-lg shadow-orange-100/20 border border-orange-100 hover:border-orange-200 transition-colors"
              >
                <div className="text-3xl mb-4">{item.icon}</div>
                <h3 className="text-lg font-semibold mb-2 text-gray-900">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
