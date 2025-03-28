'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function CustomCursor() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);

  useEffect(() => {
    const updateMousePosition = e => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    const handleMouseEnter = e => {
      if (
        e.target.tagName === 'BUTTON' ||
        e.target.tagName === 'A' ||
        e.target.closest('button') ||
        e.target.closest('a')
      ) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);

    window.addEventListener('mousemove', updateMousePosition);
    document.addEventListener('mouseover', handleMouseEnter);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', updateMousePosition);
      document.removeEventListener('mouseover', handleMouseEnter);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  return (
    <>
      {/* Main cursor */}
      <motion.div
        className="fixed top-0 left-0 w-4 h-4 rounded-full pointer-events-none z-50"
        animate={{
          x: mousePosition.x - 8,
          y: mousePosition.y - 8,
          scale: isClicking ? 0.8 : 1,
          backgroundColor: isHovering ? 'rgba(255, 87, 34, 0.5)' : 'rgba(255, 87, 34, 0.2)',
          borderColor: isHovering ? '#ff5722' : 'rgba(255, 87, 34, 0.5)',
        }}
        transition={{
          type: 'spring',
          stiffness: 150,
          damping: 15,
          mass: 0.1,
        }}
        style={{
          border: '2px solid',
        }}
      />

      {/* Cursor trail */}
      <motion.div
        className="fixed top-0 left-0 w-8 h-8 rounded-full pointer-events-none z-40"
        animate={{
          x: mousePosition.x - 16,
          y: mousePosition.y - 16,
          scale: isHovering ? 1.5 : 1,
          backgroundColor: isHovering ? 'rgba(255, 87, 34, 0.1)' : 'rgba(255, 87, 34, 0.05)',
        }}
        transition={{
          type: 'spring',
          stiffness: 100,
          damping: 25,
          mass: 0.2,
        }}
      />

      {/* Interactive elements highlight */}
      {isHovering && (
        <motion.div
          className="fixed top-0 left-0 w-12 h-12 rounded-full pointer-events-none z-30"
          animate={{
            x: mousePosition.x - 24,
            y: mousePosition.y - 24,
            scale: isClicking ? 0.9 : 1,
          }}
          transition={{
            type: 'spring',
            stiffness: 150,
            damping: 15,
          }}
          style={{
            background:
              'radial-gradient(circle, rgba(255, 87, 34, 0.1) 0%, rgba(255, 87, 34, 0) 70%)',
          }}
        />
      )}

      {/* Background glow effect */}
      <motion.div
        className="fixed top-0 left-0 w-32 h-32 rounded-full pointer-events-none z-30 blur-xl"
        animate={{
          x: mousePosition.x - 64,
          y: mousePosition.y - 64,
          scale: isHovering ? 1.5 : 1,
          opacity: isHovering ? 0.2 : 0.1,
        }}
        transition={{
          type: 'spring',
          stiffness: 50,
          damping: 20,
          mass: 0.5,
        }}
        style={{
          background:
            'radial-gradient(circle, rgba(255, 87, 34, 0.2) 0%, rgba(255, 87, 34, 0) 70%)',
        }}
      />
    </>
  );
}
