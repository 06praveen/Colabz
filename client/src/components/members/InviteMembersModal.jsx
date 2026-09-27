import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import { useMembers } from '../../context/MemberContext';
import { useToast } from '../../context/ToastContext';
import { UserPlus, Mail } from 'lucide-react';
import { ROLE_DESCRIPTIONS } from '../../mock/members';

export default function InviteMembersModal({ isOpen, onClose }) {
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [role, setRole] = useState('developer');
  const [errorMsg, setErrorMsg] = useState('');

  const { inviteMember, projectId } = useMembers();
  const { addToast } = useToast();

  useEffect(() => {
    if (isOpen) {
      setEmailOrUsername('');
      setRole('developer');
      setErrorMsg('');
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!emailOrUsername.trim()) {
      setErrorMsg('Please enter a username or email address.');
      return;
    }

    try {
      const invite = await inviteMember({ emailOrUsername, role });
      addToast({
        title: 'Invitation sent',
        message: `Invitation sent to ${invite.email} (${role.toUpperCase()}).`,
        type: 'success'
      });
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to send invitation.');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Invite members">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
          Invite teammates to join this workspace. Pending invitations will appear in the pending list.
        </p>

        {errorMsg && (
          <div
            style={{
              padding: '0.6rem 0.85rem',
              backgroundColor: 'rgba(255, 92, 112, 0.1)',
              border: '1px solid rgba(255, 92, 112, 0.3)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--danger)',
              fontSize: '0.8125rem'
            }}
          >
            {errorMsg}
          </div>
        )}

        <div className="clb-input-group">
          <label className="clb-label">Username or email address *</label>
          <div style={{ position: 'relative' }}>
            <Mail
              size={16}
              color="var(--text-muted)"
              style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }}
            />
            <input
              type="text"
              className="clb-input"
              placeholder="e.g. rahul@example.com or @rahul.dev"
              value={emailOrUsername}
              onChange={(e) => {
                setEmailOrUsername(e.target.value);
                if (e.target.value.trim()) setErrorMsg('');
              }}
              style={{ paddingLeft: '2.3rem' }}
              autoFocus
              required
            />
          </div>
          <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            You can enter a single email or username.
          </span>
        </div>

        <div className="clb-input-group">
          <label className="clb-label">Project Role</label>
          <select
            className="clb-input"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="developer">Developer — Can work on project resources</option>
            <option value="designer">Designer — Can contribute to project work</option>
            <option value="admin">Admin — Can manage project settings & members</option>
            <option value="viewer">Viewer — Can view project content</option>
          </select>
          <div
            style={{
              marginTop: '0.4rem',
              fontSize: '0.775rem',
              color: 'var(--text-muted)',
              backgroundColor: 'var(--bg-subtle, rgba(255,255,255,0.02))',
              padding: '0.45rem 0.65rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)'
            }}
          >
            <strong>{ROLE_DESCRIPTIONS[role]?.label}:</strong> {ROLE_DESCRIPTIONS[role]?.description}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
          <button type="button" onClick={onClose} className="clb-btn clb-btn-ghost">
            Cancel
          </button>
          <button type="submit" className="clb-btn clb-btn-primary">
            <UserPlus size={15} />
            Send invitation
          </button>
        </div>
      </form>
    </Modal>
  );
}
