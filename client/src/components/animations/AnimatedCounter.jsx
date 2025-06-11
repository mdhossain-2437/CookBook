import React, { useState, useEffect, useRef } from 'react';
import { useInView } from 'framer-motion';

const AnimatedCounter = ({
  from = 0,
  to,
  duration = 2000,
  delay = 0,
  formatter = (value) => Math.round(value),
  className = '',
  onComplete = () => {},
  suffix = '',
  prefix = '',
}) => {
  const [count, setCount] = useState(null);
  const countRef = useRef(null);
  const isInView = useInView(countRef, { once: true, margin: "-100px" });
  const startTimeRef = useRef(null);
  const animationFrameRef = useRef(null);

  useEffect(() => {
    if (!isInView) return;
    
    // Add delay before starting animation
    const delayTimeout = setTimeout(() => {
      startTimeRef.current = Date.now();
      
      const animate = () => {
        const now = Date.now();
        const elapsed = now - startTimeRef.current;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function for smoother animation
        const easeOutQuart = (x) => 1 - Math.pow(1 - x, 4);
        const easedProgress = easeOutQuart(progress);
        
        const currentCount = from + (to - from) * easedProgress;
        setCount(formatter(currentCount));
        
        if (progress < 1) {
          animationFrameRef.current = requestAnimationFrame(animate);
        } else {
          setCount(formatter(to));
          onComplete();
        }
      };
      
      animate();
    }, delay);
    
    return () => {
      clearTimeout(delayTimeout);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isInView, from, to, duration, delay, formatter, onComplete]);

  return (
    <span ref={countRef} className={className}>
      {count !== null ? `${prefix}${count}${suffix}` : `${prefix}${formatter(from)}${suffix}`}
    </span>
  );
};

export default AnimatedCounter;