import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCheck, Activity, ArrowRight, Bell } from 'lucide-react';
import { useNotificationContext } from '../../context/NotificationContext';
import NotificationButton from '../notifications/NotificationButton';
import NotificationItem from '../notifications/NotificationItem';

export default function NotificationPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [panelFilter, setPanelFilter] = useState('all'); // all | unread
  const panelRef = useRef(null);
  const navigate = useNavigate();

  const { notifications, unreadCount, markAllAsRead } = useNotificationContext();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const displayedNotifications = notifications
    .filter((n) => (panelFilter === 'unread' ? !n.read : true))
    .slice(0, 6);

  return (
    <div ref={panelRef} style={{ position: 'relative' }}>
      <NotificationButton isOpen={isOpen} onClick={() => setIsOpen(!isOpen)} />

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            style={{
              position: 'absolute',
              top: 'calc(100% + 10px)',
              right: 0,
              zIndex: 100,
              width: '380px',
              maxWidth: 'calc(100vw - 2rem)',
              backgroundColor: 'var(--bg-elevated)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-md)',
              boxShadow: '0 15px 40px rgba(0,0,0,0.6), 0 0 1px rgba(255,255,255,0.1)',
              overflow: 'hidden'
            }}
          >
            {/* Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.75rem 1rem',
                borderBottom: '1px solid var(--border-subtle)',
                backgroundColor: 'rgba(255,255,255,0.01)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Notifications
                </span>
                {unreadCount > 0 && (
                  <span
                    style={{
                      fontSize: '0.7rem',
                      fontFamily: 'var(--font-mono)',
                      backgroundColor: 'rgba(99, 102, 241, 0.15)',
                      color: 'var(--accent-primary)',
                      padding: '0.1rem 0.45rem',
                      borderRadius: 'var(--radius-pill)',
                      border: '1px solid rgba(99, 102, 241, 0.3)'
                    }}
                  >
                    {unreadCount} new
                  </span>
                )}
              </div>

              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    transition: 'color 0.15s ease'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent-primary)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
                >
                  <CheckCheck size={14} />
                  Mark all read
                </button>
              )}
            </div>

            {/* Quick Filter Tabs */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.4rem 1rem',
                borderBottom: '1px solid var(--border-subtle)',
                backgroundColor: 'rgba(0,0,0,0.2)'
              }}
            >
              <button
                onClick={() => setPanelFilter('all')}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '0.75rem',
                  fontWeight: panelFilter === 'all' ? 600 : 500,
                  color: panelFilter === 'all' ? 'var(--accent-primary)' : 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '0.2rem 0.4rem'
                }}
              >
                All ({notifications.length})
              </button>
              <span style={{ color: 'var(--border-subtle)' }}>•</span>
              <button
                onClick={() => setPanelFilter('unread')}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '0.75rem',
                  fontWeight: panelFilter === 'unread' ? 600 : 500,
                  color: panelFilter === 'unread' ? 'var(--accent-primary)' : 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '0.2rem 0.4rem'
                }}
              >
                Unread ({unreadCount})
              </button>
            </div>

            {/* List */}
            <div style={{ maxHeight: '340px', overflowY: 'auto' }}>
              {displayedNotifications.length === 0 ? (
                <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
                  <Bell size={24} style={{ opacity: 0.3, marginBottom: '0.5rem' }} />
                  <div>You're all caught up!</div>
                  <div style={{ fontSize: '0.75rem', opacity: 0.7, marginTop: '2px' }}>
                    No unread notifications to display.
                  </div>
                </div>
              ) : (
                displayedNotifications.map((n) => (
                  <NotificationItem
                    key={n.id}
                    notification={n}
                    compact
                    onClosePanel={() => setIsOpen(false)}
                  />
                ))
              )}
            </div>

            {/* Footer */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.65rem 1rem',
                borderTop: '1px solid var(--border-subtle)',
                backgroundColor: 'rgba(0,0,0,0.2)'
              }}
            >
              <button
                onClick={() => {
                  setIsOpen(false);
                  navigate('/app/notifications');
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--accent-primary)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem'
                }}
              >
                <span>View all notifications</span>
                <ArrowRight size={13} />
              </button>

              <button
                onClick={() => {
                  setIsOpen(false);
                  navigate('/app/activity');
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
              >
                <Activity size={13} />
                <span>View all activity</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
