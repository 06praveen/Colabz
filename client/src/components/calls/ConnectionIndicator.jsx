import React from 'react';
import { Signal } from 'lucide-react';

export default function ConnectionIndicator({ quality = 'Good' }) {
  const normQuality = (quality || 'Good').toLowerCase();

  const qualityConfig = {
    excellent: { color: 'var(--success, #00e5a3)', label: 'Excellent' },
    good: { color: 'var(--success, #00e5a3)', label: 'Good' },
    unstable: { color: 'var(--warning, #eab308)', label: 'Unstable' }
  };

  const config = qualityConfig[normQuality] || qualityConfig.good;

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.35rem',
        fontSize: '0.75rem',
        color: 'var(--text-muted)',
        fontFamily: 'var(--font-mono)'
      }}
      title={`Connection Quality: ${config.label}`}
    >
      <Signal size={13} color={config.color} />
      <span>{config.label}</span>
    </div>
  );
}
