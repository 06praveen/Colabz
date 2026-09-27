import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

/**
 * MotionButton — Developer-Tool Responsive Interactive Button
 * Features tactile micro-press physics, subtle hover elevation, focus ring,
 * and high-contrast developer product aesthetics.
 */
export default function MotionButton({
  children,
  onClick,
  variant = 'primary', // primary | secondary | ghost | danger
  size = 'md', // sm | md | lg
  icon: Icon,
  disabled = false,
  fullWidth = false,
  className = '',
  style = {},
  ...props
}) {
  const shouldReduceMotion = useReducedMotion();

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: 'var(--accent-primary)',
          color: '#0b0d10',
          border: '1px solid var(--accent-primary)',
          fontWeight: 650,
          boxShadow: '0 2px 8px rgba(0, 229, 163, 0.25)'
        };
      case 'secondary':
        return {
          backgroundColor: 'var(--bg-elevated)',
          color: 'var(--text-primary)',
          border: '1px solid var(--border-default)',
          fontWeight: 600
        };
      case 'danger':
        return {
          backgroundColor: 'rgba(239, 68, 68, 0.12)',
          color: '#ef4444',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          fontWeight: 600
        };
      case 'ghost':
      default:
        return {
          backgroundColor: 'transparent',
          color: 'var(--text-secondary)',
          border: '1px solid transparent',
          fontWeight: 500
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          padding: '0.35rem 0.75rem',
          fontSize: '0.78125rem',
          borderRadius: 'var(--radius-sm)'
        };
      case 'lg':
        return {
          padding: '0.65rem 1.35rem',
          fontSize: '0.9375rem',
          borderRadius: 'var(--radius-md)'
        };
      case 'md':
      default:
        return {
          padding: '0.5rem 1rem',
          fontSize: '0.85rem',
          borderRadius: 'var(--radius-sm)'
        };
    }
  };

  const baseVariant = getVariantStyles();
  const baseSize = getSizeStyles();

  return (
    <motion.button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      whileHover={
        disabled || shouldReduceMotion
          ? {}
          : {
              y: -1,
              filter: variant === 'primary' ? 'brightness(1.08)' : 'none',
              borderColor: variant === 'secondary' ? 'var(--border-hover)' : baseVariant.border
            }
      }
      whileTap={
        disabled || shouldReduceMotion
          ? {}
          : {
              scale: 0.975,
              y: 1
            }
      }
      transition={{ duration: 0.12, ease: 'easeOut' }}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        fontFamily: 'var(--font-sans)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        width: fullWidth ? '100%' : 'auto',
        outline: 'none',
        transition: 'background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease',
        ...baseSize,
        ...baseVariant,
        ...style
      }}
      className={`clb-motion-btn ${className}`}
      {...props}
    >
      {Icon && <Icon size={size === 'sm' ? 14 : size === 'lg' ? 18 : 16} />}
      <span>{children}</span>
    </motion.button>
  );
}
