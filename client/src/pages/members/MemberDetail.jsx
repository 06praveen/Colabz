import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMembers } from '../../context/MemberContext';
import Avatar from '../../components/ui/Avatar';
import MemberStatus from '../../components/members/MemberStatus';
import MemberRoleBadge from '../../components/members/MemberRoleBadge';
import MemberActivity from '../../components/members/MemberActivity';
import Skeleton from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import { ArrowLeft, GitCommit, CheckSquare, CircleDot, Calendar, FolderGit2, Shield, User } from 'lucide-react';
import { ROLE_DESCRIPTIONS } from '../../constants/roles';
import { useProjects } from '../../context/ProjectContext';

export default function MemberDetail() {
  const { memberId, projectId } = useParams();
  const navigate = useNavigate();
  const { getMember, loading, currentUserId } = useMembers();
  const { projects } = useProjects();

  const activeProjectId = projectId || 'proj_1';
  const member = getMember(memberId);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <Skeleton height="32px" width="160px" />
        <Skeleton height="140px" width="100%" />
        <Skeleton height="200px" width="100%" />
      </div>
    );
  }

  if (!member) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <button
          onClick={() => navigate(`/app/projects/${activeProjectId}/members`)}
          className="clb-btn clb-btn-ghost"
          style={{ width: 'fit-content', gap: '0.4rem' }}
        >
          <ArrowLeft size={16} />
          Back to Members
        </button>
        <EmptyState
          icon={User}
          title="Member not found"
          description={`No project member found with ID or username "${memberId}".`}
          actionLabel="View all members"
          onAction={() => navigate(`/app/projects/${activeProjectId}/members`)}
        />
      </div>
    );
  }

  const isCurrentUser = member.id === currentUserId;
  const userProjects = projects.length > 0 ? projects : [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '900px' }}>
      {/* Navigation Back Link */}
      <div>
        <button
          onClick={() => navigate(`/app/projects/${activeProjectId}/members`)}
          className="clb-btn clb-btn-ghost"
          style={{ gap: '0.4rem', fontSize: '0.85rem' }}
        >
          <ArrowLeft size={16} />
          Back to Members
        </button>
      </div>

      {/* Member Header Card */}
      <div
        className="clb-card"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem',
          backgroundColor: 'var(--bg-elevated)',
          padding: '1.5rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Avatar name={member.name} src={member.avatar} size={54} />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <h1 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                  {member.name}
                </h1>
                {isCurrentUser && (
                  <span
                    style={{
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      fontFamily: 'var(--font-mono)',
                      backgroundColor: 'rgba(0, 229, 163, 0.15)',
                      color: 'var(--accent-primary)',
                      padding: '0.1rem 0.45rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid rgba(0, 229, 163, 0.3)'
                    }}
                  >
                    You
                  </span>
                )}
                <MemberRoleBadge role={member.role} />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.25rem', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  @{member.username}
                </span>
                <span style={{ color: 'var(--border-default)' }}>•</span>
                <MemberStatus status={member.status} />
                <span style={{ color: 'var(--border-default)' }}>•</span>
                <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Calendar size={13} /> Joined {member.joinedAt}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Contribution Summary Stats */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: '0.85rem',
            paddingTop: '1rem',
            borderTop: '1px solid var(--border-subtle)'
          }}
        >
          <div
            style={{
              padding: '0.75rem 1rem',
              backgroundColor: 'var(--bg-subtle, rgba(255,255,255,0.02))',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem'
            }}
          >
            <GitCommit size={20} color="var(--accent-primary)" />
            <div>
              <div style={{ fontSize: '1.15rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
                {member.contributions?.commits || 0}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Commits</div>
            </div>
          </div>

          <div
            style={{
              padding: '0.75rem 1rem',
              backgroundColor: 'var(--bg-subtle, rgba(255,255,255,0.02))',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem'
            }}
          >
            <CheckSquare size={20} color="var(--success, #00e5a3)" />
            <div>
              <div style={{ fontSize: '1.15rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
                {member.contributions?.tasksCompleted || 0}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Tasks completed</div>
            </div>
          </div>

          <div
            style={{
              padding: '0.75rem 1rem',
              backgroundColor: 'var(--bg-subtle, rgba(255,255,255,0.02))',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem'
            }}
          >
            <CircleDot size={20} color="var(--warning, #eab308)" />
            <div>
              <div style={{ fontSize: '1.15rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
                {member.contributions?.issuesResolved || 0}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Issues resolved</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Sections Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
        {/* About Section */}
        <div className="clb-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
            About
          </h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
            {member.bio || 'No profile description available for this team member.'}
          </p>
        </div>

        {/* Role Explanation Section */}
        <div className="clb-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Shield size={16} color="var(--accent-primary)" />
            <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
              Project Role — {ROLE_DESCRIPTIONS[member.role]?.label || member.role}
            </h3>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
            {ROLE_DESCRIPTIONS[member.role]?.description || 'Project member permissions.'}
          </p>
        </div>

        {/* Recent Activity Section */}
        <div className="clb-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
            Recent Activity
          </h3>
          <MemberActivity activities={member.activities || []} />
        </div>

        {/* Projects Section */}
        <div className="clb-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
            Projects ({userProjects.length})
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.75rem' }}>
            {userProjects.map((p) => {
              const pId = p._id || p.id || p.slug;
              return (
                <div
                  key={pId}
                  onClick={() => navigate(`/app/projects/${pId}/repository`)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.75rem 0.85rem',
                    backgroundColor: 'var(--bg-elevated)',
                    border: '1px solid var(--border-default)',
                    borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <FolderGit2 size={18} color="var(--accent-primary)" />
                  <div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 600, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
                      {p.name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {p.description || 'Workspace repository'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
