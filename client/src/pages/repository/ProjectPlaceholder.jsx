import React from 'react';
import { useLocation } from 'react-router-dom';
import { Layers, Clock } from 'lucide-react';

export default function ProjectPlaceholder({ title }) {
  const location = useLocation();
  const sectionName = title || location.pathname.split('/').pop() || 'Section';

  return (
    <div
      className="clb-card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3.5rem 1.5rem',
        textAlign: 'center',
        gap: '1rem',
        marginTop: '1rem'
      }}
    >
      <div
        style={{
          width: '52px',
          height: '52px',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'var(--bg-elevated)',
          border: '1px solid var(--border-default)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--accent-primary)'
        }}
      >
        <Layers size={26} />
      </div>

      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.45rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0, textTransform: 'capitalize' }}>
            {sectionName}
          </h2>
          <span className="clb-badge clb-badge-neutral" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
            <Clock size={11} /> Phase Placeholder
          </span>
        </div>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', maxWidth: '440px', margin: '0.5rem auto 0', lineHeight: 1.5 }}>
          The {sectionName} module is planned for an upcoming release phase. Explore the <strong>Repository</strong> tab to view project code, tree navigation, commits, and branches.
        </p>
      </div>
    </div>
  );
}
