import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { GitCommit, Clock } from 'lucide-react';

export default function CommitList({ commits = [] }) {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const activeProjectId = projectId || 'proj_1';

  if (!commits || commits.length === 0) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
        No commit history available.
      </div>
    );
  }

  return (
    <div
      style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden'
      }}
    >
      {commits.map((c) => (
        <div
          key={c.id || c.hash}
          onClick={() => navigate(`/app/projects/${activeProjectId}/repository/commits/${c.id}`)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.85rem 1.1rem',
            borderBottom: '1px solid var(--border-subtle)',
            cursor: 'pointer',
            transition: 'background-color 0.12s ease'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.03)')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: 'var(--bg-elevated)',
                border: '1px solid var(--border-default)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-primary)',
                fontWeight: 600,
                fontSize: '0.75rem',
                flexShrink: 0
              }}
            >
              {c.authorInitials || 'PR'}
            </div>

            <div>
              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.2rem' }}>
                {c.message}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontWeight: 500, color: 'var(--text-secondary)' }}>{c.author}</span>
                <span>•</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Clock size={12} /> {c.time}
                </span>
              </div>
            </div>
          </div>

          <div
            style={{
              fontSize: '0.75rem',
              fontFamily: 'var(--font-mono)',
              backgroundColor: 'var(--bg-elevated)',
              border: '1px solid var(--border-default)',
              color: 'var(--accent-primary)',
              padding: '0.2rem 0.55rem',
              borderRadius: 'var(--radius-sm)'
            }}
          >
            {c.hash.substring(0, 7)}
          </div>
        </div>
      ))}
    </div>
  );
}
