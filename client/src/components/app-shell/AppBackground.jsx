import React from 'react';

export default function AppBackground() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
        backgroundColor: 'var(--bg-base)'
      }}
    >
      {/* Calm subtle grid pattern */}
      <div
        className="bg-tech-grid"
        style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.25
        }}
      />
    </div>
  );
}
