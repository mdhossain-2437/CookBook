import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

const ParticleBackground = ({ 
  count = 40, 
  colors = ['#FF5A5F', '#3CAEA3', '#F8C630'], 
  minSize = 5, 
  maxSize = 20,
  speed = 1,
  className = '',
  dark = false
}) => {
  const containerRef = useRef(null);
  
  // Generate random particles
  const particles = Array.from({ length: count }).map((_, i) => ({
    id: i,
    x: Math.random() * 100, // random position as percentage
    y: Math.random() * 100,
    size: minSize + Math.random() * (maxSize - minSize),
    color: colors[Math.floor(Math.random() * colors.length)],
    duration: 10 + Math.random() * 30 / speed, // random duration for movement
    opacity: 0.1 + Math.random() * 0.3, // random opacity
  }));

  return (
    <div 
      ref={containerRef}
      className={`fixed inset-0 overflow-hidden pointer-events-none z-0 ${className}`}
      aria-hidden="true"
    >
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full"
          style={{
            width: particle.size,
            height: particle.size,
            backgroundColor: particle.color,
            opacity: dark ? particle.opacity * 0.7 : particle.opacity,
            filter: `blur(${particle.size / 4}px)`,
            x: `${particle.x}vw`,
            y: `${particle.y}vh`,
          }}
          animate={{
            x: [
              `${particle.x}vw`,
              `${(particle.x + (Math.random() * 20 - 10)) % 100}vw`,
              `${(particle.x + (Math.random() * 20 - 10)) % 100}vw`,
              `${particle.x}vw`,
            ],
            y: [
              `${particle.y}vh`,
              `${(particle.y + (Math.random() * 20 - 10)) % 100}vh`,
              `${(particle.y + (Math.random() * 20 - 10)) % 100}vh`,
              `${particle.y}vh`,
            ],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
};

export default ParticleBackground;