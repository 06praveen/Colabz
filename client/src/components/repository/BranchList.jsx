import React from 'react';
import { GitBranch, Clock } from 'lucide-react';

export default function BranchList({ branches = [], currentBranch, onSelectBranch }) {
  if (!branches || branches.length === 0) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
        No branch records.
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
      {branches.map((b) => {
        const isCurrent = b.name === currentBranch;
        return (
          <div
            key={b.name}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.85rem 1.1rem',
              borderBottom: '1px solid var(--border-subtle)',
              backgroundColor: isCurrent ? 'rgba(0, 229, 163, 0.03)' : 'transparent'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <GitBranch size={16} color={isCurrent ? 'var(--accent-primary)' : 'var(--text-muted)'} />
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: 600, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
                    {b.name}
                  </span>
                  {b.isDefault && (
                    <span className="clb-badge clb-badge-neutral">
                      default
                    </span>
                  )}
                  {isCurrent && (
                    <span className="clb-badge clb-badge-mint">
                      active
                    </span>
                  )}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span>{b.lastCommitMessage}</span>
                  <span>•</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                    <Clock size={11} /> {b.updatedAt ? (typeof b.updatedAt === 'string' && b.updatedAt.includes('T') ? new Date(b.updatedAt).toLocaleDateString() : b.updatedAt) : 'Recently'}
                  </span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              {b.behindAhead && (
                <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                  {b.behindAhead}
                </span>
              )}
              {!isCurrent && (
                <button
                  onClick={() => onSelectBranch && onSelectBranch(b.name)}
                  className="clb-btn clb-btn-secondary"
                  style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                >
                  Switch
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
