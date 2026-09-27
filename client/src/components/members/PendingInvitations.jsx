import React from 'react';
import { Mail, Clock, X } from 'lucide-react';
import { useMembers } from '../../context/MemberContext';
import { useToast } from '../../context/ToastContext';
import MemberRoleBadge from './MemberRoleBadge';

export default function PendingInvitations() {
  const { pendingInvitations, cancelInvitation } = useMembers();
  const { addToast } = useToast();

  const handleCancel = async (invitation) => {
    try {
      await cancelInvitation(invitation.id);
      addToast({
        title: 'Invitation cancelled',
        message: `Invitation for ${invitation.email} was cancelled.`,
        type: 'info'
      });
    } catch (err) {
      addToast({
        title: 'Failed to cancel',
        message: err.message || 'Could not cancel invitation.',
        type: 'error'
      });
    }
  };

  if (!pendingInvitations || pendingInvitations.length === 0) {
    return (
      <div
        style={{
          padding: '1rem 1.25rem',
          backgroundColor: 'var(--bg-elevated)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          color: 'var(--text-muted)',
          fontSize: '0.8125rem'
        }}
      >
        No pending invitations.
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {pendingInvitations.map((inv) => (
        <div
          key={inv.id}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.75rem 1rem',
            backgroundColor: 'var(--bg-elevated)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-md)',
            gap: '1rem',
            flexWrap: 'wrap'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 255, 255, 0.04)',
                border: '1px dashed var(--border-default)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-muted)'
              }}
            >
              <Mail size={16} />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {inv.email}
                </span>
                <MemberRoleBadge role={inv.role} />
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.15rem' }}>
                <Clock size={11} /> Invited {inv.invitedAt}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => handleCancel(inv)}
            className="clb-btn clb-btn-ghost"
            style={{ fontSize: '0.775rem', padding: '0.3rem 0.65rem', color: 'var(--danger)' }}
          >
            <X size={14} />
            Cancel
          </button>
        </div>
      ))}
    </div>
  );
}
