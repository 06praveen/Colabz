import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Settings, Sparkles, LogOut, ShieldCheck, Sun, Moon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Avatar from '../ui/Avatar';

export default function ProfileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [theme, setTheme] = useState('dark');
  const { user, logout } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    addToast({ title: 'Logged out', message: 'You have been signed out successfully.', type: 'info' });
    navigate('/login');
  };

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    addToast({
      title: 'Theme updated',
      message: `Switched workspace theme mode.`,
      type: 'success'
    });
  };

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()
    : 'PR';

  return (
    <div ref={menuRef} style={{ position: 'relative' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="User Profile Menu"
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: 0,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          outline: 'none'
        }}
      >
        <Avatar name={user?.name || 'Praveen Tiwari'} size={34} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            style={{
              position: 'absolute',
              top: 'calc(100% + 10px)',
              right: 0,
              zIndex: 100,
              width: '240px',
              backgroundColor: 'var(--bg-elevated)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-md)',
              boxShadow: '0 15px 40px rgba(0,0,0,0.6), 0 0 1px rgba(255,255,255,0.1)',
              padding: '0.5rem',
              overflow: 'hidden'
            }}
          >
            {/* Header User Card */}
            <div
              style={{
                padding: '0.65rem 0.75rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                borderBottom: '1px solid var(--border-subtle)'
              }}
            >
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#07080A',
                  fontWeight: 700,
                  fontSize: '0.85rem'
                }}
              >
                {initials}
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user?.name || 'Praveen Tiwari'}
                </div>
                <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user?.email || 'praveen@colabz.dev'}
                </div>
              </div>
            </div>

            {/* Menu options */}
            <div style={{ padding: '0.35rem 0', display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <button
                onClick={() => {
                  setIsOpen(false);
                  navigate('/app/settings');
                }}
                className="clb-btn-ghost"
                style={{
                  width: '100%',
                  justifyContent: 'flex-start',
                  padding: '0.5rem 0.65rem',
                  fontSize: '0.8125rem',
                  borderRadius: 'var(--radius-sm)'
                }}
              >
                <User size={15} color="var(--text-secondary)" />
                <span>Profile</span>
              </button>

              <button
                onClick={() => {
                  setIsOpen(false);
                  navigate('/app/settings');
                }}
                className="clb-btn-ghost"
                style={{
                  width: '100%',
                  justifyContent: 'flex-start',
                  padding: '0.5rem 0.65rem',
                  fontSize: '0.8125rem',
                  borderRadius: 'var(--radius-sm)'
                }}
              >
                <Settings size={15} color="var(--text-secondary)" />
                <span>Settings</span>
              </button>

              <button
                onClick={toggleTheme}
                className="clb-btn-ghost"
                style={{
                  width: '100%',
                  justifyContent: 'flex-start',
                  padding: '0.5rem 0.65rem',
                  fontSize: '0.8125rem',
                  borderRadius: 'var(--radius-sm)'
                }}
              >
                {theme === 'dark' ? <Sun size={15} color="var(--warning)" /> : <Moon size={15} color="var(--accent-primary)" />}
                <span>Theme: {theme === 'dark' ? 'Dark Void' : 'Light Mode'}</span>
              </button>
            </div>

            <div style={{ borderTop: '1px solid var(--border-subtle)', margin: '0.2rem 0' }} />

            <button
              onClick={handleLogout}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                padding: '0.5rem 0.65rem',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                backgroundColor: 'transparent',
                color: 'var(--danger)',
                fontSize: '0.8125rem',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'background-color 0.15s ease'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--danger-bg)')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <LogOut size={15} />
              <span>Log out</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
