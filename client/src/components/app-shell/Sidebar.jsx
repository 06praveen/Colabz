import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  FolderGit2,
  MessageSquare,
  Activity,
  Inbox as InboxIcon,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
  Folder,
  Bell,
  LogOut,
} from 'lucide-react';
import ProjectSwitcher from './ProjectSwitcher';
import SidebarItem from './SidebarItem';
import { useProjects } from '../../context/ProjectContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export default function Sidebar({
  isCollapsed,
  onToggleCollapse,
  onCreateProject,
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const { projects, currentProject, selectProject } = useProjects();
  const { logout } = useAuth();
  const { addToast } = useToast();

  const primaryNavItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard, path: '/app/dashboard' },
    { id: 'projects', label: 'Projects', icon: FolderGit2, path: '/app/projects' },
    { id: 'inbox', label: 'Inbox', icon: InboxIcon, path: '/app/inbox' },
    { id: 'activity', label: 'Activity', icon: Activity, path: '/app/activity' },
    { id: 'messages', label: 'Messages', icon: MessageSquare, path: '/app/messages' },
    { id: 'notifications', label: 'Notifications', icon: Bell, path: '/app/notifications' },
  ];

  const currentPath = location.pathname;

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? '68px' : '240px' }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      style={{
        backgroundColor: 'var(--bg-surface)',
        borderRight: '1px solid var(--border-default)',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        flexShrink: 0,
        overflowX: 'hidden',
      }}
    >
      {/* Workspace / Project Switcher Header */}
      <div
        style={{
          height: '60px',
          display: 'flex',
          alignItems: 'center',
          padding: isCollapsed ? '0 0.75rem' : '0 1rem',
          borderBottom: '1px solid var(--border-subtle)',
          flexShrink: 0,
        }}
      >
        <ProjectSwitcher
          projects={projects}
          currentProject={currentProject}
          onSelectProject={(proj) => {
            selectProject(proj);
            const pId = proj._id || proj.id || proj.slug;
            navigate(`/app/projects/${pId}/repository`);
          }}
          onCreateProject={onCreateProject}
          isCollapsed={isCollapsed}
        />
      </div>

      {/* Main Sidebar Navigation Body */}
      <div
        style={{
          flex: 1,
          padding: isCollapsed ? '1rem 0.5rem' : '1rem 0.75rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.25rem',
          overflowY: 'auto',
          overflowX: 'hidden',
        }}
      >
        {/* Primary Nav Items */}
        {primaryNavItems.map((item) => {
          const isActive = currentPath === item.path || (item.path === '/app/dashboard' && currentPath === '/app');
          return (
            <SidebarItem
              key={item.id}
              id={item.id}
              label={item.label}
              icon={item.icon}
              isActive={isActive}
              isCollapsed={isCollapsed}
              onClick={() => navigate(item.path)}
            />
          );
        })}

        {/* Divider & Your Projects Section */}
        {projects.length > 0 && (
          <>
            <div style={{ margin: '0.75rem 0 0.5rem', borderTop: '1px solid var(--border-subtle)' }} />

            {!isCollapsed && (
              <div
                style={{
                  fontSize: '0.725rem',
                  fontWeight: 600,
                  color: 'var(--text-muted)',
                  padding: '0.25rem 0.5rem',
                }}
              >
                Your projects
              </div>
            )}

            {projects.map((proj) => {
              const pId = proj._id || proj.id || proj.slug;
              const isSelected = currentProject && (currentProject._id === pId || currentProject.id === pId || currentProject.slug === pId);
              return (
                <SidebarItem
                  key={pId}
                  id={pId}
                  label={proj.name}
                  icon={Folder}
                  isActive={isSelected}
                  isCollapsed={isCollapsed}
                  onClick={() => {
                    selectProject(proj);
                    navigate(`/app/projects/${pId}/repository`);
                  }}
                />
              );
            })}
          </>
        )}

        {/* Divider & Settings */}
        <div style={{ margin: '0.75rem 0 0.5rem', borderTop: '1px solid var(--border-subtle)' }} />

        {!isCollapsed && (
          <div
            style={{
              fontSize: '0.725rem',
              fontWeight: 600,
              color: 'var(--text-muted)',
              padding: '0.25rem 0.5rem',
            }}
          >
            Settings
          </div>
        )}

        <SidebarItem
          id="settings"
          label="Settings"
          icon={Settings}
          isActive={currentPath === '/app/settings'}
          isCollapsed={isCollapsed}
          onClick={() => navigate('/app/settings')}
        />

        <SidebarItem
          id="logout"
          label="Log out"
          icon={LogOut}
          isActive={false}
          isCollapsed={isCollapsed}
          onClick={() => {
            logout();
            addToast({ title: 'Logged out', message: 'You have been signed out successfully.', type: 'info' });
            navigate('/login');
          }}
        />
      </div>

      {/* Sidebar Collapse Toggle Footer */}
      <div
        style={{
          padding: '0.75rem',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: isCollapsed ? 'center' : 'flex-end',
          flexShrink: 0,
        }}
      >
        <button
          onClick={onToggleCollapse}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: '6px',
            borderRadius: 'var(--radius-sm)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--text-primary)';
            e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--text-muted)';
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          {isCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
        </button>
      </div>
    </motion.aside>
  );
}
