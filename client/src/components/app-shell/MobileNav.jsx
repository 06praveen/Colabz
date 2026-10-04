import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, FolderGit2, MessageSquare, Bell, Settings, X, Plus } from 'lucide-react';
import ProjectSwitcher from './ProjectSwitcher';
import { useProjects } from '../../context/ProjectContext';

export function MobileBottomBar() {
  const location = useLocation();
  const navigate = useNavigate();

  const items = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard, path: '/app/dashboard' },
    { id: 'projects', label: 'Projects', icon: FolderGit2, path: '/app/projects' },
    { id: 'messages', label: 'Messages', icon: MessageSquare, path: '/app/messages' },
    { id: 'alerts', label: 'Alerts', icon: Bell, path: '/app/notifications' },
    { id: 'settings', label: 'Settings', icon: Settings, path: '/app/settings' }
  ];

  return (
    <nav
      className="mobile-only-bar"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: '64px',
        backgroundColor: 'rgba(11, 13, 16, 0.95)',
        backdropFilter: 'blur(16px)',
        borderTop: '1px solid var(--border-default)',
        zIndex: 80,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        padding: '0 0.5rem'
      }}
    >
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path || (item.path === '/app/dashboard' && location.pathname === '/app');
        return (
          <button
            key={item.id}
            onClick={() => navigate(item.path)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '3px',
              background: 'none',
              border: 'none',
              color: isActive ? 'var(--accent-primary)' : 'var(--text-muted)',
              fontSize: '0.6875rem',
              fontWeight: isActive ? 600 : 400,
              cursor: 'pointer',
              flex: 1,
              padding: '6px 0',
              transition: 'color 0.15s ease'
            }}
          >
            <Icon size={18} />
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

export function MobileDrawer({
  isOpen,
  onClose,
  onCreateProject,
}) {
  const navigate = useNavigate();
  const { projects, currentProject, selectProject } = useProjects();

  return (
    <AnimatePresence>
      {isOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9000 }}>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: 'rgba(7, 8, 10, 0.8)',
              backdropFilter: 'blur(6px)'
            }}
          />

          {/* Drawer Content */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              bottom: 0,
              width: '280px',
              backgroundColor: 'var(--bg-elevated)',
              borderRight: '1px solid var(--border-default)',
              padding: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              zIndex: 10
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                COLABZ NAVIGATION
              </span>
              <button
                onClick={onClose}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <ProjectSwitcher
                projects={projects}
                currentProject={currentProject}
                onSelectProject={(proj) => {
                  selectProject(proj);
                  const pId = proj._id || proj.id || proj.slug;
                  navigate(`/app/projects/${pId}/repository`);
                  onClose();
                }}
                onCreateProject={() => {
                  if (onCreateProject) onCreateProject();
                  onClose();
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <button
                onClick={() => { navigate('/app/dashboard'); onClose(); }}
                className="clb-btn clb-btn-secondary"
                style={{ justifyContent: 'flex-start' }}
              >
                Overview
              </button>
              <button
                onClick={() => { navigate('/app/projects'); onClose(); }}
                className="clb-btn clb-btn-secondary"
                style={{ justifyContent: 'flex-start' }}
              >
                Projects
              </button>
              <button
                onClick={() => { navigate('/app/messages'); onClose(); }}
                className="clb-btn clb-btn-secondary"
                style={{ justifyContent: 'flex-start' }}
              >
                Messages
              </button>
              <button
                onClick={() => { navigate('/app/inbox'); onClose(); }}
                className="clb-btn clb-btn-secondary"
                style={{ justifyContent: 'flex-start' }}
              >
                Inbox
              </button>
              <button
                onClick={() => { navigate('/app/notifications'); onClose(); }}
                className="clb-btn clb-btn-secondary"
                style={{ justifyContent: 'flex-start' }}
              >
                Notifications
              </button>
              <button
                onClick={() => { navigate('/app/settings'); onClose(); }}
                className="clb-btn clb-btn-secondary"
                style={{ justifyContent: 'flex-start' }}
              >
                Settings
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
