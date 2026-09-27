import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import TaskPriorityBadge from './TaskPriorityBadge';
import TaskStatusBadge from './TaskStatusBadge';
import { Calendar, User } from 'lucide-react';

export default function TaskCard({ task }) {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const activeProjectId = projectId || 'proj_1';

  if (!task) return null;

  return (
    <div
      onClick={() => navigate(`/app/projects/${activeProjectId}/tasks/${task.id || task.identifier}`)}
      className="clb-card clb-card-interactive"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.65rem',
        padding: '0.85rem 1rem',
        cursor: 'pointer',
        userSelect: 'none'
      }}
    >
      {/* Top Header: Identifier + Priority */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
        <span
          style={{
            fontSize: '0.725rem',
            fontFamily: 'var(--font-mono)',
            fontWeight: 600,
            color: 'var(--accent-primary)',
            backgroundColor: 'rgba(0, 229, 163, 0.08)',
            padding: '0.1rem 0.4rem',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid rgba(0, 229, 163, 0.2)'
          }}
        >
          {task.identifier || 'COL-1'}
        </span>

        <TaskPriorityBadge priority={task.priority} />
      </div>

      {/* Task Title */}
      <h4
        style={{
          fontSize: '0.875rem',
          fontWeight: 600,
          color: 'var(--text-primary)',
          margin: 0,
          lineHeight: 1.35
        }}
      >
        {task.title}
      </h4>

      {/* Short Description if available */}
      {task.description && (
        <p
          style={{
            fontSize: '0.785rem',
            color: 'var(--text-secondary)',
            margin: 0,
            lineHeight: 1.4,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}
        >
          {task.description}
        </p>
      )}

      {/* Labels */}
      {task.labels && task.labels.length > 0 && (
        <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', marginTop: '0.1rem' }}>
          {task.labels.map((lbl) => (
            <span
              key={lbl}
              style={{
                fontSize: '0.685rem',
                fontFamily: 'var(--font-mono)',
                color: 'var(--text-muted)',
                backgroundColor: 'var(--bg-input)',
                padding: '0.1rem 0.35rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-subtle)'
              }}
            >
              {lbl}
            </span>
          ))}
        </div>
      )}

      {/* Footer: Due Date & Assignee Initials */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.725rem',
          color: 'var(--text-muted)',
          borderTop: '1px solid var(--border-subtle)',
          paddingTop: '0.55rem',
          marginTop: '0.2rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <Calendar size={12} />
          <span>{task.dueDate ? `Due ${task.dueDate}` : 'No date'}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          {task.assignee ? (
            <div
              style={{
                width: '22px',
                height: '22px',
                borderRadius: '50%',
                backgroundColor: 'var(--bg-elevated)',
                border: '1px solid var(--border-default)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.65rem',
                fontWeight: 600,
                color: 'var(--accent-primary)'
              }}
              title={task.assignee.name}
            >
              {task.assignee.initials || 'PR'}
            </div>
          ) : (
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Unassigned</span>
          )}
        </div>
      </div>
    </div>
  );
}
