import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, GitCommit, Clock } from 'lucide-react';
import DiffViewer from './DiffViewer';

export default function CommitDetail({ commit }) {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const activeProjectId = projectId || 'proj_1';

  if (!commit) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        Commit not found.
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <button
        onClick={() => navigate(`/app/projects/${activeProjectId}/repository/commits`)}
        className="clb-btn clb-btn-ghost"
        style={{ alignSelf: 'flex-start', padding: '0.35rem 0.6rem', fontSize: '0.8125rem' }}
      >
        <ArrowLeft size={15} />
        Back to commits
      </button>

      {/* Header Info */}
      <div className="clb-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
            {commit.message}
          </h2>
          <span
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
            {commit.hash}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
          <span style={{ fontWeight: 600 }}>{commit.author}</span>
          <span>•</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--text-muted)' }}>
            <Clock size={13} /> {commit.time}
          </span>
          <span>•</span>
          <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            {commit.filesChangedCount || commit.diffs?.length || 1} files changed
          </span>
        </div>
      </div>

      {/* Diffs */}
      <div>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.85rem' }}>
          File changes
        </h3>
        <DiffViewer diffs={commit.diffs || []} />
      </div>
    </div>
  );
}
