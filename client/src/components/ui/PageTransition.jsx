import React from 'react';
import { motion } from 'framer-motion';
import { motionVariants } from '../../design/motion';

export default function PageTransition({ children }) {
  return (
    <motion.div
      initial={motionVariants.pageTransition.initial}
      animate={motionVariants.pageTransition.animate}
      exit={motionVariants.pageTransition.exit}
      transition={motionVariants.pageTransition.transition}
    >
      {children}
    </motion.div>
  );
}
