import React from 'react';
import logoImg from '../../assets/ColabzLogo.png';

export default function Logo({ size = 32, showText = true }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
      <img
        src={logoImg}
        alt="Colabz Logo"
        style={{
          height: `${size}px`,
          width: 'auto',
          objectFit: 'contain',
          borderRadius: '4px'
        }}
      />
      {showText && (
        <span className="font-mono" style={{ fontSize: '0.65rem', color: 'var(--accent-primary)', letterSpacing: '0.1em', fontWeight: 600 }}>
          BUILD IN MOTION
        </span>
      )}
    </div>
  );
}
