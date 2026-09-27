import React from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FolderGit2, CheckSquare, CircleDot, Users, MessageSquare, Video, LayoutDashboard, Globe, Lock } from 'lucide-react';

export default function ProjectHeader({ project }) {
  const { projectId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const currentPath = location.pathname;
  const activeProjectId = projectId || project?.id || 'proj_1';

  const tabs = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard, path: `/app/projects/${activeProjectId}/overview` },
    { id: 'repository', label: 'Repository', icon: FolderGit2, path: `/app/projects/${activeProjectId}/repository` },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare, path: `/app/projects/${activeProjectId}/tasks` },
    { id: 'issues', label: 'Issues', icon: CircleDot, path: `/app/projects/${activeProjectId}/issues` },
    { id: 'members', label: 'Members', icon: Users, path: `/app/projects/${activeProjectId}/members` },
    { id: 'chat', label: 'Chat', icon: MessageSquare, path: `/app/projects/${activeProjectId}/chat` },
    { id: 'calls', label: 'Calls', icon: Video, path: `/app/projects/${activeProjectId}/calls` }
  ];

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        borderBottom: '1px solid var(--border-default)',
        marginBottom: '1.5rem',
        paddingTop: '0.5rem',
        position: 'sticky',
        top: 0,
        backgroundColor: 'rgba(11, 13, 16, 0.95)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        zIndex: 20,
        paddingBottom: '0.25rem'
      }}
    >
      {/* Title & Visibility Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--bg-elevated)',
              border: '1px solid var(--border-default)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-primary)'
            }}
          >
            <FolderGit2 size={20} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h1 style={{ fontSize: '1.25rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', margin: 0 }}>
                {project?.name || 'campus-connect'}
              </h1>
              <span className={`clb-badge ${project?.visibility === 'PUBLIC' ? 'clb-badge-neutral' : 'clb-badge-success'}`}>
                {project?.visibility === 'PUBLIC' ? <Globe size={11} /> : <Lock size={11} />}
                {(project?.visibility || 'PUBLIC').toLowerCase()}
              </span>
            </div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: '0.15rem 0 0' }}>
              {project?.description || 'Real-time collaborative campus workspace.'}
            </p>
          </div>
        </div>
      </div>

      {/* Project Section Navigation Tabs */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', overflowX: 'auto', paddingBottom: '2px' }}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive =
            currentPath.startsWith(tab.path) ||
            (tab.id === 'repository' && currentPath.includes('/repository')) ||
            (tab.id === 'tasks' && currentPath.includes('/tasks')) ||
            (tab.id === 'issues' && currentPath.includes('/issues')) ||
            (tab.id === 'members' && currentPath.includes('/members')) ||
            (tab.id === 'chat' && currentPath.includes('/chat')) ||
            (tab.id === 'calls' && currentPath.includes('/calls'));
          return (
            <button
              key={tab.id}
              onClick={() => navigate(tab.path)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.5rem 0.85rem',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                backgroundColor: isActive ? 'var(--bg-elevated)' : 'transparent',
                color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
                fontSize: '0.8125rem',
                fontWeight: isActive ? 600 : 400,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                position: 'relative',
                whiteSpace: 'nowrap'
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.color = 'var(--text-secondary)';
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.color = 'var(--text-muted)';
              }}
            >
              <Icon size={15} color={isActive ? 'var(--accent-primary)' : 'currentColor'} />
              <span>{tab.label}</span>
              {isActive && (
                <motion.div
                  layoutId="active-project-tab"
                  style={{
                    position: 'absolute',
                    bottom: '-4px',
                    left: 0,
                    right: 0,
                    height: '2px',
                    backgroundColor: 'var(--accent-primary)',
                    borderRadius: '2px',
                    boxShadow: '0 0 8px rgba(0, 229, 163, 0.6)'
                  }}
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

