import React, { useEffect, useRef, useState } from 'react';

const InteractiveBackground = ({
  className = '',
  dotColor = 'rgba(255, 255, 255, 0.3)',
  lineColor = 'rgba(255, 255, 255, 0.1)',
  dotSize = 2,
  dotSpacing = 30,
  lineThickness = 1,
  interactionRadius = 100,
  interactionIntensity = 5,
  animate = true,
  responsive = true,
  children,
}) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isMouseInCanvas, setIsMouseInCanvas] = useState(false);
  const animationRef = useRef(null);
  const dotsRef = useRef([]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setDimensions({ width, height });
      }
    };

    handleResize();
    if (responsive) {
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, [responsive]);

  // Initialize dots
  useEffect(() => {
    if (dimensions.width === 0 || dimensions.height === 0) return;

    const { width, height } = dimensions;
    const dots = [];

    // Create grid of dots
    for (let x = dotSpacing; x < width; x += dotSpacing) {
      for (let y = dotSpacing; y < height; y += dotSpacing) {
        dots.push({
          x,
          y,
          originalX: x,
          originalY: y,
          vx: 0,
          vy: 0,
        });
      }
    }

    dotsRef.current = dots;
  }, [dimensions, dotSpacing]);

  // Handle mouse movement
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!containerRef.current) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      setMousePosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
      setIsMouseInCanvas(true);
    };

    const handleMouseLeave = () => {
      setIsMouseInCanvas(false);
    };

    if (containerRef.current) {
      containerRef.current.addEventListener('mousemove', handleMouseMove);
      containerRef.current.addEventListener('mouseleave', handleMouseLeave);
    }

    return () => {
      if (containerRef.current) {
        containerRef.current.removeEventListener('mousemove', handleMouseMove);
        containerRef.current.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, []);

  // Animation loop
  useEffect(() => {
    if (!canvasRef.current || dotsRef.current.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const draw = () => {
      if (!canvas || !ctx) return;

      ctx.clearRect(0, 0, dimensions.width, dimensions.height);

      // Update dot positions based on mouse interaction
      dotsRef.current.forEach(dot => {
        if (isMouseInCanvas && animate) {
          const dx = mousePosition.x - dot.x;
          const dy = mousePosition.y - dot.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < interactionRadius) {
            const force = (interactionRadius - distance) / interactionRadius;
            const angle = Math.atan2(dy, dx);
            const targetX = dot.x - Math.cos(angle) * force * interactionIntensity;
            const targetY = dot.y - Math.sin(angle) * force * interactionIntensity;
            
            // Apply spring physics
            dot.vx += (targetX - dot.x) * 0.1;
            dot.vy += (targetY - dot.y) * 0.1;
          }

          // Apply spring back to original position
          dot.vx += (dot.originalX - dot.x) * 0.05;
          dot.vy += (dot.originalY - dot.y) * 0.05;
          
          // Apply friction
          dot.vx *= 0.9;
          dot.vy *= 0.9;
          
          // Update position
          dot.x += dot.vx;
          dot.y += dot.vy;
        } else {
          // Return to original position when no interaction
          dot.x += (dot.originalX - dot.x) * 0.1;
          dot.y += (dot.originalY - dot.y) * 0.1;
        }
      });

      // Draw connections between dots
      ctx.beginPath();
      ctx.strokeStyle = lineColor;
      ctx.lineWidth = lineThickness;

      for (let i = 0; i < dotsRef.current.length; i++) {
        const dot1 = dotsRef.current[i];
        
        for (let j = i + 1; j < dotsRef.current.length; j++) {
          const dot2 = dotsRef.current[j];
          const dx = dot1.x - dot2.x;
          const dy = dot1.y - dot2.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < dotSpacing * 1.5) {
            ctx.beginPath();
            ctx.moveTo(dot1.x, dot1.y);
            ctx.lineTo(dot2.x, dot2.y);
            ctx.stroke();
          }
        }
      }

      // Draw dots
      ctx.fillStyle = dotColor;
      dotsRef.current.forEach(dot => {
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, dotSize, 0, Math.PI * 2);
        ctx.fill();
      });

      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [dimensions, dotColor, lineColor, dotSize, dotSpacing, lineThickness, 
      interactionRadius, interactionIntensity, mousePosition, isMouseInCanvas, animate]);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <canvas
        ref={canvasRef}
        width={dimensions.width}
        height={dimensions.height}
        className="absolute inset-0 pointer-events-none z-0"
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
};

export default InteractiveBackground;