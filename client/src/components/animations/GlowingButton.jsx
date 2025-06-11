import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

const GlowingButton = ({
  children,
  className = '',
  glowColor = 'rgba(255, 90, 95, 0.6)',  // Default to primary color
  glowSize = 80,
  glowIntensity = 0.8,
  hoverScale = 1.05,
  tapScale = 0.95,
  disabled = false,
  onClick,
  ...props
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const buttonRef = useRef(null);

  // Handle mouse move to update glow position
  const handleMouseMove = (e) => {
    if (!buttonRef.current || disabled) return;
    
    const rect = buttonRef.current.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  // Reset position when mouse leaves
  useEffect(() => {
    if (!isHovered && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setMousePosition({
        x: rect.width / 2,
        y: rect.height / 2
      });
    }
  }, [isHovered]);

  return (
    <motion.button
      ref={buttonRef}
      className={`relative overflow-hidden ${className}`}
      whileHover={{ scale: disabled ? 1 : hoverScale }}
      whileTap={{ scale: disabled ? 1 : tapScale }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onMouseMove={handleMouseMove}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      {...props}
    >
      {/* Glow effect */}
      {!disabled && (
        <motion.div
          className="absolute pointer-events-none"
          animate={{
            opacity: isHovered ? glowIntensity : 0,
            scale: isHovered ? 1 : 0.5,
          }}
          transition={{ duration: 0.3 }}
          style={{
            width: glowSize,
            height: glowSize,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${glowColor} 0%, rgba(255,255,255,0) 70%)`,
            left: mousePosition.x - glowSize / 2,
            top: mousePosition.y - glowSize / 2,
          }}
        />
      )}
      
      {/* Button content */}
      <div className="relative z-10">{children}</div>
    </motion.button>
  );
};

export default GlowingButton;