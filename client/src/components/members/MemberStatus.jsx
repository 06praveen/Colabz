import React from 'react';

export default function MemberStatus({ status = 'offline', showLabel = true }) {
  const normalizedStatus = (status || 'offline').toLowerCase();

  const statusConfig = {
    active: { label: 'Active', color: 'var(--success, #00e5a3)', bg: 'rgba(0, 229, 163, 0.12)' },
    online: { label: 'Active', color: 'var(--success, #00e5a3)', bg: 'rgba(0, 229, 163, 0.12)' },
    away: { label: 'Away', color: 'var(--warning, #eab308)', bg: 'rgba(234, 179, 8, 0.12)' },
    offline: { label: 'Offline', color: 'var(--text-muted, #888888)', bg: 'rgba(255, 255, 255, 0.05)' }
  };

  const config = statusConfig[normalizedStatus] || statusConfig.offline;

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
      <span
        style={{
          width: '7px',
          height: '7px',
          borderRadius: '50%',
          backgroundColor: config.color,
          display: 'inline-block'
        }}
        aria-hidden="true"
      />
      {showLabel && (
        <span style={{ fontSize: '0.775rem', color: 'var(--text-muted)', fontWeight: 400 }}>
          {config.label}
        </span>
      )}
    </div>
  );
}
