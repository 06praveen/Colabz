import React, { useState } from 'react';
import { Bell, CheckCheck } from 'lucide-react';
import { mockNotifications as initialNotifs } from '../mock/notifications';
import { useToast } from '../context/ToastContext';

export default function Notifications() {
  const [notifications, setNotifications] = useState(initialNotifs);
  const { addToast } = useToast();

  const handleMarkAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, unread: false })));
    addToast({ title: 'Notifications updated', message: 'All notifications marked as read', type: 'success' });
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.3px', margin: 0 }}>
            Notifications
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: '0.25rem 0 0' }}>
            Alerts for commits, issues, and team access.
          </p>
        </div>

        <button onClick={handleMarkAllRead} className="clb-btn clb-btn-secondary">
          <CheckCheck size={15} />
          Mark all as read
        </button>
      </div>

      <div className="clb-card" style={{ display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
        {notifications.map((n) => (
          <div
            key={n.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '1rem 1.25rem',
              borderBottom: '1px solid var(--border-subtle)',
              backgroundColor: n.unread ? 'rgba(0, 229, 163, 0.03)' : 'transparent'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--bg-elevated)',
                  border: '1px solid var(--border-default)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--accent-primary)'
                }}
              >
                <Bell size={16} />
              </div>
              <div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                  <span style={{ fontWeight: 600 }}>{n.user.name}</span> {n.action}
                </div>
                <div style={{ fontSize: '0.785rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                  {n.target}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                {n.time}
              </span>
              {n.unread && (
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--accent-primary)' }} />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
