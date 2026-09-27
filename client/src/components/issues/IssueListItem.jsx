import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import IssueStatusBadge from './IssueStatusBadge';
import TaskPriorityBadge from '../tasks/TaskPriorityBadge';
import { MessageSquare, Clock } from 'lucide-react';

export default function IssueListItem({ issue }) {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const activeProjectId = projectId || 'proj_1';

  if (!issue) return null;

  const commentsCount = issue.comments ? issue.comments.length : 0;

  return (
    <div
      onClick={() => navigate(`/app/projects/${activeProjectId}/issues/${issue.id || issue.number}`)}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.85rem 1.1rem',
        borderBottom: '1px solid var(--border-subtle)',
        cursor: 'pointer',
        transition: 'background-color 0.12s ease',
        gap: '1rem',
        flexWrap: 'wrap'
      }}
      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.03)')}
      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
    >
      {/* Left Column: Number, Title, Author & Metadata */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem', flex: '1 1 300px', minWidth: 0 }}>
        <IssueStatusBadge status={issue.status} />

        <div style={{ minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.85rem', fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--text-muted)' }}>
              #{issue.number}
            </span>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0, lineHeight: 1.35 }}>
              {issue.title}
            </h4>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginTop: '0.35rem', fontSize: '0.75rem', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
            <span>opened by {issue.author || 'Praveen'}</span>
            <span>•</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <Clock size={11} /> {issue.createdAt || 'recently'}
            </span>

            {/* Labels */}
            {issue.labels && issue.labels.length > 0 && (
              <div style={{ display: 'flex', gap: '0.3rem' }}>
                {issue.labels.map((lbl) => (
                  <span
                    key={lbl}
                    style={{
                      fontSize: '0.685rem',
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--accent-purple)',
                      backgroundColor: 'rgba(139, 124, 255, 0.1)',
                      padding: '0.05rem 0.4rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid rgba(139, 124, 255, 0.2)'
                    }}
                  >
                    {lbl}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Column: Priority, Assignee & Comments Count */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexShrink: 0 }}>
        <TaskPriorityBadge priority={issue.priority} />

        {/* Assignee */}
        {issue.assignee ? (
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
              color: 'var(--accent-primary)'
            }}
            title={`Assigned to ${issue.assignee.name}`}
          >
            {issue.assignee.initials || 'PR'}
          </div>
        ) : (
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Unassigned</span>
        )}

        {/* Comments Count */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          <MessageSquare size={13} />
          <span>{commentsCount}</span>
        </div>
      </div>
    </div>
  );
}
