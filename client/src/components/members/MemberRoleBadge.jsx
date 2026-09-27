import React from 'react';

export default function MemberRoleBadge({ role = 'developer' }) {
  const normRole = (role || 'developer').toLowerCase();

  const roleStyles = {
    owner: {
      label: 'Owner',
      bg: 'rgba(0, 229, 163, 0.12)',
      color: 'var(--accent-primary)',
      border: '1px solid rgba(0, 229, 163, 0.3)'
    },
    admin: {
      label: 'Admin',
      bg: 'rgba(99, 102, 241, 0.12)',
      color: '#818cf8',
      border: '1px solid rgba(99, 102, 241, 0.3)'
    },
    developer: {
      label: 'Developer',
      bg: 'rgba(56, 189, 248, 0.12)',
      color: '#38bdf8',
      border: '1px solid rgba(56, 189, 248, 0.3)'
    },
    designer: {
      label: 'Designer',
      bg: 'rgba(236, 72, 153, 0.12)',
      color: '#f472b6',
      border: '1px solid rgba(236, 72, 153, 0.3)'
    },
    viewer: {
      label: 'Viewer',
      bg: 'rgba(156, 163, 175, 0.12)',
      color: 'var(--text-muted)',
      border: '1px solid rgba(156, 163, 175, 0.25)'
    }
  };

  const styleConfig = roleStyles[normRole] || roleStyles.developer;

  return (
    <span
      style={{
        fontSize: '0.725rem',
        fontWeight: 600,
        fontFamily: 'var(--font-mono)',
        padding: '0.15rem 0.5rem',
        borderRadius: 'var(--radius-sm)',
        backgroundColor: styleConfig.bg,
        color: styleConfig.color,
        border: styleConfig.border,
        display: 'inline-flex',
        alignItems: 'center',
        whiteSpace: 'nowrap'
      }}
    >
      {styleConfig.label}
    </span>
  );
}
