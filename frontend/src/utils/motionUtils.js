import { motion } from 'framer-motion';
import { useSettings } from '../context/SettingsContext';

// Animation variants for common animations
export const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 }
};

export const slideInLeft = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 }
};

export const slideInRight = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 }
};

export const scaleIn = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.9 }
};

// Custom motion components that respect animation settings
export const createMotionComponent = (Component) => {
  const MotionComponent = ({ 
    initial, 
    animate, 
    exit, 
    transition,
    variants,
    whileHover,
    whileTap,
    whileFocus,
    ...props 
  }) => {
    const { animationsEnabled } = useSettings();

    if (!animationsEnabled) {
      // Return regular div instead of motion component when animations are disabled
      return <Component {...props} />;
    }

    const MotionElement = motion[Component.displayName || Component.name || 'div'];
    return (
      <MotionElement
        initial={initial}
        animate={animate}
        exit={exit}
        transition={transition}
        variants={variants}
        whileHover={whileHover}
        whileTap={whileTap}
        whileFocus={whileFocus}
        {...props}
      />
    );
  };

  MotionComponent.displayName = `Motion${Component.displayName || Component.name || 'Component'}`;
  return MotionComponent;
};

// Pre-created motion components
export const MotionDiv = ({ 
  initial, 
  animate, 
  exit, 
  transition,
  variants,
  whileHover,
  whileTap,
  whileFocus,
  ...props 
}) => {
  const { animationsEnabled } = useSettings();

  if (!animationsEnabled) {
    return <div {...props} />;
  }

  return (
    <motion.div
      initial={initial}
      animate={animate}
      exit={exit}
      transition={transition}
      variants={variants}
      whileHover={whileHover}
      whileTap={whileTap}
      whileFocus={whileFocus}
      {...props}
    />
  );
};

export const MotionForm = ({ 
  initial, 
  animate, 
  exit, 
  transition,
  variants,
  whileHover,
  whileTap,
  whileFocus,
  ...props 
}) => {
  const { animationsEnabled } = useSettings();

  if (!animationsEnabled) {
    return <form {...props} />;
  }

  return (
    <motion.form
      initial={initial}
      animate={animate}
      exit={exit}
      transition={transition}
      variants={variants}
      whileHover={whileHover}
      whileTap={whileTap}
      whileFocus={whileFocus}
      {...props}
    />
  );
};

export const MotionButton = ({ 
  initial, 
  animate, 
  exit, 
  transition,
  variants,
  whileHover,
  whileTap,
  whileFocus,
  ...props 
}) => {
  const { animationsEnabled } = useSettings();

  if (!animationsEnabled) {
    return <button {...props} />;
  }

  return (
    <motion.button
      initial={initial}
      animate={animate}
      exit={exit}
      transition={transition}
      variants={variants}
      whileHover={whileHover}
      whileTap={whileTap}
      whileFocus={whileFocus}
      {...props}
    />
  );
};

export const MotionH1 = ({ 
  initial, 
  animate, 
  exit, 
  transition,
  variants,
  whileHover,
  whileTap,
  whileFocus,
  ...props 
}) => {
  const { animationsEnabled } = useSettings();

  if (!animationsEnabled) {
    return <h1 {...props} />;
  }

  return (
    <motion.h1
      initial={initial}
      animate={animate}
      exit={exit}
      transition={transition}
      variants={variants}
      whileHover={whileHover}
      whileTap={whileTap}
      whileFocus={whileFocus}
      {...props}
    />
  );
};

export const MotionP = ({ 
  initial, 
  animate, 
  exit, 
  transition,
  variants,
  whileHover,
  whileTap,
  whileFocus,
  ...props 
}) => {
  const { animationsEnabled } = useSettings();

  if (!animationsEnabled) {
    return <p {...props} />;
  }

  return (
    <motion.p
      initial={initial}
      animate={animate}
      exit={exit}
      transition={transition}
      variants={variants}
      whileHover={whileHover}
      whileTap={whileTap}
      whileFocus={whileFocus}
      {...props}
    />
  );
};