'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

const testimonials = [
  {
    name: 'Sarah Johnson',
    role: 'Marketing Director',
    company: 'TechCorp',
    image: '/avatars/avatar1.png',
    content:
      "The AI content generation is mind-blowing! I've saved hours of work and seen a 3x increase in engagement.",
    rating: 5,
  },
  {
    name: 'Michael Chen',
    role: 'Startup Founder',
    company: 'InnovateLabs',
    image: '/avatars/avatar2.png',
    content:
      'This tool has transformed how I maintain my LinkedIn presence. The scheduling features are particularly impressive.',
    rating: 5,
  },
  {
    name: 'Emma Davis',
    role: 'Content Strategist',
    company: 'GrowthCo',
    image: '/avatars/avatar3.png',
    content:
      'I was skeptical about AI-generated content, but this platform nails my tone of voice perfectly. Highly recommended!',
    rating: 5,
  },
  {
    name: 'Alex Thompson',
    role: 'Sales Director',
    company: 'SalesForce',
    image: '/avatars/avatar4.png',
    content:
      'The analytics insights have helped me optimize my content strategy. My posts now reach 5x more people.',
    rating: 5,
  },
];

const TestimonialCard = ({ testimonial, isActive }) => {
  return (
    <motion.div
      className={`absolute inset-0 transition-all duration-500 ${
        isActive ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'
      }`}
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: isActive ? 1 : 0, x: isActive ? 0 : 100 }}
      transition={{ duration: 0.5 }}
    >
      <div className="bg-white rounded-2xl p-8 shadow-xl shadow-orange-100/20 border border-orange-100">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-orange-100 overflow-hidden">
            {/* Placeholder for avatar */}
            <div className="w-full h-full bg-gradient-to-br from-orange-400 to-orange-600" />
          </div>
          <div>
            <h4 className="text-xl font-semibold text-gray-900">{testimonial.name}</h4>
            <p className="text-orange-600">{testimonial.role}</p>
            <p className="text-gray-500">{testimonial.company}</p>
          </div>
        </div>
        <p className="text-lg text-gray-700 mb-6">&ldquo;{testimonial.content}&rdquo;</p>
        <div className="flex gap-1">
          {[...Array(testimonial.rating)].map((_, i) => (
            <svg
              key={i}
              className="w-5 h-5 text-orange-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default function Testimonials() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex(current => (current + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative py-20 bg-white overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0">
        <div className="absolute w-[500px] h-[500px] bg-orange-500/5 rounded-full blur-[80px] -top-32 right-0" />
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
            <span className="text-sm font-medium text-orange-600">⭐️ Testimonials</span>
          </motion.div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
            Loved by professionals
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            See what our users have to say about their experience
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          <div className="relative h-[300px]">
            {testimonials.map((testimonial, index) => (
              <TestimonialCard
                key={index}
                testimonial={testimonial}
                index={index}
                isActive={activeIndex === index}
              />
            ))}
          </div>

          {/* Navigation dots */}
          <div className="flex justify-center gap-2 mt-8">
            {testimonials.map((_, index) => (
              <button
                key={index}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                  activeIndex === index ? 'bg-orange-500 w-8' : 'bg-orange-200 hover:bg-orange-300'
                }`}
                onClick={() => setActiveIndex(index)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
