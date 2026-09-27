import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, ArrowRight } from 'lucide-react';
import ActivityItem from './ActivityItem';
import { useNotificationContext } from '../../context/NotificationContext';

export default function ProjectActivity({ projectId, limit = 5 }) {
  const navigate = useNavigate();
  const { activity } = useNotificationContext();

  const projectActivities = activity
    .filter((a) => (projectId ? a.projectId === projectId : true))
    .slice(0, limit);

  return (
    <div
      style={{
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-md)',
        padding: '1.25rem',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1rem',
          paddingBottom: '0.75rem',
          borderBottom: '1px solid var(--border-subtle)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Activity size={18} color="var(--accent-primary)" />
          <h3 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            Recent Activity
          </h3>
        </div>
        <button
          onClick={() => navigate(`/app/activity${projectId ? `?project=${projectId}` : ''}`)}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--accent-primary)',
            fontSize: '0.8125rem',
            fontWeight: 500,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem'
          }}
        >
          <span>View all</span>
          <ArrowRight size={14} />
        </button>
      </div>

      {projectActivities.length === 0 ? (
        <div style={{ padding: '1.5rem 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
          No recent activity for this project.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {projectActivities.map((act, idx) => (
            <ActivityItem
              key={act.id}
              activity={act}
              isLast={idx === projectActivities.length - 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
