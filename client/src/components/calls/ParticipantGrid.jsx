import React from 'react';
import ParticipantTile from './ParticipantTile';
import { useCalls } from '../../context/CallContext';
import { useMembers } from '../../context/MemberContext';
import { useAuth } from '../../context/AuthContext';
import { Monitor } from 'lucide-react';

export default function ParticipantGrid({ call }) {
  const {
    currentUserId,
    isMuted,
    isVideoOff,
    isScreenSharing,
    toggleScreenShare,
    localStream,
    remoteStream,
  } = useCalls();

  const { members } = useMembers();
  const { user } = useAuth();

  if (!call) return null;

  // Identify self member and peer member
  const myId = user ? (user._id ? user._id.toString() : user.id) : currentUserId;

  const selfMember = {
    id: myId,
    _id: myId,
    name: user?.name || 'You',
    avatar: user?.avatar || null,
  };

  const callerId = call.callerId || (call.caller?._id ? call.caller._id.toString() : call.caller?.id);
  const receiverId = call.receiverId || (call.receiver?._id ? call.receiver._id.toString() : call.receiver?.id);

  const peerId = callerId === myId ? receiverId : callerId;
  const peerObj = callerId === myId ? call.receiver : call.caller;

  const peerMember =
    members.find((m) => (m.userId || m.id || m._id) === peerId) ||
    peerObj || {
      id: peerId,
      _id: peerId,
      name: peerObj?.name || 'Peer',
      avatar: peerObj?.avatar || null,
    };

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
            fontSize: '0.85rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Monitor size={18} color="var(--accent-purple, #8b7cff)" />
            <span>
              <strong>Screen share active:</strong> You are sharing your screen.
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

      {/* Main Grid Container (1-to-1 Split View) */}
      <div
        className="participant-grid-responsive"
        style={{
          flex: 1,
          display: 'grid',
          gridTemplateColumns: remoteStream ? '1fr 1fr' : '1fr',
          gap: '1rem',
          minHeight: 0,
          width: '100%',
        }}
      >
        {/* Remote Peer Tile */}
        {peerMember && (
          <ParticipantTile
            key="peer-tile"
            member={peerMember}
            stream={remoteStream}
            isSelf={false}
            isMuted={false}
            isVideoOff={false}
            isSpeaking={false}
            connectionQuality={call.connectionQuality || 'Good'}
          />
        )}

        {/* Self Local Tile */}
        <ParticipantTile
          key="self-tile"
          member={selfMember}
          stream={localStream}
          isSelf={true}
          isMuted={isMuted}
          isVideoOff={isVideoOff}
          isSpeaking={false}
          connectionQuality="Excellent"
        />
      </div>
    </div>
  );
}
