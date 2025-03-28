'use client';

import { motion } from 'framer-motion';
import { useRef } from 'react';

const FeatureCard = ({ icon, title, description, index }) => {
  const cardRef = useRef(null);

  const handleMouseMove = e => {
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = (y - centerY) / 20;
    const rotateY = (centerX - x) / 20;

    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  };

  const handleMouseLeave = () => {
    cardRef.current.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
  };

  return (
    <motion.div
      ref={cardRef}
      className="relative p-8 rounded-2xl bg-white border border-orange-100 hover:border-orange-300 shadow-lg hover:shadow-orange-100/50 transition-all duration-300"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-orange-50/50 to-transparent rounded-2xl opacity-0 hover:opacity-100 transition-opacity" />
      <div className="relative">
        <div className="text-4xl mb-4">{icon}</div>
        <h3 className="text-xl font-semibold mb-3 text-gray-900">{title}</h3>
        <p className="text-gray-600">{description}</p>
      </div>
    </motion.div>
  );
};

export default function Features() {
  const features = [
    {
      icon: '🤖',
      title: 'AI Content Generation',
      description:
        'Generate high-quality, engaging LinkedIn posts tailored to your industry and audience in seconds.',
    },
    {
      icon: '📊',
      title: 'Smart Analytics',
      description:
        'Track post performance, audience engagement, and growth metrics with detailed analytics dashboard.',
    },
    {
      icon: '🎯',
      title: 'Optimal Scheduling',
      description:
        'AI-powered scheduling system that posts your content when your audience is most active.',
    },
    {
      icon: '🔄',
      title: 'Content Recycling',
      description:
        'Automatically repurpose and refresh your best-performing content for consistent engagement.',
    },
    {
      icon: '🎨',
      title: 'Template Library',
      description:
        'Access hundreds of customizable templates for different types of LinkedIn content.',
    },
    {
      icon: '📱',
      title: 'Multi-device Support',
      description: 'Manage your LinkedIn presence seamlessly across all your devices.',
    },
  ];

  return (
    <section className="relative py-20 bg-gray-50/50 overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0">
        <div className="absolute w-[500px] h-[500px] bg-orange-500/5 rounded-full blur-[80px] top-0 -right-32" />
        <div className="absolute w-[500px] h-[500px] bg-orange-400/5 rounded-full blur-[80px] bottom-0 -left-32" />
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
            <span className="text-sm font-medium text-orange-600">✨ Powerful Features</span>
          </motion.div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
            Everything you need to
            <br />
            <span className="bg-gradient-to-r from-orange-600 to-orange-400 bg-clip-text text-transparent">
              dominate LinkedIn
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Boost your LinkedIn presence with our comprehensive suite of AI-powered tools and
            features
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
