import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useMembers } from '../../context/MemberContext';
import MemberRow from '../../components/members/MemberRow';
import MemberCard from '../../components/members/MemberCard';
import MemberFilters from '../../components/members/MemberFilters';
import PendingInvitations from '../../components/members/PendingInvitations';
import MemberActivity from '../../components/members/MemberActivity';
import InviteMembersModal from '../../components/members/InviteMembersModal';
import ChangeRoleModal from '../../components/members/ChangeRoleModal';
import RemoveMemberModal from '../../components/members/RemoveMemberModal';
import Skeleton from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import { UserPlus, Users, Activity, Clock, Search } from 'lucide-react';

export default function Members() {
  const {
    filteredMembers,
    teamSummary,
    teamActivity,
    pendingInvitations,
    loading,
    searchQuery,
    currentUserId
  } = useMembers();

  const [searchParams, setSearchParams] = useSearchParams();

  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [selectedMemberForRole, setSelectedMemberForRole] = useState(null);
  const [selectedMemberForRemove, setSelectedMemberForRemove] = useState(null);

  useEffect(() => {
    const action = searchParams.get('action');
    if (action === 'invite') {
      setIsInviteOpen(true);
      setSearchParams({});
    }
  }, [searchParams, setSearchParams]);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <Skeleton height="40px" width="200px" />
        <Skeleton height="36px" width="100%" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <Skeleton height="60px" width="100%" />
          <Skeleton height="60px" width="100%" />
          <Skeleton height="60px" width="100%" />
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.3px' }}>
            Members
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: '0.25rem 0 0' }}>
            People working on this project.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsInviteOpen(true)}
          className="clb-btn clb-btn-primary"
        >
          <UserPlus size={16} />
          <span>Invite members</span>
        </button>
      </div>

      {/* Team Summary Bar */}
      <div
        className="clb-card"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1.25rem',
          flexWrap: 'wrap',
          padding: '0.85rem 1.25rem',
          backgroundColor: 'var(--bg-elevated)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-primary)' }}>
          <Users size={16} />
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            {teamSummary.total} {teamSummary.total === 1 ? 'member' : 'members'}
          </span>
        </div>
        <div style={{ width: '1px', height: '16px', backgroundColor: 'var(--border-subtle)' }} />

        <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8125rem', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
          {teamSummary.developers > 0 && <span>{teamSummary.developers} {teamSummary.developers === 1 ? 'developer' : 'developers'}</span>}
          {teamSummary.designers > 0 && <span>{teamSummary.designers} {teamSummary.designers === 1 ? 'designer' : 'designers'}</span>}
          {teamSummary.owners > 0 && <span>{teamSummary.owners} {teamSummary.owners === 1 ? 'owner' : 'owners'}</span>}
          {teamSummary.admins > 0 && <span>{teamSummary.admins} {teamSummary.admins === 1 ? 'admin' : 'admins'}</span>}
          {teamSummary.viewers > 0 && <span>{teamSummary.viewers} {teamSummary.viewers === 1 ? 'viewer' : 'viewers'}</span>}
        </div>
      </div>

      {/* Filters Bar */}
      <MemberFilters />

      {/* Member List Container */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {filteredMembers.length === 0 ? (
          searchQuery ? (
            <EmptyState
              icon={Search}
              title="No members found"
              description={`No project members matched "${searchQuery}". Try adjusting your search query or role filter.`}
            />
          ) : (
            <EmptyState
              icon={Users}
              title="No team members yet"
              description="Invite your teammates to start collaborating on code, tasks, and issues."
              actionLabel="Invite members"
              onAction={() => setIsInviteOpen(true)}
            />
          )
        ) : (
          <>
            {/* Desktop Table Header */}
            <div className="members-desktop-list" style={{ borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)', overflow: 'hidden', backgroundColor: 'var(--bg-elevated)' }}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'minmax(220px, 2fr) 1.2fr 1fr 1.2fr 1.5fr auto',
                  padding: '0.65rem 1rem',
                  backgroundColor: 'rgba(0, 0, 0, 0.25)',
                  borderBottom: '1px solid var(--border-default)',
                  fontSize: '0.725rem',
                  fontWeight: 600,
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}
              >
                <div>Member</div>
                <div>Role</div>
                <div>Status</div>
                <div>Joined</div>
                <div>Contributions</div>
                <div style={{ textAlign: 'right' }}>Actions</div>
              </div>

              <div>
                {filteredMembers.map((member) => (
                  <MemberRow
                    key={member.id}
                    member={member}
                    isCurrentUser={member.id === currentUserId}
                    onChangeRole={(m) => setSelectedMemberForRole(m)}
                    onRemove={(m) => setSelectedMemberForRemove(m)}
                  />
                ))}
              </div>
            </div>

            {/* Mobile Stacked Cards */}
            <div className="members-mobile-cards" style={{ display: 'none', flexDirection: 'column', gap: '0.85rem' }}>
              {filteredMembers.map((member) => (
                <MemberCard
                  key={member.id}
                  member={member}
                  isCurrentUser={member.id === currentUserId}
                  onChangeRole={(m) => setSelectedMemberForRole(m)}
                  onRemove={(m) => setSelectedMemberForRemove(m)}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Pending Invitations Section */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginTop: '1rem' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
          Pending invitations ({pendingInvitations.length})
        </h3>
        <PendingInvitations />
      </div>

      {/* Recent Team Activity Section */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginTop: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Activity size={18} color="var(--accent-primary)" />
          <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
            Recent team activity
          </h3>
        </div>
        <MemberActivity activities={teamActivity.slice(0, 5)} />
      </div>

      {/* Modals */}
      <InviteMembersModal isOpen={isInviteOpen} onClose={() => setIsInviteOpen(false)} />
      <ChangeRoleModal
        isOpen={!!selectedMemberForRole}
        onClose={() => setSelectedMemberForRole(null)}
        member={selectedMemberForRole}
      />
      <RemoveMemberModal
        isOpen={!!selectedMemberForRemove}
        onClose={() => setSelectedMemberForRemove(null)}
        member={selectedMemberForRemove}
      />
    </div>
  );
}
