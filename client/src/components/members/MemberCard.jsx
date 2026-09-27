import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Avatar from '../ui/Avatar';
import MemberStatus from './MemberStatus';
import MemberRoleBadge from './MemberRoleBadge';
import { Shield, UserMinus, ChevronRight } from 'lucide-react';

export default function MemberCard({
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
      className="clb-card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.85rem',
        cursor: 'pointer',
        padding: '1rem',
        transition: 'all 0.15s ease'
      }}
    >
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Avatar name={member.name} src={member.avatar} size={40} />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                {member.name}
              </span>
              {isCurrentUser && (
                <span
                  style={{
                    fontSize: '0.65rem',
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
            <span style={{ fontSize: '0.775rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              @{member.username}
            </span>
          </div>
        </div>

        <MemberStatus status={member.status} />
      </div>

      {/* Role & Joined */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
        <MemberRoleBadge role={member.role} />
        <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Joined {member.joinedAt}</span>
      </div>

      {/* Contributions */}
      {member.contributions && (
        <div
          style={{
            fontSize: '0.75rem',
            fontFamily: 'var(--font-mono)',
            color: 'var(--text-secondary)',
            backgroundColor: 'var(--bg-subtle, rgba(255,255,255,0.02))',
            padding: '0.4rem 0.65rem',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            justifyContent: 'space-between'
          }}
        >
          <span>{member.contributions.commits} commits</span>
          <span>{member.contributions.tasksCompleted} tasks</span>
          <span>{member.contributions.issuesResolved} issues</span>
        </div>
      )}

      {/* Action Footer */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderTop: '1px solid var(--border-subtle)',
          paddingTop: '0.65rem',
          marginTop: '0.2rem'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {isOwner ? (
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <Shield size={13} color="var(--accent-primary)" /> Project owner
          </span>
        ) : (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={() => onChangeRole(member)}
              className="clb-btn clb-btn-ghost"
              style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
            >
              Change role
            </button>
            <button
              type="button"
              onClick={() => onRemove(member)}
              className="clb-btn clb-btn-ghost"
              style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', color: 'var(--danger)' }}
            >
              Remove
            </button>
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', color: 'var(--accent-primary)', fontSize: '0.775rem', fontWeight: 500 }}>
          <span>View profile</span>
          <ChevronRight size={14} />
        </div>
      </div>
    </div>
  );
}
