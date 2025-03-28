'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

export default function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { name: 'Features', href: '#features' },
    { name: 'How it Works', href: '#how' },
    { name: 'Testimonials', href: '#testimonials' },
    { name: 'Pricing', href: '#pricing' },
    { name: 'Get Started', href: '#cta', isButton: true },
  ];

  const menuVariants = {
    closed: {
      opacity: 0,
      x: '100%',
      transition: {
        duration: 0.3,
        staggerChildren: 0.1,
        staggerDirection: -1,
      },
    },
    open: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.3,
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    closed: { opacity: 0, x: 50 },
    open: { opacity: 1, x: 0 },
  };

  return (
    <>
      {/* Menu Button */}
      <button
        className="lg:hidden fixed top-6 right-6 z-50 w-12 h-12 rounded-full bg-white shadow-lg shadow-orange-100/20 border border-orange-100 flex items-center justify-center"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="relative w-6 h-5">
          <span
            className={`absolute w-full h-0.5 bg-orange-500 transform transition-all duration-300 ${
              isOpen ? 'rotate-45 top-2' : 'rotate-0 top-0'
            }`}
          />
          <span
            className={`absolute w-full h-0.5 bg-orange-500 top-2 transition-all duration-300 ${
              isOpen ? 'opacity-0' : 'opacity-100'
            }`}
          />
          <span
            className={`absolute w-full h-0.5 bg-orange-500 transform transition-all duration-300 ${
              isOpen ? '-rotate-45 top-2' : 'rotate-0 top-4'
            }`}
          />
        </div>
      </button>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-40 lg:hidden"
            initial="closed"
            animate="open"
            exit="closed"
            variants={menuVariants}
          >
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0 bg-white/90 backdrop-blur-xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />

            {/* Menu Content */}
            <motion.div className="absolute inset-y-0 right-0 w-full max-w-sm bg-white shadow-2xl shadow-orange-100/20">
              <div className="flex flex-col h-full px-6 py-20">
                {/* Menu Items */}
                <nav className="space-y-6">
                  {menuItems.map((item, i) => (
                    <motion.div key={i} variants={itemVariants} className="overflow-hidden">
                      <a
                        href={item.href}
                        className={`block text-2xl font-semibold ${
                          item.isButton
                            ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-lg text-center shadow-lg shadow-orange-100/50'
                            : 'text-gray-800 hover:text-orange-500 transition-colors'
                        }`}
                        onClick={() => setIsOpen(false)}
                      >
                        {item.name}
                      </a>
                    </motion.div>
                  ))}
                </nav>

                {/* Social Links */}
                <motion.div variants={itemVariants} className="mt-auto flex justify-center gap-6">
                  {['Twitter', 'LinkedIn', 'GitHub'].map((social, i) => (
                    <a
                      key={i}
                      href="#"
                      className="text-gray-400 hover:text-orange-500 transition-colors"
                    >
                      {social}
                    </a>
                  ))}
                </motion.div>

                {/* Contact Info */}
                <motion.div variants={itemVariants} className="mt-8 text-center text-gray-500">
                  <p className="mb-2">Need help?</p>
                  <a
                    href="mailto:support@company.com"
                    className="text-orange-500 hover:text-orange-600 transition-colors"
                  >
                    support@company.com
                  </a>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
