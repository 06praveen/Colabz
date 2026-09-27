import React from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { FolderGit2, GitCommit, GitBranch } from 'lucide-react';

export default function RepositoryTabs({ commitsCount = 24, branchesCount = 4 }) {
  const { projectId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const currentPath = location.pathname;
  const activeProjectId = projectId || 'proj_1';

  const repoTabs = [
    {
      id: 'files',
      label: 'Files',
      icon: FolderGit2,
      path: `/app/projects/${activeProjectId}/repository`
    },
    {
      id: 'commits',
      label: 'Commits',
      count: commitsCount,
      icon: GitCommit,
      path: `/app/projects/${activeProjectId}/repository/commits`
    },
    {
      id: 'branches',
      label: 'Branches',
      count: branchesCount,
      icon: GitBranch,
      path: `/app/projects/${activeProjectId}/repository/branches`
    }
  ];

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        borderBottom: '1px solid var(--border-subtle)',
        paddingBottom: '0.4rem',
        marginBottom: '1rem'
      }}
    >
      {repoTabs.map((tab) => {
        const Icon = tab.icon;
        const isActive =
          (tab.id === 'files' && (currentPath.endsWith('/repository') || currentPath.includes('/repository/tree'))) ||
          (tab.id !== 'files' && currentPath.includes(`/repository/${tab.id}`));

        return (
          <button
            key={tab.id}
            onClick={() => navigate(tab.path)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.4rem 0.75rem',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              backgroundColor: isActive ? 'var(--bg-elevated)' : 'transparent',
              color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
              fontSize: '0.8125rem',
              fontWeight: isActive ? 600 : 400,
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <Icon size={14} color={isActive ? 'var(--accent-primary)' : 'currentColor'} />
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                style={{
                  fontSize: '0.7rem',
                  fontFamily: 'var(--font-mono)',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  padding: '0.1rem 0.35rem',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--text-secondary)'
                }}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
