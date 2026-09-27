import React from 'react';
import { Clock } from 'lucide-react';

export default function CallTimer({ seconds = 0 }) {
  const formatTime = (totalSec) => {
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;

    const pad = (n) => String(n).padStart(2, '0');

    if (hrs > 0) {
      return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
    }
    return `${pad(mins)}:${pad(secs)}`;
  };

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.35rem',
        fontSize: '0.8125rem',
        fontWeight: 600,
        fontFamily: 'var(--font-mono)',
        color: 'var(--text-primary)',
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        padding: '0.2rem 0.6rem',
        borderRadius: 'var(--radius-pill)',
        border: '1px solid var(--border-subtle)'
      }}
    >
      <Clock size={13} color="var(--accent-primary)" />
      <span>{formatTime(seconds)}</span>
    </div>
  );
}
