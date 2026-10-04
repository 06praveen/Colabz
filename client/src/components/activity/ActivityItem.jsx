import React from 'react';
import ActivityIcon from './ActivityIcon';

export default function ActivityItem({ activity, isLast = false }) {
  const actor = (activity.actor && typeof activity.actor === 'object')
    ? {
        name: activity.actor.name || 'Team Member',
        avatar: activity.actor.avatar,
        color: activity.actor.avatarColor || '#6366f1',
        initials: (activity.actor.name || 'TM')
          .split(' ')
          .map((n) => n[0])
          .join('')
          .substring(0, 2)
          .toUpperCase(),
      }
    : {
        name: activity.actorName || activity.user || 'Team Member',
        initials: activity.avatarInitials || 'TM',
        color: '#6366f1',
      };

  const project = (activity.project && typeof activity.project === 'object')
    ? { name: activity.project.name || 'Project' }
    : {
        name: activity.projectName || 'Project',
      };

  return (
    <div style={{ display: 'flex', gap: '1rem', position: 'relative' }}>
      {/* Timeline Connector Column */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
        <div
          style={{
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            backgroundColor: 'var(--bg-elevated)',
            border: '1px solid var(--border-default)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2,
            boxShadow: '0 2px 6px rgba(0,0,0,0.4)'
          }}
        >
          <ActivityIcon type={activity.type} size={14} />
        </div>
        {!isLast && (
          <div
            style={{
              width: '2px',
              flex: 1,
              backgroundColor: 'var(--border-subtle)',
              marginTop: '4px',
              marginBottom: '4px'
            }}
          />
        )}
      </div>

      {/* Content Body */}
      <div
        style={{
          flex: 1,
          paddingBottom: isLast ? '0' : '1.25rem'
        }}
      >
        <div
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-sm)',
            padding: '0.85rem 1rem',
            transition: 'border-color 0.15s ease'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--border-hover)')}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-default)')}
        >
          {/* Header Row */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.5rem',
              marginBottom: '0.35rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div
                style={{
                  width: '22px',
                  height: '22px',
                  borderRadius: '50%',
                  background: actor.color || 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                  color: '#ffffff',
                  fontSize: '0.65rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {actor.initials || actor.name.slice(0, 2).toUpperCase()}
              </div>
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                {activity.title}
              </span>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              {activity.timeAgo}
            </span>
          </div>

          {/* Detail snippet */}
          {activity.detail && (
            <p
              style={{
                margin: '0 0 0.5rem 0',
                fontSize: '0.8125rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.45,
                fontFamily: activity.type.includes('commit') || activity.type.includes('branch') ? 'var(--font-mono)' : 'var(--font-sans)'
              }}
            >
              {activity.detail}
            </p>
          )}

          {/* Footer Metadata */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.75rem' }}>
            <span
              style={{
                color: 'var(--accent-primary)',
                fontFamily: 'var(--font-mono)',
                fontWeight: 500
              }}
            >
              {project.name}
            </span>

            {activity.metadata?.branch && (
              <span
                style={{
                  color: 'var(--text-muted)',
                  fontFamily: 'var(--font-mono)',
                  backgroundColor: 'rgba(255,255,255,0.04)',
                  padding: '0.1rem 0.4rem',
                  borderRadius: '3px'
                }}
              >
                branch: {activity.metadata.branch}
              </span>
            )}

            {activity.metadata?.commitSha && (
              <span
                style={{
                  color: 'var(--text-muted)',
                  fontFamily: 'var(--font-mono)',
                  backgroundColor: 'rgba(255,255,255,0.04)',
                  padding: '0.1rem 0.4rem',
                  borderRadius: '3px'
                }}
              >
                sha: {activity.metadata.commitSha}
              </span>
            )}

            {activity.metadata?.taskId && (
              <span
                style={{
                  color: 'var(--text-muted)',
                  fontFamily: 'var(--font-mono)',
                  backgroundColor: 'rgba(255,255,255,0.04)',
                  padding: '0.1rem 0.4rem',
                  borderRadius: '3px'
                }}
              >
                {activity.metadata.taskId}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
