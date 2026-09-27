import React from 'react';
import { ArrowDown, Minus, ArrowUp, AlertTriangle } from 'lucide-react';

export default function TaskPriorityBadge({ priority = 'Medium' }) {
  const norm = String(priority).toLowerCase();

  let color = 'var(--text-muted)';
  let bg = 'rgba(255, 255, 255, 0.04)';
  let border = 'var(--border-default)';
  let Icon = Minus;

  if (norm === 'low') {
    color = 'var(--text-muted)';
    Icon = ArrowDown;
  } else if (norm === 'medium') {
    color = 'var(--warning)';
    bg = 'rgba(255, 184, 0, 0.08)';
    border = 'rgba(255, 184, 0, 0.25)';
    Icon = Minus;
  } else if (norm === 'high') {
    color = 'var(--accent-purple)';
    bg = 'rgba(139, 124, 255, 0.1)';
    border = 'rgba(139, 124, 255, 0.25)';
    Icon = ArrowUp;
  } else if (norm === 'urgent') {
    color = 'var(--danger)';
    bg = 'rgba(255, 92, 112, 0.1)';
    border = 'rgba(255, 92, 112, 0.25)';
    Icon = AlertTriangle;
  }

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.25rem',
        padding: '0.15rem 0.5rem',
        fontSize: '0.725rem',
        fontWeight: 500,
        fontFamily: 'var(--font-mono)',
        borderRadius: 'var(--radius-sm)',
        backgroundColor: bg,
        color: color,
        border: `1px solid ${border}`
      }}
    >
      <Icon size={11} />
      <span>{priority}</span>
    </span>
  );
}
