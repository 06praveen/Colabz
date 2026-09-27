import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Bell,
  CheckCheck,
  Search,
  Filter,
  Trash2,
  Sliders,
  CheckCircle2
} from 'lucide-react';
import { useNotificationContext } from '../../context/NotificationContext';
import NotificationItem from '../../components/notifications/NotificationItem';
import NotificationFilters from '../../components/notifications/NotificationFilters';
import NotificationPreferences from '../../components/notifications/NotificationPreferences';

export default function Notifications() {
  const {
    notifications,
    unreadCount,
    filter,
    setFilter,
    searchQuery,
    setSearchQuery,
    markAllAsRead,
    clearNotifications
  } = useNotificationContext();

  const [showPreferences, setShowPreferences] = useState(false);

  // Filter notifications by active tab and search query
  const filteredNotifications = notifications.filter((n) => {
    // Tab filter
    if (filter === 'unread' && n.read) return false;
    if (filter === 'mention' && n.type !== 'mention') return false;
    if (filter === 'task' && n.type !== 'task' && n.type !== 'assignment') return false;
    if (filter === 'issue' && n.type !== 'issue') return false;
    if (filter === 'repository' && n.type !== 'repository') return false;

    // Search query
    if (searchQuery && searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const titleMatch = n.title.toLowerCase().includes(q);
      const msgMatch = n.message ? n.message.toLowerCase().includes(q) : false;
      return titleMatch || msgMatch;
    }

    return true;
  });

  // Group notifications by date (Today, Yesterday, Earlier this week, Older)
  const groupDateOrder = ['Today', 'Yesterday', 'Earlier this week', 'Older'];
  const groupedNotifications = groupDateOrder.map((group) => ({
    group,
    items: filteredNotifications.filter((n) => (n.groupDate || 'Today') === group)
  })).filter((g) => g.items.length > 0);

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', paddingBottom: '3rem' }}>
      {/* Page Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.5rem'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Notifications
            </h1>
            {unreadCount > 0 && (
              <span
                style={{
                  fontSize: '0.75rem',
                  fontFamily: 'var(--font-mono)',
                  backgroundColor: 'rgba(99, 102, 241, 0.15)',
                  color: 'var(--accent-primary)',
                  padding: '0.15rem 0.6rem',
                  borderRadius: '999px',
                  border: '1px solid rgba(99, 102, 241, 0.3)',
                  fontWeight: 600
                }}
              >
                {unreadCount} unread
              </span>
            )}
          </div>
          <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Everything that needs your attention across your projects.
          </p>
        </div>

        {/* Header Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <button
            onClick={() => setShowPreferences(!showPreferences)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.45rem 0.85rem',
              borderRadius: 'var(--radius-sm)',
              border: showPreferences ? '1px solid rgba(99, 102, 241, 0.4)' : '1px solid var(--border-default)',
              backgroundColor: showPreferences ? 'rgba(99, 102, 241, 0.1)' : 'var(--bg-input)',
              color: showPreferences ? 'var(--accent-primary)' : 'var(--text-secondary)',
              fontSize: '0.8125rem',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <Sliders size={14} />
            <span>Settings</span>
          </button>

          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.45rem 0.85rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-default)',
                backgroundColor: 'var(--bg-input)',
                color: 'var(--text-primary)',
                fontSize: '0.8125rem',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--accent-primary)')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-default)')}
            >
              <CheckCheck size={14} color="var(--accent-primary)" />
              <span>Mark all read</span>
            </button>
          )}

          {notifications.length > 0 && (
            <button
              onClick={clearNotifications}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.45rem 0.75rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-default)',
                backgroundColor: 'var(--bg-input)',
                color: 'var(--text-muted)',
                fontSize: '0.8125rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#ef4444';
                e.currentTarget.style.color = '#ef4444';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-default)';
                e.currentTarget.style.color = 'var(--text-muted)';
              }}
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Preferences Collapsible Section */}
      {showPreferences && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2 }}
          style={{ marginBottom: '1.5rem' }}
        >
          <NotificationPreferences />
        </motion.div>
      )}

      {/* Filter Tabs & Search Bar Row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.25rem'
        }}
      >
        <NotificationFilters activeFilter={filter} onFilterChange={setFilter} />

        {/* Search input */}
        <div style={{ position: 'relative', minWidth: '240px' }}>
          <Search
            size={14}
            color="var(--text-muted)"
            style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }}
          />
          <input
            type="text"
            placeholder="Search notifications..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '0.45rem 0.75rem 0.45rem 2.2rem',
              backgroundColor: 'var(--bg-input)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-pill)',
              color: 'var(--text-primary)',
              fontSize: '0.8125rem',
              outline: 'none',
              transition: 'border-color 0.15s ease'
            }}
            onFocus={(e) => (e.target.style.borderColor = 'var(--accent-primary)')}
            onBlur={(e) => (e.target.style.borderColor = 'var(--border-default)')}
          />
        </div>
      </div>

      {/* Notifications Grouped Feed */}
      {groupedNotifications.length === 0 ? (
        <div
          style={{
            padding: '4rem 2rem',
            textAlign: 'center',
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-md)'
          }}
        >
          <CheckCircle2 size={40} color="var(--success)" style={{ opacity: 0.8, marginBottom: '1rem' }} />
          <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.125rem', color: 'var(--text-primary)' }}>
            You're all caught up
          </h3>
          <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Nothing needs your attention right now. Notifications will appear as tasks are assigned or members tag you.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {groupedNotifications.map(({ group, items }) => (
            <div key={group}>
              <h3
                style={{
                  margin: '0 0 0.75rem 0',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}
              >
                {group}
              </h3>
              <div
                style={{
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border-default)',
                  borderRadius: 'var(--radius-md)',
                  overflow: 'hidden'
                }}
              >
                {items.map((n) => (
                  <NotificationItem key={n.id} notification={n} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
