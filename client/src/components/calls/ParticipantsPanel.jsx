import React from 'react';
import Avatar from '../ui/Avatar';
import MemberRoleBadge from '../members/MemberRoleBadge';
import { useMembers } from '../../context/MemberContext';
import { useCalls } from '../../context/CallContext';
import { Mic, MicOff, VideoOff, Crown, X } from 'lucide-react';

export default function ParticipantsPanel({ call }) {
  const { members } = useMembers();
  const { currentUserId, isMuted, isVideoOff, toggleParticipants } = useCalls();

  if (!call) return null;

  const participantIds = call.participantIds || [];
  const callMembers = members.filter((m) => participantIds.includes(m.id));

  return (
    <div
      style={{
        width: '280px',
        backgroundColor: 'var(--bg-elevated)',
        borderLeft: '1px solid var(--border-default)',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflowY: 'auto'
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.85rem 1rem',
          borderBottom: '1px solid var(--border-subtle)'
        }}
      >
        <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
          Participants ({callMembers.length})
        </span>
        <button
          type="button"
          onClick={toggleParticipants}
          className="clb-btn clb-btn-ghost"
          style={{ padding: '0.2rem 0.4rem', color: 'var(--text-muted)' }}
        >
          <X size={15} />
        </button>
      </div>

      <div style={{ padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {callMembers.map((m) => {
          const isSelf = m.id === currentUserId;
          const isHost = m.id === call.hostId;
          const userMuted = isSelf ? isMuted : false;
          const userVideoOff = isSelf ? isVideoOff : (call.type === 'voice');

          return (
            <div
              key={m.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.55rem 0.65rem',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid var(--border-subtle)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}>
                <Avatar name={m.name} src={m.avatar} size={28} />
                <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {m.name}
                    </span>
                    {isSelf && (
                      <span style={{ fontSize: '0.65rem', color: 'var(--accent-primary)', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
                        (You)
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.1rem' }}>
                    {isHost && (
                      <span style={{ fontSize: '0.675rem', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '0.2rem', fontWeight: 600 }}>
                        <Crown size={10} /> Host
                      </span>
                    )}
                    <MemberRoleBadge role={m.role} />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                {userMuted ? (
                  <MicOff size={14} color="var(--danger)" title="Mic off" />
                ) : (
                  <Mic size={14} color="var(--accent-primary)" title="Mic on" />
                )}
                {userVideoOff && (
                  <VideoOff size={14} color="var(--text-muted)" title="Camera off" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
