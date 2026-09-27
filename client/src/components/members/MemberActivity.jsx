import React from 'react';
import { GitCommit, CheckSquare, CircleDot, MessageSquare, UserPlus, Clock } from 'lucide-react';

export default function MemberActivity({ activities = [] }) {
  if (!activities || activities.length === 0) {
    return (
      <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
        No recent activity recorded for this member.
      </div>
    );
  }

  const getActivityIcon = (actionStr) => {
    const act = (actionStr || '').toLowerCase();
    if (act.includes('push') || act.includes('commit')) {
      return <GitCommit size={14} color="var(--accent-primary)" />;
    }
    if (act.includes('task') || act.includes('completed')) {
      return <CheckSquare size={14} color="var(--success, #00e5a3)" />;
    }
    if (act.includes('issue') || act.includes('opened')) {
      return <CircleDot size={14} color="var(--warning, #eab308)" />;
    }
    if (act.includes('comment')) {
      return <MessageSquare size={14} color="#818cf8" />;
    }
    return <UserPlus size={14} color="var(--accent-primary)" />;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {activities.map((item, idx) => (
        <div
          key={item.id || idx}
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.75rem',
            padding: '0.75rem 0.85rem',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--bg-elevated)',
            border: '1px solid var(--border-subtle)',
            fontSize: '0.8125rem'
          }}
        >
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'rgba(255,255,255,0.03)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              marginTop: '0.1rem'
            }}
          >
            {getActivityIcon(item.action)}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                {item.action}
              </span>
              <span
                style={{
                  fontSize: '0.725rem',
                  color: 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  whiteSpace: 'nowrap'
                }}
              >
                <Clock size={11} />
                {item.time || item.timestamp}
              </span>
            </div>

            {item.detail && (
              <p
                style={{
                  margin: '0.2rem 0 0',
                  color: 'var(--text-muted)',
                  fontSize: '0.775rem',
                  fontFamily: 'var(--font-mono)'
                }}
              >
                {item.detail}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
