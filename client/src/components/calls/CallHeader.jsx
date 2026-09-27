import React from 'react';
import { Video, Mic, Users, Info, ArrowLeft } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import CallTimer from './CallTimer';
import ConnectionIndicator from './ConnectionIndicator';
import { useCalls } from '../../context/CallContext';

export default function CallHeader({ call }) {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const activeProjectId = projectId || 'proj_1';
  const { timerSeconds, isDetailsOpen, toggleDetails } = useCalls();

  if (!call) return null;

  const isVideo = call.type === 'video';

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.85rem 1.25rem',
        backgroundColor: 'var(--bg-elevated)',
        borderBottom: '1px solid var(--border-default)',
        gap: '0.75rem',
        flexWrap: 'wrap'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <button
          type="button"
          onClick={() => navigate(`/app/projects/${activeProjectId}/calls`)}
          className="clb-btn clb-btn-ghost"
          style={{ padding: '0.35rem 0.5rem', fontSize: '0.8125rem' }}
          title="Back to Calls"
        >
          <ArrowLeft size={16} />
        </button>

        <div
          style={{
            width: '32px',
            height: '32px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: isVideo ? 'rgba(0, 229, 163, 0.12)' : 'rgba(139, 124, 255, 0.12)',
            color: isVideo ? 'var(--accent-primary)' : 'var(--accent-purple)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {isVideo ? <Video size={16} /> : <Mic size={16} />}
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0, fontFamily: 'var(--font-mono)' }}>
              {call.title}
            </h2>
            <CallTimer seconds={timerSeconds} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginTop: '0.15rem', fontSize: '0.775rem', color: 'var(--text-muted)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <Users size={12} /> {(call.participantIds || []).length} participants
            </span>
            <span>•</span>
            <ConnectionIndicator quality={call.connectionQuality || 'Good'} />
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <button
          type="button"
          onClick={toggleDetails}
          className="clb-btn clb-btn-ghost"
          style={{
            fontSize: '0.8125rem',
            padding: '0.35rem 0.65rem',
            gap: '0.4rem',
            color: isDetailsOpen ? 'var(--accent-primary)' : 'var(--text-muted)'
          }}
          title="Call Information & Details"
        >
          <Info size={16} />
          <span className="desktop-only-text">Info</span>
        </button>
      </div>
    </div>
  );
}
