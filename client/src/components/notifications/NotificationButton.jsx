import React from 'react';
import { Bell } from 'lucide-react';
import NotificationBadge from './NotificationBadge';
import { useNotificationContext } from '../../context/NotificationContext';

export default function NotificationButton({ isOpen, onClick }) {
  const { unreadCount } = useNotificationContext();

  return (
    <button
      onClick={onClick}
      aria-label={`View notifications (${unreadCount} unread)`}
      style={{
        background: 'none',
        border: 'none',
        color: isOpen ? 'var(--accent-primary)' : 'var(--text-secondary)',
        cursor: 'pointer',
        padding: '8px',
        borderRadius: 'var(--radius-sm)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        transition: 'all 0.15s ease'
      }}
      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)')}
      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
    >
      <Bell size={18} />
      <div style={{ position: 'absolute', top: '4px', right: '4px' }}>
        <NotificationBadge count={unreadCount} />
      </div>
    </button>
  );
}
