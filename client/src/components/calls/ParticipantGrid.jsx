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
    remoteStreams = {},
    remoteStream,
  } = useCalls();

  const { members } = useMembers();
  const { user } = useAuth();

  if (!call) return null;

  // Identify self member
  const myId = (user ? (user._id ? user._id.toString() : user.id) : currentUserId) || 'self';

  const selfMember = {
    id: myId,
    _id: myId,
    name: user?.name || 'You',
    avatar: user?.avatar || null,
  };

  // Resolve all remote participant IDs for this call
  const remotePeerIds = new Set();

  // Add keys from active remoteStreams
  Object.keys(remoteStreams).forEach((id) => {
    if (id && id !== myId) remotePeerIds.add(id);
  });

  // Add from call accepted / participants list if group
  if (Array.isArray(call.acceptedParticipants)) {
    call.acceptedParticipants.forEach((p) => {
      const pid = p?._id ? p._id.toString() : p?.id || (typeof p === 'string' ? p : null);
      if (pid && pid !== myId) remotePeerIds.add(pid);
    });
  }

  // 1-on-1 fallback
  if (remotePeerIds.size === 0) {
    const callerId = call.callerId || (call.caller?._id ? call.caller._id.toString() : call.caller?.id);
    const receiverId = call.receiverId || (call.receiver?._id ? call.receiver._id.toString() : call.receiver?.id);
    const peerId = callerId === myId ? receiverId : callerId;
    if (peerId && peerId !== myId) {
      remotePeerIds.add(peerId);
    }
  }

  const remotePeersList = Array.from(remotePeerIds).map((peerId) => {
    const memberObj =
      members.find((m) => (m.userId || m.id || m._id) === peerId) ||
      (call.caller && (call.caller._id === peerId || call.caller.id === peerId) ? call.caller : null) ||
      (call.receiver && (call.receiver._id === peerId || call.receiver.id === peerId) ? call.receiver : null) ||
      {
        id: peerId,
        _id: peerId,
        name: `Teammate`,
        avatar: null,
      };

    const stream = remoteStreams[peerId] || (remotePeersListCount === 1 ? remoteStream : null);
    return {
      id: peerId,
      member: memberObj,
      stream,
    };
  });

  const remotePeersListCount = remotePeersList.length;
  const totalTiles = remotePeersListCount + 1; // + 1 for self

  // Dynamic grid template columns
  let gridTemplateCols = '1fr';
  if (totalTiles === 2) {
    gridTemplateCols = 'repeat(auto-fit, minmax(280px, 1fr))';
  } else if (totalTiles >= 3) {
    gridTemplateCols = 'repeat(auto-fit, minmax(260px, 1fr))';
  }

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

      {/* Main Grid Container (Responsive Multi-Tile Grid) */}
      <div
        className="participant-grid-responsive"
        style={{
          flex: 1,
          display: 'grid',
          gridTemplateColumns: gridTemplateCols,
          gap: '1rem',
          minHeight: 0,
          width: '100%',
          overflowY: 'auto',
          alignContent: 'center',
        }}
      >
        {/* Remote Peer Tiles */}
        {remotePeersList.map(({ id, member, stream }) => (
          <ParticipantTile
            key={`peer-tile-${id}`}
            member={member}
            stream={stream || (remotePeersListCount === 1 ? remoteStream : null)}
            isSelf={false}
            isMuted={false}
            isVideoOff={false}
            isSpeaking={false}
            connectionQuality={call.connectionQuality || 'Good'}
          />
        ))}

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
