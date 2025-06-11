import React from 'react';
import { motion } from 'framer-motion';

const FloatingElements = ({
  elements = [
    { type: 'circle', size: 40, color: 'primary', blur: 20 },
    { type: 'square', size: 60, color: 'secondary', blur: 30 },
    { type: 'triangle', size: 50, color: 'accent', blur: 25 },
    { type: 'donut', size: 70, color: 'primary', blur: 15 },
    { type: 'cross', size: 45, color: 'secondary', blur: 10 },
  ],
  className = '',
  zIndex = -1,
  speed = 1,
  density = 1,
}) => {
  // Generate positions for elements
  const positions = elements.flatMap((element, index) => {
    // Create multiple instances of each element based on density
    return Array.from({ length: Math.ceil(density) }).map((_, i) => {
      const uniqueId = `${index}-${i}`;
      return {
        ...element,
        id: uniqueId,
        x: Math.random() * 100, // random position as percentage
        y: Math.random() * 100,
        rotation: Math.random() * 360,
        duration: (20 + Math.random() * 40) / speed,
        delay: Math.random() * 5,
      };
    });
  });

  // Render different shapes based on type
  const renderShape = (element) => {
    const { type, size, color } = element;
    const colorClass = `text-${color}`;
    
    switch (type) {
      case 'circle':
        return (
          <div 
            className={`rounded-full ${colorClass}`}
            style={{ 
              width: size, 
              height: size, 
              background: `currentColor`,
            }}
          />
        );
      case 'square':
        return (
          <div 
            className={`${colorClass}`}
            style={{ 
              width: size, 
              height: size, 
              background: `currentColor`,
            }}
          />
        );
      case 'triangle':
        return (
          <div 
            className={`${colorClass}`}
            style={{ 
              width: 0, 
              height: 0, 
              borderLeft: `${size/2}px solid transparent`,
              borderRight: `${size/2}px solid transparent`,
              borderBottom: `${size}px solid currentColor`,
            }}
          />
        );
      case 'donut':
        return (
          <div 
            className={`rounded-full ${colorClass} flex items-center justify-center`}
            style={{ 
              width: size, 
              height: size, 
              background: `transparent`,
              border: `${size/6}px solid currentColor`,
            }}
          />
        );
      case 'cross':
        return (
          <div className="relative" style={{ width: size, height: size }}>
            <div 
              className={`absolute top-1/2 left-0 -translate-y-1/2 ${colorClass}`}
              style={{ 
                height: size/5, 
                width: size,
                background: `currentColor`,
              }}
            />
            <div 
              className={`absolute top-0 left-1/2 -translate-x-1/2 ${colorClass}`}
              style={{ 
                width: size/5, 
                height: size,
                background: `currentColor`,
              }}
            />
          </div>
        );
      default:
        return (
          <div 
            className={`rounded-full ${colorClass}`}
            style={{ 
              width: size, 
              height: size, 
              background: `currentColor`,
            }}
          />
        );
    }
  };

  return (
    <div 
      className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}
      style={{ zIndex }}
      aria-hidden="true"
    >
      {positions.map((element) => (
        <motion.div
          key={element.id}
          className="absolute opacity-10"
          style={{
            x: `${element.x}%`,
            y: `${element.y}%`,
            filter: `blur(${element.blur}px)`,
          }}
          animate={{
            x: [
              `${element.x}%`,
              `${(element.x + (Math.random() * 20 - 10)) % 100}%`,
              `${(element.x + (Math.random() * 20 - 10)) % 100}%`,
              `${element.x}%`,
            ],
            y: [
              `${element.y}%`,
              `${(element.y + (Math.random() * 20 - 10)) % 100}%`,
              `${(element.y + (Math.random() * 20 - 10)) % 100}%`,
              `${element.y}%`,
            ],
            rotate: [element.rotation, element.rotation + 180, element.rotation + 360],
          }}
          transition={{
            duration: element.duration,
            delay: element.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {renderShape(element)}
        </motion.div>
      ))}
    </div>
  );
};

export default FloatingElements;