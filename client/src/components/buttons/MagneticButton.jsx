import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';

export default function MagneticButton({
  children,
  variant = 'primary', // primary | secondary | ghost
  icon: Icon = null,
  onClick,
  className = '',
  ...props
}) {
  const ref = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    if (!ref.current) return;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    const x = (e.clientX - (left + width / 2)) * 0.25;
    const y = (e.clientY - (top + height / 2)) * 0.25;
    setPosition({ x, y });
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
  };

  return (
    <motion.button
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: 'spring', stiffness: 250, damping: 18, mass: 0.5 }}
      whileTap={{ scale: 0.96 }}
      onClick={onClick}
      className={`clb-btn clb-btn-${variant} ${className}`}
      style={{
        position: 'relative',
        cursor: 'pointer',
      }}
      {...props}
    >
      <span>{children}</span>
      {Icon && (
        <motion.span
          animate={{ x: position.x * 0.2 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          style={{ display: 'inline-flex', alignItems: 'center' }}
        >
          <Icon size={16} />
        </motion.span>
      )}
    </motion.button>
  );
}
