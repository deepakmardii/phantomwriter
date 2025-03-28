'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';

const steps = [
  {
    title: 'Connect LinkedIn',
    description:
      'Seamlessly connect your LinkedIn profile with just one click. We handle the authentication securely.',
    icon: '🔗',
    color: 'from-orange-400 to-orange-500',
    preview: (
      <div className="relative w-full h-full bg-white rounded-lg overflow-hidden border border-orange-100">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-orange-500/20 flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-orange-500/30 flex items-center justify-center">
              <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center">
                <span className="text-2xl">🔗</span>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 inset-x-0 h-1/3 bg-gradient-to-t from-white to-transparent" />
      </div>
    ),
  },
  {
    title: 'Generate Content',
    description: 'Let AI create engaging posts based on your industry, tone, and target audience.',
    icon: '✨',
    color: 'from-orange-500 to-orange-600',
    preview: (
      <div className="relative w-full h-full bg-white rounded-lg overflow-hidden border border-orange-100 p-4">
        <div className="space-y-3">
          <div className="h-4 bg-orange-100 rounded-full w-3/4 animate-pulse" />
          <div className="h-4 bg-orange-100 rounded-full w-1/2 animate-pulse" />
          <div className="h-4 bg-orange-100 rounded-full w-5/6 animate-pulse" />
        </div>
      </div>
    ),
  },
  {
    title: 'Schedule Posts',
    description: 'Set your posting schedule or let AI optimize timing for maximum engagement.',
    icon: '📅',
    color: 'from-orange-600 to-orange-700',
    preview: (
      <div className="relative w-full h-full bg-white rounded-lg overflow-hidden border border-orange-100 p-4">
        <div className="grid grid-cols-7 gap-2">
          {[...Array(7)].map((_, i) => (
            <div
              key={i}
              className="aspect-square rounded-lg bg-orange-50 flex items-center justify-center"
            >
              <div
                className={`w-2 h-2 rounded-full ${i === 2 || i === 5 ? 'bg-orange-500' : 'bg-orange-200'}`}
              />
            </div>
          ))}
        </div>
      </div>
    ),
  },
];

export default function HowItWorks() {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <section className="relative py-20 bg-white overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0">
        <div className="absolute w-[500px] h-[500px] bg-orange-500/5 rounded-full blur-[80px] -top-32 -right-32" />
        <div className="absolute w-[500px] h-[500px] bg-orange-400/5 rounded-full blur-[80px] bottom-0 left-0" />
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
            <span className="text-sm font-medium text-orange-600">🎯 Simple Process</span>
          </motion.div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">How it works</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Get started in minutes with our simple three-step process
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Steps */}
          <div className="space-y-6">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                className={`relative p-6 rounded-xl cursor-pointer transition-all duration-300 ${
                  activeStep === index ? 'bg-orange-50 border border-orange-200' : ''
                }`}
                onClick={() => setActiveStep(index)}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-12 h-12 rounded-full bg-gradient-to-r ${step.color} flex items-center justify-center flex-shrink-0`}
                  >
                    <span className="text-2xl">{step.icon}</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2 text-gray-900">{step.title}</h3>
                    <p className="text-gray-600">{step.description}</p>
                  </div>
                </div>
                {activeStep === index && (
                  <motion.div
                    className="absolute inset-0 border-2 border-orange-400 rounded-xl"
                    layoutId="activeStep"
                  />
                )}
              </motion.div>
            ))}
          </div>

          {/* Preview */}
          <div className="relative aspect-square">
            <div className="absolute inset-0 bg-white rounded-2xl border border-orange-100 shadow-xl shadow-orange-100/20">
              {steps.map((step, index) => (
                <motion.div
                  key={index}
                  className="absolute inset-0 p-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: activeStep === index ? 1 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {step.preview}
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
