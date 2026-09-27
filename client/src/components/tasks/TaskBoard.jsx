import React from 'react';
import TaskCard from './TaskCard';
import { Circle, Clock, AlertCircle, CheckCircle2 } from 'lucide-react';

const columns = [
  { key: 'TODO', label: 'TODO', icon: Circle, color: 'var(--text-muted)' },
  { key: 'IN PROGRESS', label: 'IN PROGRESS', icon: Clock, color: 'var(--warning)' },
  { key: 'IN REVIEW', label: 'IN REVIEW', icon: AlertCircle, color: 'var(--accent-purple)' },
  { key: 'DONE', label: 'DONE', icon: CheckCircle2, color: 'var(--success)' }
];

export default function TaskBoard({ tasks = [] }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, minmax(260px, 1fr))',
        gap: '1.15rem',
        overflowX: 'auto',
        paddingBottom: '0.5rem'
      }}
    >
      {columns.map((col) => {
        const colTasks = tasks.filter((t) => String(t.status).toUpperCase() === col.key);
        const Icon = col.icon;

        return (
          <div
            key={col.key}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.85rem',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-md)',
              padding: '0.85rem'
            }}
          >
            {/* Column Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingBottom: '0.5rem',
                borderBottom: '1px solid var(--border-subtle)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <Icon size={14} color={col.color} />
                <span
                  style={{
                    fontSize: '0.785rem',
                    fontWeight: 700,
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--text-primary)',
                    letterSpacing: '0.4px'
                  }}
                >
                  {col.label}
                </span>
              </div>

              <span
                style={{
                  fontSize: '0.7rem',
                  fontFamily: 'var(--font-mono)',
                  backgroundColor: 'var(--bg-elevated)',
                  border: '1px solid var(--border-default)',
                  color: 'var(--text-muted)',
                  padding: '0.1rem 0.45rem',
                  borderRadius: 'var(--radius-pill)'
                }}
              >
                {colTasks.length}
              </span>
            </div>

            {/* Column Cards Container */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', minHeight: '120px' }}>
              {colTasks.length === 0 ? (
                <div
                  style={{
                    padding: '1.5rem 0.5rem',
                    textAlign: 'center',
                    color: 'var(--text-muted)',
                    fontSize: '0.785rem',
                    border: '1px dashed var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)'
                  }}
                >
                  No tasks in {col.label.toLowerCase()}
                </div>
              ) : (
                colTasks.map((task) => <TaskCard key={task.id || task.identifier} task={task} />)
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
