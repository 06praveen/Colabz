import React from 'react';
import Modal from '../ui/Modal';
import { useCalls } from '../../context/CallContext';
import { useNavigate, useParams } from 'react-router-dom';
import { PhoneOff } from 'lucide-react';

export default function LeaveCallDialog({ isOpen, onClose }) {
  const { leaveActiveCall } = useCalls();
  const navigate = useNavigate();
  const { projectId } = useParams();
  const activeProjectId = projectId || 'proj_1';

  const handleConfirmLeave = async () => {
    await leaveActiveCall();
    onClose();
    navigate(`/app/projects/${activeProjectId}/calls`);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Leave call">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0 }}>
          Are you sure you want to leave the current call? You can rejoin anytime while the call is active.
        </p>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
          <button type="button" onClick={onClose} className="clb-btn clb-btn-ghost">
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirmLeave}
            className="clb-btn"
            style={{ backgroundColor: 'var(--danger, #ff5c70)', color: '#ffffff', border: 'none', fontWeight: 600 }}
          >
            <PhoneOff size={15} />
            Leave call
          </button>
        </div>
      </div>
    </Modal>
  );
}
