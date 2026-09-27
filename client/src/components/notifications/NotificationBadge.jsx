import React from 'react';
import { motion } from 'framer-motion';

export default function NotificationBadge({ count }) {
  if (count <= 0) return null;

  return (
    <motion.span
      key={count}
      initial={{ scale: 0.6, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.6, opacity: 0 }}
      transition={{ duration: 0.15, type: 'spring', stiffness: 500 }}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: '16px',
        height: '16px',
        padding: '0 4px',
        fontSize: '0.65rem',
        fontWeight: 700,
        fontFamily: 'var(--font-mono)',
        color: '#ffffff',
        backgroundColor: 'var(--accent-primary)',
        borderRadius: '999px',
        boxShadow: '0 0 10px rgba(99, 102, 241, 0.5)'
      }}
    >
      {count > 99 ? '99+' : count}
    </motion.span>
  );
}
