import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import { useMembers } from '../../context/MemberContext';
import { useToast } from '../../context/ToastContext';
import { ShieldCheck } from 'lucide-react';
import { ROLE_DESCRIPTIONS } from '../../mock/members';

export default function ChangeRoleModal({ isOpen, onClose, member }) {
  const [role, setRole] = useState(member?.role || 'developer');
  const [errorMsg, setErrorMsg] = useState('');

  const { updateMemberRole } = useMembers();
  const { addToast } = useToast();

  useEffect(() => {
    if (member) {
      setRole(member.role);
    }
  }, [member]);

  if (!member) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateMemberRole(member.id, role);
      addToast({
        title: 'Role updated',
        message: `Updated ${member.name}'s role to ${ROLE_DESCRIPTIONS[role]?.label || role}.`,
        type: 'success'
      });
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update role.');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Change role for ${member.name}`}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
          Select a new project role for <strong>{member.name}</strong> (@{member.username}).
        </p>

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

        <div className="clb-input-group">
          <label className="clb-label">Role</label>
          <select className="clb-input" value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="owner">Owner — Full project control</option>
            <option value="admin">Admin — Manage project settings and members</option>
            <option value="developer">Developer — Work on project resources</option>
            <option value="designer">Designer — Contribute to project work</option>
            <option value="viewer">Viewer — View project content</option>
          </select>
        </div>

        {/* Role Explanation Card */}
        <div
          style={{
            backgroundColor: 'var(--bg-elevated)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-md)',
            padding: '0.85rem 1rem',
            fontSize: '0.8125rem'
          }}
        >
          <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
            {ROLE_DESCRIPTIONS[role]?.label}
          </div>
          <div style={{ color: 'var(--text-muted)' }}>
            {ROLE_DESCRIPTIONS[role]?.description}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
          <button type="button" onClick={onClose} className="clb-btn clb-btn-ghost">
            Cancel
          </button>
          <button type="submit" className="clb-btn clb-btn-primary">
            <ShieldCheck size={15} />
            Update role
          </button>
        </div>
      </form>
    </Modal>
  );
}
