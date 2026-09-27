import React from 'react';

export default function Input({
  label,
  error,
  helperText,
  mono = false,
  icon: Icon = null,
  className = '',
  ...props
}) {
  return (
    <div className="clb-input-group">
      {label && <label className="clb-label">{label}</label>}
      <div style={{ position: 'relative', width: '100%' }}>
        {Icon && (
          <div style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
            <Icon size={16} />
          </div>
        )}
        <input
          className={`clb-input ${mono ? 'font-mono' : ''} ${className}`}
          style={{ paddingLeft: Icon ? '2.25rem' : '0.85rem' }}
          {...props}
        />
      </div>
      {error ? (
        <span style={{ fontSize: '0.75rem', color: 'var(--danger)' }}>{error}</span>
      ) : helperText ? (
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{helperText}</span>
      ) : null}
    </div>
  );
}
