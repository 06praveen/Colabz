import React from 'react';
import { Mic, MicOff, Video, VideoOff, Monitor, MessageSquare, Users, PhoneOff, AlertCircle } from 'lucide-react';
import { useCalls } from '../../context/CallContext';

export default function CallControls({
  onLeave,
  onEndCall
}) {
  const {
    isMuted,
    isVideoOff,
    isScreenSharing,
    isChatOpen,
    isParticipantsOpen,
    toggleMicrophone,
    toggleCamera,
    toggleScreenShare,
    toggleChat,
    toggleParticipants,
    currentUserId,
    activeCall
  } = useCalls();

  const isHost = activeCall && activeCall.hostId === currentUserId;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0.85rem 1.25rem',
        backgroundColor: 'var(--bg-elevated)',
        borderTop: '1px solid var(--border-default)',
        gap: '0.75rem',
        flexWrap: 'wrap'
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-pill)',
          padding: '0.35rem 0.75rem'
        }}
      >
        {/* Microphone Toggle */}
        <button
          type="button"
          onClick={toggleMicrophone}
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            border: 'none',
            backgroundColor: isMuted ? 'rgba(255, 92, 112, 0.2)' : 'rgba(255, 255, 255, 0.08)',
            color: isMuted ? 'var(--danger)' : 'var(--text-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
          title={isMuted ? 'Unmute Microphone' : 'Mute Microphone'}
        >
          {isMuted ? <MicOff size={18} /> : <Mic size={18} />}
        </button>

        {/* Camera Toggle */}
        <button
          type="button"
          onClick={toggleCamera}
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            border: 'none',
            backgroundColor: isVideoOff ? 'rgba(255, 92, 112, 0.2)' : 'rgba(255, 255, 255, 0.08)',
            color: isVideoOff ? 'var(--danger)' : 'var(--text-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
          title={isVideoOff ? 'Turn Camera On' : 'Turn Camera Off'}
        >
          {isVideoOff ? <VideoOff size={18} /> : <Video size={18} />}
        </button>

        {/* Screen Share Toggle */}
        <button
          type="button"
          onClick={toggleScreenShare}
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            border: 'none',
            backgroundColor: isScreenSharing ? 'rgba(139, 124, 255, 0.25)' : 'rgba(255, 255, 255, 0.08)',
            color: isScreenSharing ? 'var(--accent-purple)' : 'var(--text-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
          title={isScreenSharing ? 'Stop Screen Share' : 'Share Screen'}
        >
          <Monitor size={18} />
        </button>

        <div style={{ width: '1px', height: '24px', backgroundColor: 'var(--border-subtle)', margin: '0 0.25rem' }} />

        {/* Chat Drawer Toggle */}
        <button
          type="button"
          onClick={toggleChat}
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            border: 'none',
            backgroundColor: isChatOpen ? 'rgba(0, 229, 163, 0.2)' : 'rgba(255, 255, 255, 0.08)',
            color: isChatOpen ? 'var(--accent-primary)' : 'var(--text-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
          title="Toggle In-Call Chat"
        >
          <MessageSquare size={18} />
        </button>

        {/* Participants Drawer Toggle */}
        <button
          type="button"
          onClick={toggleParticipants}
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            border: 'none',
            backgroundColor: isParticipantsOpen ? 'rgba(0, 229, 163, 0.2)' : 'rgba(255, 255, 255, 0.08)',
            color: isParticipantsOpen ? 'var(--accent-primary)' : 'var(--text-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
          title="Toggle Participants Panel"
        >
          <Users size={18} />
        </button>
      </div>

      {/* Call Termination Buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <button
          type="button"
          onClick={onLeave}
          className="clb-btn"
          style={{
            backgroundColor: 'var(--danger, #ff5c70)',
            color: '#ffffff',
            border: 'none',
            fontWeight: 600,
            fontSize: '0.8125rem',
            padding: '0.45rem 0.85rem',
            borderRadius: 'var(--radius-pill)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem'
          }}
        >
          <PhoneOff size={15} />
          <span>Leave</span>
        </button>

        {isHost && (
          <button
            type="button"
            onClick={onEndCall}
            className="clb-btn clb-btn-ghost"
            style={{
              fontSize: '0.775rem',
              color: 'var(--danger)',
              padding: '0.4rem 0.65rem'
            }}
            title="End call for all participants"
          >
            End call
          </button>
        )}
      </div>
    </div>
  );
}
