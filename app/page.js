'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useCallback, useEffect, useState, useMemo } from 'react';
import Hero from './components/landing/Hero';
import Features from './components/landing/Features';
import HowItWorks from './components/landing/HowItWorks';
import Testimonials from './components/landing/Testimonials';
import Pricing from './components/landing/Pricing';
import CTA from './components/landing/CTA';
import MobileNav from './components/landing/MobileNav';
import LoadingScreen from './components/landing/LoadingScreen';

const SmoothScroll = ({ children }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {children}
    </motion.div>
  );
};

const NavDot = ({ active, onClick }) => (
  <button
    className={`w-3 h-3 rounded-full transition-all duration-300 ${
      active ? 'bg-orange-500 w-6' : 'bg-orange-200 hover:bg-orange-300'
    }`}
    onClick={onClick}
  />
);

export default function Home() {
  const [activeSection, setActiveSection] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const [pageLoaded, setPageLoaded] = useState(false);

  const sections = useMemo(() => ['hero', 'features', 'how', 'testimonials', 'pricing', 'cta'], []);

  const handleScroll = useCallback(() => {
    if (isScrolling) return;

    const sectionElements = sections.map(section => document.getElementById(section));

    const currentPosition = window.scrollY + window.innerHeight / 2;

    sectionElements.forEach((section, index) => {
      if (!section) return;

      const sectionTop = section.offsetTop;
      const sectionBottom = sectionTop + section.offsetHeight;

      if (currentPosition >= sectionTop && currentPosition <= sectionBottom) {
        setActiveSection(index);
      }
    });
  }, [isScrolling, sections]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPageLoaded(true);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  const scrollToSection = index => {
    setIsScrolling(true);
    const section = document.getElementById(sections[index]);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => setIsScrolling(false), 1000);
    }
  };

  return (
    <AnimatePresence mode="wait">
      {/* Loading Screen */}
      <LoadingScreen />

      <SmoothScroll>
        {/* Mobile Navigation */}
        <MobileNav />

        <main className="relative bg-white text-gray-900">
          {/* Fixed background gradients */}
          <div className="fixed inset-0 overflow-hidden pointer-events-none">
            <div className="absolute w-[1000px] h-[1000px] bg-orange-500/5 rounded-full blur-[120px] -top-[500px] -left-[300px]" />
            <div className="absolute w-[1000px] h-[1000px] bg-orange-400/5 rounded-full blur-[120px] top-[200px] -right-[300px]" />
            <div className="absolute w-[800px] h-[800px] bg-orange-500/5 rounded-full blur-[120px] bottom-[-400px] left-[300px]" />
          </div>

          {/* Navigation dots */}
          <motion.div
            className="fixed right-6 top-1/2 -translate-y-1/2 z-50 hidden lg:flex flex-col gap-4"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: pageLoaded ? 1 : 0, x: pageLoaded ? 0 : 100 }}
            transition={{ delay: 1 }}
          >
            {sections.map((_, index) => (
              <NavDot
                key={index}
                active={activeSection === index}
                onClick={() => scrollToSection(index)}
              />
            ))}
          </motion.div>

          {/* Content sections */}
          <div className="relative">
            <section id="hero" className="min-h-screen">
              <Hero />
            </section>
            <section id="features">
              <Features />
            </section>
            <section id="how">
              <HowItWorks />
            </section>
            <section id="testimonials">
              <Testimonials />
            </section>
            <section id="pricing">
              <Pricing />
            </section>
            <section id="cta">
              <CTA />
            </section>

            {/* Footer */}
            <footer className="relative py-12 bg-gradient-to-b from-orange-50/50 to-white">
              <div className="container mx-auto px-4">
                <div className="grid md:grid-cols-4 gap-8">
                  {[
                    {
                      title: 'Product',
                      links: ['Features', 'Pricing', 'API', 'Documentation'],
                    },
                    {
                      title: 'Company',
                      links: ['About', 'Blog', 'Careers', 'Contact'],
                    },
                    {
                      title: 'Resources',
                      links: ['Community', 'Help Center', 'Support', 'Status'],
                    },
                    {
                      title: 'Legal',
                      links: ['Privacy', 'Terms', 'Security', 'Compliance'],
                    },
                  ].map((column, i) => (
                    <div key={i}>
                      <h3 className="text-gray-900 font-semibold mb-4">{column.title}</h3>
                      <ul className="space-y-2">
                        {column.links.map((link, j) => (
                          <li
                            key={j}
                            className="hover:text-orange-500 cursor-pointer transition-colors text-gray-600"
                          >
                            {link}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
                <div className="mt-12 pt-8 border-t border-orange-100 text-center">
                  <p className="text-gray-500">
                    &copy; {new Date().getFullYear()} Your Company. All rights reserved.
                  </p>
                </div>
              </div>
            </footer>
          </div>
        </main>
      </SmoothScroll>
    </AnimatePresence>
  );
}
