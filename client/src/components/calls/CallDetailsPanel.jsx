import React from 'react';
import { useCalls } from '../../context/CallContext';
import ConnectionIndicator from './ConnectionIndicator';
import { Info, X, Clock, Video, Mic, Globe, FolderGit2 } from 'lucide-react';

export default function CallDetailsPanel({ call }) {
  const { isDetailsOpen, toggleDetails, timerSeconds } = useCalls();

  if (!isDetailsOpen || !call) return null;

  const isVideo = call.type === 'video';

  const formatTimer = (totalSec) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div
      style={{
        width: '280px',
        backgroundColor: 'var(--bg-elevated)',
        borderLeft: '1px solid var(--border-default)',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflowY: 'auto',
        fontSize: '0.8125rem'
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
        <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Info size={15} color="var(--accent-primary)" />
          Call Details
        </span>
        <button
          type="button"
          onClick={toggleDetails}
          className="clb-btn clb-btn-ghost"
          style={{ padding: '0.2rem 0.4rem', color: 'var(--text-muted)' }}
        >
          <X size={15} />
        </button>
      </div>

      <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>
            TITLE
          </div>
          <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '0.2rem' }}>
            {call.title}
          </div>
        </div>

        <div>
          <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>
            CALL TYPE
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.2rem', color: isVideo ? 'var(--accent-primary)' : 'var(--accent-purple)' }}>
            {isVideo ? <Video size={14} /> : <Mic size={14} />}
            <span style={{ fontWeight: 600 }}>{isVideo ? 'Video Call' : 'Voice Call'}</span>
          </div>
        </div>

        <div>
          <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>
            DURATION
          </div>
          <div style={{ fontSize: '0.875rem', fontWeight: 600, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', marginTop: '0.2rem' }}>
            {formatTimer(timerSeconds || call.durationSeconds || 0)}
          </div>
        </div>

        <div>
          <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>
            STARTED
          </div>
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            {call.startedAt}
          </div>
        </div>

        <div>
          <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>
            CONNECTION QUALITY
          </div>
          <div style={{ marginTop: '0.25rem' }}>
            <ConnectionIndicator quality={call.connectionQuality || 'Good'} />
          </div>
        </div>

        <div style={{ paddingTop: '0.85rem', borderTop: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>
            PROJECT WORKSPACE
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.35rem', color: 'var(--text-primary)', fontWeight: 600 }}>
            <FolderGit2 size={15} color="var(--accent-primary)" />
            <span>campus-connect</span>
          </div>
        </div>
      </div>
    </div>
  );
}
