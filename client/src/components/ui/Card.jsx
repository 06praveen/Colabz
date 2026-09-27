import React from 'react';
import { motion } from 'framer-motion';

export default function Card({
  children,
  interactive = false,
  className = '',
  ...props
}) {
  return (
    <motion.div
      whileHover={interactive ? { y: -2 } : {}}
      className={`clb-card ${interactive ? 'clb-card-interactive' : ''} ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
}
