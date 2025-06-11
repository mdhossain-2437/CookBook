import React, { useState } from 'react';
import { motion } from 'framer-motion';

const MorphingCard = ({
  frontContent,
  backContent,
  className = '',
  width = 'w-full',
  height = 'h-auto',
  rounded = 'rounded-xl',
  shadow = 'shadow-lg',
  hoverScale = 1.05,
  tapScale = 0.95,
  duration = 0.6,
  bgFront = 'bg-white dark:bg-gray-800',
  bgBack = 'bg-primary/10 dark:bg-primary/20',
  borderColor = 'border-gray-200 dark:border-gray-700',
  onClick,
}) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
    if (onClick) onClick();
  };

  const cardVariants = {
    front: {
      rotateY: 0,
      transition: { duration }
    },
    back: {
      rotateY: 180,
      transition: { duration }
    }
  };

  const contentVariants = {
    front: {
      rotateY: 0,
      opacity: 1,
      transition: { duration, delay: 0 }
    },
    back: {
      rotateY: 0,
      opacity: 0,
      transition: { duration: duration / 2, delay: 0 }
    }
  };

  const backContentVariants = {
    front: {
      rotateY: -180,
      opacity: 0,
      transition: { duration: duration / 2, delay: 0 }
    },
    back: {
      rotateY: -180,
      opacity: 1,
      transition: { duration, delay: duration / 2 }
    }
  };

  return (
    <motion.div
      className={`perspective-1000 ${width} ${height} ${className}`}
      whileHover={{ scale: hoverScale }}
      whileTap={{ scale: tapScale }}
    >
      <motion.div
        className={`relative w-full h-full preserve-3d cursor-pointer ${rounded} ${shadow} border ${borderColor} overflow-hidden`}
        onClick={handleFlip}
        animate={isFlipped ? 'back' : 'front'}
        variants={cardVariants}
      >
        {/* Front Content */}
        <motion.div
          className={`absolute inset-0 backface-hidden ${bgFront} p-4 flex flex-col`}
          variants={contentVariants}
          animate={isFlipped ? 'back' : 'front'}
        >
          {frontContent}
        </motion.div>

        {/* Back Content */}
        <motion.div
          className={`absolute inset-0 backface-hidden ${bgBack} p-4 flex flex-col`}
          variants={backContentVariants}
          animate={isFlipped ? 'back' : 'front'}
        >
          {backContent}
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default MorphingCard;