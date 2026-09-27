import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronRight, Folder, FileCode } from 'lucide-react';

export default function Breadcrumbs({ currentPath = '', isFile = false }) {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const activeProjectId = projectId || 'proj_1';

  const segments = currentPath ? currentPath.split('/').filter(Boolean) : [];

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.35rem',
        fontSize: '0.8125rem',
        fontFamily: 'var(--font-mono)',
        flexWrap: 'wrap',
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-sm)',
        padding: '0.5rem 0.85rem'
      }}
    >
      <button
        onClick={() => navigate(`/app/projects/${activeProjectId}/repository`)}
        style={{
          background: 'none',
          border: 'none',
          color: segments.length === 0 ? 'var(--text-primary)' : 'var(--accent-primary)',
          cursor: 'pointer',
          padding: 0,
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '0.35rem'
        }}
      >
        <Folder size={14} />
        <span>root</span>
      </button>

      {segments.map((seg, idx) => {
        const isLast = idx === segments.length - 1;
        const cumulativePath = segments.slice(0, idx + 1).join('/');

        return (
          <React.Fragment key={cumulativePath}>
            <ChevronRight size={13} color="var(--text-muted)" />
            {isLast ? (
              <span
                style={{
                  color: 'var(--text-primary)',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem'
                }}
              >
                {isFile && <FileCode size={14} color="var(--accent-primary)" />}
                {seg}
              </span>
            ) : (
              <button
                onClick={() => navigate(`/app/projects/${activeProjectId}/repository/tree/${cumulativePath}`)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--accent-primary)',
                  cursor: 'pointer',
                  padding: 0,
                  fontWeight: 500
                }}
              >
                {seg}
              </button>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
