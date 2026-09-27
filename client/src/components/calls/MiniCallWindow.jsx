import React from 'react';
import { useCalls } from '../../context/CallContext';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Video, Mic, MicOff, Maximize2, Users } from 'lucide-react';

export default function MiniCallWindow() {
  const location = useLocation();
  const navigate = useNavigate();
  const { projectId } = useParams();
  const { callState, activeCall, isMuted, setCallState } = useCalls();

  const activeProjectId = projectId || 'proj_1';
  const isInCallRoom = location.pathname.includes('/calls/');

  // Display only when call is active and user is navigating outside the call room
  if (callState !== 'active' || !activeCall || isInCallRoom) {
    return null;
  }

  const handleReturnToCall = () => {
    navigate(`/app/projects/${activeProjectId}/calls/${activeCall.id}`);
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '1.5rem',
        right: '1.5rem',
        zIndex: 9500,
        backgroundColor: 'var(--bg-elevated)',
        border: '1px solid var(--accent-primary)',
        borderRadius: 'var(--radius-lg)',
        padding: '0.75rem 1rem',
        boxShadow: '0 12px 32px rgba(0, 0, 0, 0.6), 0 0 12px rgba(0, 229, 163, 0.2)',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        maxWidth: '340px'
      }}
    >
      <div
        style={{
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          backgroundColor: 'rgba(0, 229, 163, 0.15)',
          color: 'var(--accent-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}
      >
        <Video size={16} />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {activeCall.title}
        </div>
        <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.1rem' }}>
          <Users size={11} /> {(activeCall.participantIds || []).length} participants • {isMuted ? 'Muted' : 'Mic On'}
        </div>
      </div>

      <button
        type="button"
        onClick={handleReturnToCall}
        className="clb-btn clb-btn-primary"
        style={{ fontSize: '0.75rem', padding: '0.3rem 0.65rem', gap: '0.35rem', whiteSpace: 'nowrap' }}
      >
        <Maximize2 size={13} />
        <span>Return</span>
      </button>
    </div>
  );
}
