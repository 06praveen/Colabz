import React from 'react';
import { FileDiff } from 'lucide-react';

export default function DiffViewer({ diffs = [] }) {
  if (!diffs || diffs.length === 0) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
        No file changes to display.
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {diffs.map((diff, dIdx) => (
        <div
          key={dIdx}
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-md)',
            overflow: 'hidden'
          }}
        >
          {/* File Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.55rem 0.85rem',
              backgroundColor: 'var(--bg-elevated)',
              borderBottom: '1px solid var(--border-default)',
              fontSize: '0.8125rem',
              fontFamily: 'var(--font-mono)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <FileDiff size={15} color="var(--accent-primary)" />
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{diff.file}</span>
            </div>

            <div style={{ display: 'flex', gap: '0.65rem', fontSize: '0.75rem' }}>
              <span style={{ color: 'var(--success)' }}>+{diff.additions}</span>
              <span style={{ color: 'var(--danger)' }}>-{diff.deletions}</span>
            </div>
          </div>

          {/* Line by line diff body */}
          <div style={{ fontSize: '0.8125rem', fontFamily: 'var(--font-mono)', lineHeight: 1.5, backgroundColor: '#090B0E' }}>
            {diff.lines.map((l, lIdx) => {
              const isAddition = l.type === 'addition';
              const isDeletion = l.type === 'deletion';

              return (
                <div
                  key={lIdx}
                  style={{
                    padding: '0.2rem 0.85rem',
                    backgroundColor: isAddition
                      ? 'rgba(0, 229, 163, 0.08)'
                      : isDeletion
                      ? 'rgba(255, 92, 112, 0.08)'
                      : 'transparent',
                    color: isAddition ? 'var(--success)' : isDeletion ? 'var(--danger)' : 'var(--text-secondary)',
                    borderLeft: isAddition
                      ? '3px solid var(--success)'
                      : isDeletion
                      ? '3px solid var(--danger)'
                      : '3px solid transparent',
                    whiteSpace: 'pre'
                  }}
                >
                  {l.line}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
