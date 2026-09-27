import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Video, Mic, Users, Clock, ArrowRight } from 'lucide-react';
import Avatar from '../ui/Avatar';
import { useMembers } from '../../context/MemberContext';

export default function CallCard({ call, onJoin, onEnterLobby }) {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const { members } = useMembers();
  const activeProjectId = projectId || 'proj_1';

  const isVideo = call.type === 'video';
  const isActive = call.status === 'active';
  const callParticipants = members.filter((m) => (call.participantIds || []).includes(m.id));

  return (
    <div
      className="clb-card clb-card-interactive"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.85rem',
        padding: '1.1rem',
        backgroundColor: 'var(--bg-elevated)',
        border: isActive ? '1px solid rgba(0, 229, 163, 0.3)' : '1px solid var(--border-default)',
        transition: 'all 0.15s ease'
      }}
    >
      {/* Top Title & Type Badge */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: isVideo ? 'rgba(0, 229, 163, 0.12)' : 'rgba(139, 124, 255, 0.12)',
              color: isVideo ? 'var(--accent-primary)' : 'var(--accent-purple)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {isVideo ? <Video size={18} /> : <Mic size={18} />}
          </div>
          <div>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
              {call.title}
            </h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.15rem' }}>
              <Clock size={11} /> {isActive ? `Started ${call.startedAt}` : call.startedAt}
            </span>
          </div>
        </div>

        {isActive ? (
          <span
            style={{
              fontSize: '0.7rem',
              fontWeight: 700,
              fontFamily: 'var(--font-mono)',
              backgroundColor: 'rgba(0, 229, 163, 0.15)',
              color: 'var(--accent-primary)',
              padding: '0.15rem 0.45rem',
              borderRadius: 'var(--radius-pill)',
              border: '1px solid rgba(0, 229, 163, 0.3)'
            }}
          >
            ACTIVE NOW
          </span>
        ) : (
          <span
            style={{
              fontSize: '0.7rem',
              fontWeight: 500,
              fontFamily: 'var(--font-mono)',
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
              color: 'var(--text-muted)',
              padding: '0.15rem 0.45rem',
              borderRadius: 'var(--radius-sm)'
            }}
          >
            ENDED
          </span>
        )}
      </div>

      {/* Participants Preview */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.4rem', borderTop: '1px solid var(--border-subtle)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginRght: '0.2rem' }}>
            {callParticipants.slice(0, 4).map((m, idx) => (
              <div key={m.id} style={{ marginLeft: idx > 0 ? '-8px' : 0 }}>
                <Avatar name={m.name} src={m.avatar} size={24} />
              </div>
            ))}
          </div>
          <span style={{ fontSize: '0.775rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            {callParticipants.length} {callParticipants.length === 1 ? 'participant' : 'participants'}
          </span>
        </div>

        {isActive ? (
          <button
            type="button"
            onClick={() => onEnterLobby(call)}
            className="clb-btn clb-btn-primary"
            style={{ fontSize: '0.775rem', padding: '0.3rem 0.75rem' }}
          >
            Join call
          </button>
        ) : (
          <button
            type="button"
            onClick={() => navigate(`/app/projects/${activeProjectId}/calls/${call.id}`)}
            className="clb-btn clb-btn-ghost"
            style={{ fontSize: '0.775rem', padding: '0.25rem 0.5rem', gap: '0.3rem' }}
          >
            <span>View details</span>
            <ArrowRight size={13} />
          </button>
        )}
      </div>
    </div>
  );
}
