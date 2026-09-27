import React from 'react';
import { Activity } from 'lucide-react';
import ActivityItem from './ActivityItem';

export default function ActivityTimeline({ activities = [] }) {
  if (!activities || activities.length === 0) {
    return (
      <div
        style={{
          padding: '3rem 1.5rem',
          textAlign: 'center',
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-md)'
        }}
      >
        <Activity size={32} color="var(--text-muted)" style={{ opacity: 0.4, marginBottom: '0.75rem' }} />
        <h3 style={{ margin: '0 0 0.35rem 0', fontSize: '1rem', color: 'var(--text-primary)' }}>
          No activity found
        </h3>
        <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
          Project activity and commits will appear here as your team collaborates.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {activities.map((act, index) => (
        <ActivityItem
          key={act.id}
          activity={act}
          isLast={index === activities.length - 1}
        />
      ))}
    </div>
  );
}
