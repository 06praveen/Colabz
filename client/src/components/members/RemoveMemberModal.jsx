import React, { useState } from 'react';
import Modal from '../ui/Modal';
import { useMembers } from '../../context/MemberContext';
import { useToast } from '../../context/ToastContext';
import { AlertTriangle, UserMinus } from 'lucide-react';

export default function RemoveMemberModal({ isOpen, onClose, member }) {
  const [errorMsg, setErrorMsg] = useState('');
  const { removeMember } = useMembers();
  const { addToast } = useToast();

  if (!member) return null;

  const handleConfirm = async () => {
    try {
      await removeMember(member.id);
      addToast({
        title: 'Member removed',
        message: `${member.name} has been removed from this project.`,
        type: 'info'
      });
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to remove member.');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Remove member">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.85rem',
            padding: '0.85rem',
            backgroundColor: 'rgba(255, 92, 112, 0.08)',
            border: '1px solid rgba(255, 92, 112, 0.25)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--text-primary)'
          }}
        >
          <AlertTriangle size={20} color="var(--danger)" style={{ flexShrink: 0, marginTop: '0.1rem' }} />
          <div style={{ fontSize: '0.875rem' }}>
            <div style={{ fontWeight: 600, color: 'var(--danger)', marginBottom: '0.25rem' }}>
              Remove {member.name} from this project?
            </div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
              {member.name} (@{member.username}) will no longer appear as a project member and will lose access to team workspace resources.
            </div>
          </div>
        </div>

        {errorMsg && (
          <div
            style={{
              padding: '0.55rem 0.85rem',
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

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
          <button type="button" onClick={onClose} className="clb-btn clb-btn-ghost">
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="clb-btn"
            style={{
              backgroundColor: 'var(--danger, #ff5c70)',
              color: '#ffffff',
              border: 'none',
              fontWeight: 600
            }}
          >
            <UserMinus size={15} />
            Remove member
          </button>
        </div>
      </div>
    </Modal>
  );
}
