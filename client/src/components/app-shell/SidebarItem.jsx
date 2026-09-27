import React, { useState } from 'react';
import { motion } from 'framer-motion';

export default function SidebarItem({
  id,
  label,
  icon: Icon,
  isActive,
  isCollapsed,
  onClick,
  badge
}) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <button
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        aria-label={label}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          padding: isCollapsed ? '0.6rem 0' : '0.55rem 0.75rem',
          justifyContent: isCollapsed ? 'center' : 'flex-start',
          borderRadius: 'var(--radius-sm)',
          border: 'none',
          backgroundColor: 'transparent',
          color: isActive ? 'var(--text-primary)' : isHovered ? 'var(--text-primary)' : 'var(--text-secondary)',
          fontSize: '0.875rem',
          fontWeight: isActive ? 600 : 400,
          fontFamily: 'var(--font-sans)',
          cursor: 'pointer',
          textAlign: 'left',
          position: 'relative',
          transition: 'color 0.15s ease',
          outline: 'none',
          zIndex: 1
        }}
      >
        {/* Animated Shared Layout Active Indicator */}
        {isActive && (
          <motion.div
            layoutId="sidebar-active-indicator"
            initial={false}
            transition={{
              type: 'spring',
              stiffness: 400,
              damping: 35
            }}
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: 'rgba(139, 124, 255, 0.12)',
              border: '1px solid rgba(139, 124, 255, 0.25)',
              borderRadius: 'var(--radius-sm)',
              zIndex: -1
            }}
          />
        )}

        {/* Icon */}
        <Icon
          size={18}
          color={isActive ? 'var(--accent-primary)' : isHovered ? 'var(--text-primary)' : 'var(--text-muted)'}
          style={{ flexShrink: 0, transition: 'color 0.15s ease' }}
        />

        {/* Text Label */}
        {!isCollapsed && (
          <span
            style={{
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              flex: 1
            }}
          >
            {label}
          </span>
        )}

        {/* Optional Badge */}
        {!isCollapsed && badge && (
          <span
            style={{
              fontSize: '0.6875rem',
              fontFamily: 'var(--font-mono)',
              fontWeight: 600,
              padding: '0.1rem 0.4rem',
              borderRadius: 'var(--radius-pill)',
              backgroundColor: 'rgba(255,255,255,0.06)',
              color: 'var(--text-muted)'
            }}
          >
            {badge}
          </span>
        )}
      </button>

      {/* Hover Tooltip when Collapsed */}
      {isCollapsed && isHovered && (
        <motion.div
          initial={{ opacity: 0, x: 5 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'absolute',
            left: 'calc(100% + 10px)',
            top: '50%',
            transform: 'translateY(-50%)',
            backgroundColor: 'var(--bg-elevated)',
            border: '1px solid var(--border-default)',
            color: 'var(--text-primary)',
            fontSize: '0.75rem',
            fontWeight: 500,
            padding: '0.3rem 0.6rem',
            borderRadius: 'var(--radius-sm)',
            whiteSpace: 'nowrap',
            boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
            zIndex: 200,
            pointerEvents: 'none'
          }}
        >
          {label}
        </motion.div>
      )}
    </div>
  );
}
