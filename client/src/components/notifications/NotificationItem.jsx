import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckSquare,
  CircleDot,
  GitCommit,
  PhoneCall,
  MessageSquare,
  UserPlus,
  ShieldAlert,
  Bell,
  Trash2,
  ExternalLink
} from 'lucide-react';
import { mockMembers } from '../../mock/members';
import { mockProjects } from '../../mock/projects';
import { useNotificationContext } from '../../context/NotificationContext';

export default function NotificationItem({ notification, compact = false, onClosePanel }) {
  const navigate = useNavigate();
  const { markAsRead, deleteNotification } = useNotificationContext();

  const actor = mockMembers.find((m) => m.id === notification.actorId) || {
    name: 'Team Member',
    initials: 'TM',
    color: '#6366f1'
  };

  const project = mockProjects.find((p) => p.id === notification.projectId) || {
    name: 'Campus Connect'
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'assignment':
      case 'task':
        return <CheckSquare size={14} color="#8b5cf6" />;
      case 'issue':
        return <CircleDot size={14} color="#f59e0b" />;
      case 'repository':
        return <GitCommit size={14} color="#3b82f6" />;
      case 'call':
        return <PhoneCall size={14} color="#10b981" />;
      case 'mention':
      case 'chat':
        return <MessageSquare size={14} color="#ec4899" />;
      case 'member':
        return <UserPlus size={14} color="#06b6d4" />;
      case 'system':
        return <ShieldAlert size={14} color="#64748b" />;
      default:
        return <Bell size={14} color="#8b5cf6" />;
    }
  };

  const getTargetRoute = () => {
    const projId = notification.projectId || 'proj_1';
    switch (notification.entityType) {
      case 'task':
        return `/app/projects/${projId}/tasks`;
      case 'issue':
        return `/app/projects/${projId}/issues`;
      case 'conversation':
      case 'chat':
        return `/app/projects/${projId}/chat`;
      case 'call':
        return `/app/projects/${projId}/calls`;
      case 'repository':
        return `/app/projects/${projId}/repository`;
      case 'member':
        return `/app/projects/${projId}/members`;
      default:
        return `/app/projects/${projId}`;
    }
  };

  const handleClick = (e) => {
    e.stopPropagation();
    if (!notification.read) {
      markAsRead(notification.id);
    }
    if (onClosePanel) onClosePanel();
    navigate(getTargetRoute());
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    deleteNotification(notification.id);
  };

  return (
    <div
      onClick={handleClick}
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: compact ? '0.65rem' : '0.85rem',
        padding: compact ? '0.65rem 0.85rem' : '0.85rem 1rem',
        backgroundColor: !notification.read ? 'rgba(99, 102, 241, 0.05)' : 'transparent',
        borderBottom: '1px solid var(--border-subtle)',
        borderRadius: compact ? '0' : 'var(--radius-sm)',
        cursor: 'pointer',
        transition: 'all 0.15s ease',
        position: 'relative'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.04)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = !notification.read ? 'rgba(99, 102, 241, 0.05)' : 'transparent';
      }}
    >
      {/* Actor Avatar */}
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <div
          style={{
            width: compact ? '32px' : '38px',
            height: compact ? '32px' : '38px',
            borderRadius: '50%',
            background: actor.color || 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: compact ? '0.75rem' : '0.8125rem',
            fontWeight: 600,
            fontFamily: 'var(--font-sans)'
          }}
        >
          {actor.avatar ? (
            <img
              src={actor.avatar}
              alt={actor.name}
              style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
            />
          ) : (
            actor.initials || actor.name.slice(0, 2).toUpperCase()
          )}
        </div>
        {/* Entity type badge overlay */}
        <div
          style={{
            position: 'absolute',
            bottom: '-2px',
            right: '-2px',
            width: '18px',
            height: '18px',
            borderRadius: '50%',
            backgroundColor: 'var(--bg-elevated)',
            border: '1px solid var(--border-default)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
          }}
        >
          {getNotificationIcon(notification.type)}
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.5rem',
            marginBottom: '0.15rem'
          }}
        >
          <h4
            style={{
              margin: 0,
              fontSize: compact ? '0.8125rem' : '0.875rem',
              fontWeight: notification.read ? 500 : 600,
              color: notification.read ? 'var(--text-secondary)' : 'var(--text-primary)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >
            {notification.title}
          </h4>
          <span
            style={{
              fontSize: '0.7rem',
              color: 'var(--text-muted)',
              fontFamily: 'var(--font-mono)',
              flexShrink: 0
            }}
          >
            {notification.timeAgo}
          </span>
        </div>

        {notification.message && (
          <p
            style={{
              margin: '0 0 0.35rem 0',
              fontSize: compact ? '0.75rem' : '0.8125rem',
              color: 'var(--text-muted)',
              lineHeight: 1.4,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}
          >
            {notification.message}
          </p>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span
            style={{
              fontSize: '0.6875rem',
              color: 'var(--accent-primary)',
              backgroundColor: 'rgba(99, 102, 241, 0.1)',
              padding: '0.1rem 0.4rem',
              borderRadius: 'var(--radius-sm)',
              fontFamily: 'var(--font-mono)',
              fontWeight: 500
            }}
          >
            {project.name}
          </span>
          <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
            {notification.type}
          </span>
        </div>
      </div>

      {/* Action Hover Options */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', alignSelf: 'center', flexShrink: 0 }}>
        {!notification.read && (
          <span
            title="Unread"
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: 'var(--accent-primary)',
              boxShadow: '0 0 8px rgba(99, 102, 241, 0.6)'
            }}
          />
        )}
        <button
          onClick={handleDelete}
          title="Delete notification"
          aria-label="Delete notification"
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: '4px',
            borderRadius: 'var(--radius-sm)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: 0.6,
            transition: 'all 0.15s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = '1';
            e.currentTarget.style.color = '#ef4444';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '0.6';
            e.currentTarget.style.color = 'var(--text-muted)';
          }}
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
}
