import React from 'react';
import { AlertCircle, RotateCw } from 'lucide-react';

export default function ErrorState({
  title = "Couldn't load workspace",
  description = 'Please try again or check your connection.',
  onRetry
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3.5rem 2rem',
        textAlign: 'center',
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-md)',
        margin: '1rem 0'
      }}
    >
      <div
        style={{
          width: '44px',
          height: '44px',
          borderRadius: 'var(--radius-md)',
          background: 'var(--danger-bg)',
          border: '1px solid rgba(255, 92, 112, 0.25)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--danger)',
          marginBottom: '1rem'
        }}
      >
        <AlertCircle size={20} />
      </div>

      <h3
        style={{
          fontSize: '1rem',
          fontWeight: 600,
          color: 'var(--text-primary)',
          marginBottom: '0.35rem'
        }}
      >
        {title}
      </h3>

      <p
        style={{
          fontSize: '0.85rem',
          color: 'var(--text-secondary)',
          maxWidth: '360px',
          lineHeight: 1.5,
          marginBottom: '1.25rem'
        }}
      >
        {description}
      </p>

      {onRetry && (
        <button onClick={onRetry} className="clb-btn clb-btn-secondary">
          <RotateCw size={14} />
          Try again
        </button>
      )}
    </div>
  );
}
