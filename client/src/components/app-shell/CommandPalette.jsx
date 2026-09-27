import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, FolderGit2, MessageSquare, Bell, Settings, LayoutDashboard, Plus, GitBranch, GitCommit, FileCode, CheckSquare, CircleDot, Users, UserPlus, Hash, Video, Mic } from 'lucide-react';

export default function CommandPalette({ isOpen, onClose, onCreateProject }) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();
  const inputRef = useRef(null);

  const commandItems = [
    { id: 'nav-overview', label: 'Overview', category: 'Navigation', icon: LayoutDashboard, path: '/app/dashboard' },
    { id: 'nav-projects', label: 'Projects', category: 'Navigation', icon: FolderGit2, path: '/app/projects' },
    { id: 'nav-messages', label: 'Messages', category: 'Navigation', icon: MessageSquare, path: '/app/messages' },
    { id: 'nav-notifications', label: 'Notifications', category: 'Navigation', icon: Bell, path: '/app/notifications' },
    { id: 'nav-settings', label: 'Settings', category: 'Navigation', icon: Settings, path: '/app/settings' },
    
    // Repository Commands
    { id: 'repo-open', label: 'Open repository', category: 'Repository', icon: FolderGit2, path: '/app/projects/proj_1/repository' },
    { id: 'repo-search', label: 'Search files in repository', category: 'Repository', icon: FileCode, path: '/app/projects/proj_1/repository' },
    { id: 'repo-commits', label: 'View commits history', category: 'Repository', icon: GitCommit, path: '/app/projects/proj_1/repository/commits' },
    { id: 'repo-branches', label: 'Go to branches list', category: 'Repository', icon: GitBranch, path: '/app/projects/proj_1/repository/branches' },

    // Tasks & Issues Commands (Phase 7)
    { id: 'task-go', label: 'Go to Tasks', category: 'Tasks & Issues', icon: CheckSquare, path: '/app/projects/proj_1/tasks' },
    { id: 'task-search', label: 'Search tasks', category: 'Tasks & Issues', icon: Search, path: '/app/projects/proj_1/tasks' },
    { id: 'task-create', label: 'Create new task', category: 'Tasks & Issues', icon: Plus, path: '/app/projects/proj_1/tasks' },
    { id: 'issue-go', label: 'Go to Issues', category: 'Tasks & Issues', icon: CircleDot, path: '/app/projects/proj_1/issues' },
    { id: 'issue-search', label: 'Search issues', category: 'Tasks & Issues', icon: Search, path: '/app/projects/proj_1/issues' },
    { id: 'issue-create', label: 'Create new issue', category: 'Tasks & Issues', icon: Plus, path: '/app/projects/proj_1/issues' },

    // Members & Team Commands (Phase 8)
    { id: 'member-go', label: 'Go to Members', category: 'Members', icon: Users, path: '/app/projects/proj_1/members' },
    { id: 'member-invite', label: 'Invite member', category: 'Members', icon: UserPlus, path: '/app/projects/proj_1/members?action=invite' },
    { id: 'member-search', label: 'Search members', category: 'Members', icon: Search, path: '/app/projects/proj_1/members' },

    // Chat & Messaging Commands (Phase 9)
    { id: 'chat-go', label: 'Go to Chat', category: 'Chat & Messaging', icon: MessageSquare, path: '/app/projects/proj_1/chat' },
    { id: 'chat-search', label: 'Search messages', category: 'Chat & Messaging', icon: Search, path: '/app/projects/proj_1/chat' },
    { id: 'chat-start', label: 'Start conversation', category: 'Chat & Messaging', icon: Plus, path: '/app/projects/proj_1/chat' },
    { id: 'chat-open-general', label: 'Open General', category: 'Chat & Messaging', icon: Hash, path: '/app/projects/proj_1/chat/conv_general' },
    { id: 'chat-open-dev', label: 'Open Development', category: 'Chat & Messaging', icon: Hash, path: '/app/projects/proj_1/chat/conv_dev' },

    // Calls & Real-Time Commands (Phase 10)
    { id: 'call-go', label: 'Go to Calls', category: 'Calls & Real-Time', icon: Video, path: '/app/projects/proj_1/calls' },
    { id: 'call-start-video', label: 'Start video call', category: 'Calls & Real-Time', icon: Video, path: '/app/projects/proj_1/calls/call_dev_sync' },
    { id: 'call-start-voice', label: 'Start voice call', category: 'Calls & Real-Time', icon: Mic, path: '/app/projects/proj_1/calls' },
    { id: 'call-join', label: 'Join active call', category: 'Calls & Real-Time', icon: Video, path: '/app/projects/proj_1/calls/call_dev_sync' },
    { id: 'call-chat', label: 'Open call chat', category: 'Calls & Real-Time', icon: MessageSquare, path: '/app/projects/proj_1/calls/call_dev_sync' },

    // Notifications & Activity Commands (Phase 11)
    { id: 'notif-go', label: 'Go to Notifications', category: 'Notifications & Activity', icon: Bell, path: '/app/notifications' },
    { id: 'activity-go', label: 'Go to Activity Center', category: 'Notifications & Activity', icon: LayoutDashboard, path: '/app/activity' },
    { id: 'notif-mark-read', label: 'Mark all notifications as read', category: 'Notifications & Activity', icon: Bell, path: '/app/notifications' },
    { id: 'activity-search', label: 'Search activity timeline', category: 'Notifications & Activity', icon: Search, path: '/app/activity' },

    { id: 'proj-campus', label: 'campus-connect', category: 'Recent projects', icon: FolderGit2, path: '/app/projects/proj_1/repository' },
    { id: 'proj-ai', label: 'ai-stock-predictor', category: 'Recent projects', icon: FolderGit2, path: '/app/projects/proj_2/repository' },
    { id: 'proj-student', label: 'student-management', category: 'Recent projects', icon: FolderGit2, path: '/app/projects/proj_3/repository' },

    { id: 'act-create-proj', label: 'Create new project', category: 'Actions', icon: Plus, action: 'CREATE_PROJECT' }
  ];

  const filteredItems = commandItems.filter(item =>
    item.label.toLowerCase().includes(query.toLowerCase()) ||
    item.category.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => {
        if (inputRef.current) inputRef.current.focus();
      }, 50);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % (filteredItems.length || 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % (filteredItems.length || 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredItems[selectedIndex]) {
          handleExecute(filteredItems[selectedIndex]);
        }
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredItems, selectedIndex]);

  const handleExecute = (item) => {
    onClose();
    if (item.action === 'CREATE_PROJECT') {
      if (onCreateProject) onCreateProject();
    } else if (item.path) {
      navigate(item.path);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
            paddingTop: '12vh',
            paddingLeft: '1rem',
            paddingRight: '1rem'
          }}
          role="dialog"
          aria-modal="true"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(7, 8, 10, 0.75)',
              backdropFilter: 'blur(4px)',
              zIndex: -1
            }}
          />

          {/* Palette Box */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: -6 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            style={{
              width: '100%',
              maxWidth: '580px',
              backgroundColor: 'var(--bg-elevated)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {/* Search Input Bar */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.85rem 1.1rem',
                borderBottom: '1px solid var(--border-default)'
              }}
            >
              <Search size={16} color="var(--text-muted)" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search projects, pages, or actions..."
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelectedIndex(0);
                }}
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem',
                  fontFamily: 'var(--font-sans)'
                }}
              />
              <span
                style={{
                  fontSize: '0.7rem',
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--text-muted)',
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  padding: '0.15rem 0.4rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                ESC
              </span>
            </div>

            {/* Results List */}
            <div
              style={{
                maxHeight: '320px',
                overflowY: 'auto',
                padding: '0.4rem'
              }}
            >
              {filteredItems.length === 0 ? (
                <div
                  style={{
                    padding: '2rem 1rem',
                    textAlign: 'center',
                    color: 'var(--text-muted)',
                    fontSize: '0.85rem'
                  }}
                >
                  No matching results for "{query}"
                </div>
              ) : (
                filteredItems.map((item, idx) => {
                  const isSelected = idx === selectedIndex;
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleExecute(item)}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.55rem 0.75rem',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: isSelected ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
                        color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)',
                        cursor: 'pointer',
                        transition: 'background-color 0.12s ease'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <Icon size={16} color={isSelected ? 'var(--accent-primary)' : 'var(--text-muted)'} />
                        <span style={{ fontSize: '0.85rem', fontWeight: isSelected ? 500 : 400 }}>
                          {item.label}
                        </span>
                      </div>

                      <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                        {item.category}
                      </span>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.5rem 0.85rem',
                borderTop: '1px solid var(--border-default)',
                backgroundColor: 'rgba(0,0,0,0.2)',
                fontSize: '0.725rem',
                color: 'var(--text-muted)'
              }}
            >
              <div style={{ display: 'flex', gap: '0.85rem' }}>
                <span>↑↓ Navigate</span>
                <span>↵ Select</span>
              </div>
              <span>Esc Close</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
