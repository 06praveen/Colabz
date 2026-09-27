import React from 'react';
import { Layers, Plus } from 'lucide-react';

export default function EmptyState({
  icon: Icon = Layers,
  title = 'No projects yet',
  description = 'Create your first project and invite your team.',
  actionLabel = 'Create project',
  onAction
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
        border: '1px border-dashed var(--border-default)',
        borderRadius: 'var(--radius-md)',
        margin: '1rem 0'
      }}
    >
      <div
        style={{
          width: '44px',
          height: '44px',
          borderRadius: 'var(--radius-md)',
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border-default)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--accent-primary)',
          marginBottom: '1rem'
        }}
      >
        <Icon size={20} />
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
          color: 'var(--text-muted)',
          maxWidth: '360px',
          lineHeight: 1.5,
          marginBottom: onAction ? '1.25rem' : 0
        }}
      >
        {description}
      </p>

      {onAction && actionLabel && (
        <button onClick={onAction} className="clb-btn clb-btn-primary">
          <Plus size={15} />
          {actionLabel}
        </button>
      )}
    </div>
  );
}
