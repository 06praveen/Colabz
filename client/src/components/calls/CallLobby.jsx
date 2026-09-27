import React from 'react';
import Avatar from '../ui/Avatar';
import { useCalls } from '../../context/CallContext';
import { useMembers } from '../../context/MemberContext';
import { Mic, MicOff, Video, VideoOff, Video as VideoIcon, ArrowLeft } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

export default function CallLobby({ call }) {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const activeProjectId = projectId || 'proj_1';

  const {
    isMuted,
    isVideoOff,
    toggleMicrophone,
    toggleCamera,
    joinActiveCall,
    currentUserId
  } = useCalls();

  const { members } = useMembers();

  const currentMember = members.find((m) => m.id === currentUserId) || {
    name: 'Praveen Tiwari',
    initials: 'PR'
  };

  const isVideo = call ? call.type === 'video' : true;
  const title = call ? call.title : 'Development Sync';

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1rem',
        maxWidth: '680px',
        margin: '0 auto',
        width: '100%'
      }}
    >
      <button
        type="button"
        onClick={() => navigate(`/app/projects/${activeProjectId}/calls`)}
        className="clb-btn clb-btn-ghost"
        style={{ alignSelf: 'flex-start', marginBottom: '1.5rem', gap: '0.4rem', fontSize: '0.85rem' }}
      >
        <ArrowLeft size={16} />
        Back to Calls
      </button>

      <div
        className="clb-card"
        style={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1.5rem',
          backgroundColor: 'var(--bg-elevated)',
          padding: '2rem'
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
            Ready to join?
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: '0.35rem 0 0' }}>
            Joining <strong>{title}</strong> ({isVideo ? 'Video Call' : 'Voice Call'})
          </p>
        </div>

        {/* Mock Camera Preview Box */}
        <div
          style={{
            width: '100%',
            maxWidth: '440px',
            height: '240px',
            borderRadius: 'var(--radius-lg)',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-default)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            boxShadow: '0 8px 24px rgba(0,0,0,0.4)'
          }}
        >
          <Avatar name={currentMember.name} src={currentMember.avatar} size={72} />

          <div style={{ marginTop: '0.85rem', textAlign: 'center' }}>
            <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              {currentMember.name}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
              {isVideoOff ? 'Camera is off' : 'Mock camera preview ready'}
            </div>
          </div>

          {/* Quick Toggle Overlays */}
          <div style={{ position: 'absolute', bottom: '0.85rem', display: 'flex', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={toggleMicrophone}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                border: 'none',
                backgroundColor: isMuted ? 'rgba(255, 92, 112, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                color: isMuted ? 'var(--danger)' : 'var(--text-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
              title={isMuted ? 'Unmute Mic' : 'Mute Mic'}
            >
              {isMuted ? <MicOff size={16} /> : <Mic size={16} />}
            </button>

            <button
              type="button"
              onClick={toggleCamera}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                border: 'none',
                backgroundColor: isVideoOff ? 'rgba(255, 92, 112, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                color: isVideoOff ? 'var(--danger)' : 'var(--text-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
              title={isVideoOff ? 'Turn Camera On' : 'Turn Camera Off'}
            >
              {isVideoOff ? <VideoOff size={16} /> : <Video size={16} />}
            </button>
          </div>
        </div>

        {/* Join Primary Button */}
        <button
          type="button"
          onClick={() => joinActiveCall(call?.id)}
          className="clb-btn clb-btn-primary"
          style={{ padding: '0.65rem 2rem', fontSize: '0.95rem', fontWeight: 600, gap: '0.5rem' }}
        >
          <VideoIcon size={18} />
          <span>Join call now</span>
        </button>
      </div>
    </div>
  );
}
