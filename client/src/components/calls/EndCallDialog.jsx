import React from 'react';
import Modal from '../ui/Modal';
import { useCalls } from '../../context/CallContext';
import { useNavigate, useParams } from 'react-router-dom';
import { PhoneOff, AlertTriangle } from 'lucide-react';

export default function EndCallDialog({ isOpen, onClose }) {
  const { endCallForEveryone } = useCalls();
  const navigate = useNavigate();
  const { projectId } = useParams();
  const activeProjectId = projectId || 'proj_1';

  const handleConfirmEnd = async () => {
    await endCallForEveryone();
    onClose();
    navigate(`/app/projects/${activeProjectId}/calls`);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="End call for everyone">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.85rem',
            padding: '0.85rem',
            backgroundColor: 'rgba(255, 92, 112, 0.08)',
            border: '1px solid rgba(255, 92, 112, 0.25)',
            borderRadius: 'var(--radius-md)'
          }}
        >
          <AlertTriangle size={20} color="var(--danger)" style={{ flexShrink: 0, marginTop: '0.1rem' }} />
          <div style={{ fontSize: '0.875rem' }}>
            <div style={{ fontWeight: 600, color: 'var(--danger)', marginBottom: '0.25rem' }}>
              End this call for everyone?
            </div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
              This will disconnect all team members and move the call to ended call history.
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
          <button type="button" onClick={onClose} className="clb-btn clb-btn-ghost">
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirmEnd}
            className="clb-btn"
            style={{ backgroundColor: 'var(--danger, #ff5c70)', color: '#ffffff', border: 'none', fontWeight: 600 }}
          >
            <PhoneOff size={15} />
            End call
          </button>
        </div>
      </div>
    </Modal>
  );
}
