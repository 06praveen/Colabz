import React from 'react';
import { useNotificationContext } from '../../context/NotificationContext';

export default function NotificationFilters({ activeFilter, onFilterChange }) {
  const { notifications, unreadCount } = useNotificationContext();

  const filterOptions = [
    { id: 'all', label: 'All', count: notifications.length },
    { id: 'unread', label: 'Unread', count: unreadCount },
    { id: 'mention', label: 'Mentions', count: notifications.filter((n) => n.type === 'mention').length },
    { id: 'task', label: 'Tasks', count: notifications.filter((n) => n.type === 'task' || n.type === 'assignment').length },
    { id: 'issue', label: 'Issues', count: notifications.filter((n) => n.type === 'issue').length },
    { id: 'repository', label: 'Repository', count: notifications.filter((n) => n.type === 'repository').length }
  ];

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.4rem',
        overflowX: 'auto',
        paddingBottom: '0.25rem',
        scrollbarWidth: 'none'
      }}
    >
      {filterOptions.map((tab) => {
        const isActive = activeFilter === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onFilterChange(tab.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.35rem 0.75rem',
              borderRadius: 'var(--radius-pill)',
              border: isActive ? '1px solid rgba(99, 102, 241, 0.4)' : '1px solid var(--border-default)',
              backgroundColor: isActive ? 'rgba(99, 102, 241, 0.12)' : 'var(--bg-input)',
              color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
              fontSize: '0.8125rem',
              fontWeight: isActive ? 600 : 500,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.15s ease',
              outline: 'none'
            }}
            onMouseEnter={(e) => {
              if (!isActive) e.currentTarget.style.borderColor = 'var(--border-hover)';
            }}
            onMouseLeave={(e) => {
              if (!isActive) e.currentTarget.style.borderColor = 'var(--border-default)';
            }}
          >
            <span>{tab.label}</span>
            {tab.count > 0 && (
              <span
                style={{
                  fontSize: '0.7rem',
                  fontFamily: 'var(--font-mono)',
                  backgroundColor: isActive ? 'rgba(99, 102, 241, 0.25)' : 'rgba(255,255,255,0.06)',
                  color: isActive ? 'var(--accent-primary)' : 'var(--text-muted)',
                  padding: '0.05rem 0.35rem',
                  borderRadius: '999px'
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
