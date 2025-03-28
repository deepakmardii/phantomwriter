'use client';

import { motion } from 'framer-motion';

export default function Hero() {
  return (
    <section className="relative min-h-screen bg-white text-gray-900 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-[500px] h-[500px] bg-orange-500/10 rounded-full blur-[80px] -top-32 -left-32" />
        <div className="absolute w-[500px] h-[500px] bg-orange-400/10 rounded-full blur-[80px] top-32 -right-32" />
      </div>

      {/* Content */}
      <div className="relative container mx-auto px-4 pt-32 pb-20">
        <motion.div
          className="max-w-4xl mx-auto text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            className="inline-block mb-4 px-4 py-1 rounded-full bg-orange-50 border border-orange-100"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <span className="text-sm font-medium text-orange-600">
              🚀 Next-gen AI Content Platform
            </span>
          </motion.div>

          <motion.h1
            className="text-5xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-orange-600 to-orange-400"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            Transform Your
            <br />
            LinkedIn Game
          </motion.h1>

          <motion.p
            className="text-xl md:text-2xl mb-8 text-gray-600"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            Create, schedule, and analyze engaging content with AI assistance.
            <br />
            Your personal LinkedIn growth assistant.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <button className="group relative px-8 py-4 rounded-lg text-lg font-semibold bg-gradient-to-r from-orange-600 to-orange-500 text-white hover:opacity-90 transition-all duration-200">
              Get Started Free
              <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-orange-600 to-orange-500 opacity-50 blur-lg group-hover:opacity-75 transition-opacity" />
            </button>
            <button className="px-8 py-4 rounded-lg text-lg font-semibold bg-white text-orange-600 border-2 border-orange-100 hover:bg-orange-50 transition-colors">
              Watch Demo
            </button>
          </motion.div>
        </motion.div>

        {/* Stats */}
        <motion.div
          className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
        >
          {[
            { value: '10K+', label: 'Active Users' },
            { value: '1M+', label: 'Posts Generated' },
            { value: '85%', label: 'Time Saved' },
            { value: '24/7', label: 'AI Support' },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-orange-600">{stat.value}</div>
              <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Mouse scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <div className="w-6 h-10 rounded-full border-2 border-orange-200 flex items-start justify-center p-1">
            <div className="w-1 h-2 bg-orange-400 rounded-full" />
          </div>
        </motion.div>

        {/* Floating elements */}
        <div className="absolute top-1/4 left-10 animate-float hidden lg:block">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-r from-orange-500/10 to-orange-400/10 backdrop-blur-3xl" />
        </div>
        <div
          className="absolute bottom-1/4 right-10 animate-float hidden lg:block"
          style={{ animationDelay: '-2s' }}
        >
          <div className="w-16 h-16 rounded-full bg-gradient-to-r from-orange-400/10 to-orange-300/10 backdrop-blur-3xl" />
        </div>
      </div>
    </section>
  );
}
