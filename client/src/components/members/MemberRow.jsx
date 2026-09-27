import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Avatar from '../ui/Avatar';
import MemberStatus from './MemberStatus';
import MemberRoleBadge from './MemberRoleBadge';
import { Shield, UserMinus, ChevronRight, MoreVertical } from 'lucide-react';

export default function MemberRow({
  member,
  isCurrentUser,
  onChangeRole,
  onRemove
}) {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const activeProjectId = projectId || 'proj_1';

  const isOwner = member.role === 'owner';

  return (
    <div
      onClick={() => navigate(`/app/projects/${activeProjectId}/members/${member.id}`)}
      style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(220px, 2fr) 1.2fr 1fr 1.2fr 1.5fr auto',
        alignItems: 'center',
        padding: '0.85rem 1rem',
        borderBottom: '1px solid var(--border-subtle)',
        cursor: 'pointer',
        transition: 'background-color 0.15s ease',
        gap: '0.75rem'
      }}
      className="member-row-hover"
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.02)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'transparent';
      }}
    >
      {/* Name, Username & You Tag */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
        <Avatar name={member.name} src={member.avatar} size={36} />
        <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'nowrap' }}>
            <span
              style={{
                fontSize: '0.875rem',
                fontWeight: 600,
                color: 'var(--text-primary)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
            >
              {member.name}
            </span>
            {isCurrentUser && (
              <span
                style={{
                  fontSize: '0.675rem',
                  fontWeight: 600,
                  fontFamily: 'var(--font-mono)',
                  backgroundColor: 'rgba(0, 229, 163, 0.15)',
                  color: 'var(--accent-primary)',
                  padding: '0.05rem 0.35rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid rgba(0, 229, 163, 0.3)'
                }}
              >
                You
              </span>
            )}
          </div>
          <span
            style={{
              fontSize: '0.775rem',
              color: 'var(--text-muted)',
              fontFamily: 'var(--font-mono)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >
            @{member.username}
          </span>
        </div>
      </div>

      {/* Role */}
      <div>
        <MemberRoleBadge role={member.role} />
      </div>

      {/* Status */}
      <div>
        <MemberStatus status={member.status} />
      </div>

      {/* Joined Date */}
      <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontFamily: 'var(--font-sans)' }}>
        {member.joinedAt}
      </div>

      {/* Contribution summary */}
      <div style={{ fontSize: '0.775rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
        {member.contributions ? (
          <span>
            {member.contributions.commits} commits • {member.contributions.tasksCompleted} tasks
          </span>
        ) : (
          <span style={{ color: 'var(--text-muted)' }}>0 commits</span>
        )}
      </div>

      {/* Actions */}
      <div
        style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
        onClick={(e) => e.stopPropagation()}
      >
        {isOwner ? (
          <span
            style={{
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              padding: '0.25rem 0.5rem'
            }}
            title="Project owner cannot be removed"
          >
            <Shield size={12} color="var(--accent-primary)" />
            Owner
          </span>
        ) : (
          <>
            <button
              type="button"
              onClick={() => onChangeRole(member)}
              className="clb-btn clb-btn-ghost"
              style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', height: 'auto' }}
              title="Change member role"
            >
              Change role
            </button>
            <button
              type="button"
              onClick={() => onRemove(member)}
              className="clb-btn clb-btn-ghost"
              style={{
                fontSize: '0.75rem',
                padding: '0.25rem 0.4rem',
                height: 'auto',
                color: 'var(--danger, #ff5c70)'
              }}
              title="Remove member"
            >
              <UserMinus size={14} />
            </button>
          </>
        )}

        <ChevronRight size={16} color="var(--text-muted)" style={{ marginLeft: '0.25rem' }} />
      </div>
    </div>
  );
}
