import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import TaskStatusBadge from './TaskStatusBadge';
import TaskPriorityBadge from './TaskPriorityBadge';
import { Calendar } from 'lucide-react';

export default function TaskList({ tasks = [] }) {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const activeProjectId = projectId || 'proj_1';

  if (!tasks || tasks.length === 0) {
    return null;
  }

  return (
    <div
      style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden'
      }}
    >
      {/* Table Header */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(220px, 2.5fr) minmax(110px, 1fr) minmax(100px, 1fr) minmax(130px, 1.2fr)',
          padding: '0.6rem 1rem',
          backgroundColor: 'var(--bg-elevated)',
          borderBottom: '1px solid var(--border-default)',
          fontSize: '0.725rem',
          fontWeight: 600,
          fontFamily: 'var(--font-mono)',
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}
      >
        <div>Task</div>
        <div>Status</div>
        <div>Priority</div>
        <div>Assignee</div>
      </div>

      {/* Table Body Rows */}
      {tasks.map((t) => (
        <div
          key={t.id || t.identifier}
          onClick={() => navigate(`/app/projects/${activeProjectId}/tasks/${t.id || t.identifier}`)}
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(220px, 2.5fr) minmax(110px, 1fr) minmax(100px, 1fr) minmax(130px, 1.2fr)',
            alignItems: 'center',
            padding: '0.75rem 1rem',
            borderBottom: '1px solid var(--border-subtle)',
            cursor: 'pointer',
            transition: 'background-color 0.12s ease'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.03)')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
        >
          {/* Identifier + Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', minWidth: 0, paddingRight: '0.5rem' }}>
            <span
              style={{
                fontSize: '0.725rem',
                fontFamily: 'var(--font-mono)',
                fontWeight: 600,
                color: 'var(--accent-primary)',
                backgroundColor: 'rgba(0, 229, 163, 0.08)',
                padding: '0.1rem 0.4rem',
                borderRadius: 'var(--radius-sm)',
                flexShrink: 0
              }}
            >
              {t.identifier || 'COL-1'}
            </span>
            <span
              style={{
                fontSize: '0.85rem',
                fontWeight: 500,
                color: 'var(--text-primary)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
            >
              {t.title}
            </span>
          </div>

          {/* Status */}
          <div>
            <TaskStatusBadge status={t.status} />
          </div>

          {/* Priority */}
          <div>
            <TaskPriorityBadge priority={t.priority} />
          </div>

          {/* Assignee */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            {t.assignee ? (
              <>
                <div
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--bg-elevated)',
                    border: '1px solid var(--border-default)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.685rem',
                    fontWeight: 600,
                    color: 'var(--accent-primary)',
                    flexShrink: 0
                  }}
                >
                  {t.assignee.initials || 'PR'}
                </div>
                <span
                  style={{
                    fontSize: '0.8125rem',
                    color: 'var(--text-secondary)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                >
                  {t.assignee.name}
                </span>
              </>
            ) : (
              <span style={{ fontSize: '0.785rem', color: 'var(--text-muted)' }}>Unassigned</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
