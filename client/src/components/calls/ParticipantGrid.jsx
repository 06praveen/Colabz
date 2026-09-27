import React from 'react';
import ParticipantTile from './ParticipantTile';
import { useCalls } from '../../context/CallContext';
import { useMembers } from '../../context/MemberContext';
import { Monitor } from 'lucide-react';

export default function ParticipantGrid({ call }) {
  const {
    currentUserId,
    isMuted,
    isVideoOff,
    isScreenSharing,
    toggleScreenShare
  } = useCalls();

  const { members } = useMembers();

  if (!call) return null;

  const participantIds = call.participantIds || ['usr_1', 'usr_2'];
  const callMembers = members.filter((m) => participantIds.includes(m.id));

  const gridColumns = callMembers.length <= 1 ? '1fr' : callMembers.length <= 4 ? '1fr 1fr' : 'repeat(3, 1fr)';

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.85rem', width: '100%', height: '100%', minHeight: 0 }}>
      {/* Screen Sharing Active Banner */}
      {isScreenSharing && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.6rem 1rem',
            backgroundColor: 'rgba(139, 124, 255, 0.12)',
            border: '1px solid rgba(139, 124, 255, 0.3)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--text-primary)',
            fontSize: '0.85rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Monitor size={18} color="var(--accent-purple, #8b7cff)" />
            <span>
              <strong>Screen share active:</strong> You are sharing your screen with the team.
            </span>
          </div>

          <button
            type="button"
            onClick={toggleScreenShare}
            className="clb-btn clb-btn-ghost"
            style={{ fontSize: '0.775rem', padding: '0.25rem 0.6rem', color: 'var(--accent-purple)' }}
          >
            Stop sharing
          </button>
        </div>
      )}

      {/* Main Grid Container */}
      <div
        className="participant-grid-responsive"
        style={{
          flex: 1,
          display: 'grid',
          gridTemplateColumns: gridColumns,
          gap: '1rem',
          minHeight: 0,
          width: '100%'
        }}
      >
        {callMembers.map((member) => {
          const isSelf = member.id === currentUserId;
          const isSpeaking = member.id === call.speakingParticipantId;

          return (
            <ParticipantTile
              key={member.id}
              member={member}
              isSelf={isSelf}
              isMuted={isSelf ? isMuted : false}
              isVideoOff={isSelf ? isVideoOff : false}
              isSpeaking={isSpeaking}
              connectionQuality={call.connectionQuality || 'Good'}
            />
          );
        })}
      </div>
    </div>
  );
}
