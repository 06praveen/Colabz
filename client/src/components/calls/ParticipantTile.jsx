import React from 'react';
import Avatar from '../ui/Avatar';
import { Mic, MicOff, VideoOff, Volume2 } from 'lucide-react';
import ConnectionIndicator from './ConnectionIndicator';

export default function ParticipantTile({
  member,
  isSelf = false,
  isMuted = false,
  isVideoOff = false,
  isSpeaking = false,
  connectionQuality = 'Good'
}) {
  if (!member) return null;

  // Identity-based subtle gradient background
  const getGradientForName = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const h1 = Math.abs(hash) % 360;
    const h2 = (h1 + 40) % 360;
    return `linear-gradient(135deg, HSL(${h1}, 25%, 12%) 0%, HSL(${h2}, 30%, 8%) 100%)`;
  };

  const bgGradient = getGradientForName(member.name);

  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: bgGradient,
        border: isSpeaking
          ? '2px solid var(--accent-primary)'
          : '1px solid var(--border-default)',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        minHeight: '200px',
        height: '100%',
        width: '100%',
        transition: 'all 0.2s ease',
        boxShadow: isSpeaking ? '0 0 20px rgba(0, 229, 163, 0.2)' : '0 4px 12px rgba(0,0,0,0.3)'
      }}
    >
      {/* Video Placeholder / Avatar Area */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.85rem' }}>
        <div style={{ position: 'relative' }}>
          <Avatar name={member.name} src={member.avatar} size={72} />
          {isSpeaking && (
            <div
              style={{
                position: 'absolute',
                inset: '-4px',
                borderRadius: '50%',
                border: '2px solid var(--accent-primary)',
                animation: 'clb-pulse-speak 1.5s infinite ease-in-out'
              }}
            />
          )}
        </div>

        {/* Video Off Overlay Notice */}
        {isVideoOff && (
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <VideoOff size={12} /> Camera off
          </span>
        )}
      </div>

      {/* Top Left Speaker Badge */}
      {isSpeaking && (
        <div
          style={{
            position: 'absolute',
            top: '0.75rem',
            left: '0.75rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            fontSize: '0.725rem',
            fontWeight: 600,
            fontFamily: 'var(--font-mono)',
            backgroundColor: 'rgba(0, 229, 163, 0.15)',
            color: 'var(--accent-primary)',
            padding: '0.15rem 0.5rem',
            borderRadius: 'var(--radius-pill)',
            border: '1px solid rgba(0, 229, 163, 0.3)'
          }}
        >
          <Volume2 size={12} />
          <span>Speaking</span>
        </div>
      )}

      {/* Bottom Name & Mute State Overlay Bar */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '0.5rem 0.75rem',
          backgroundColor: 'rgba(7, 8, 10, 0.75)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderTop: '1px solid var(--border-subtle)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            {member.name}
          </span>
          {isSelf && (
            <span
              style={{
                fontSize: '0.65rem',
                fontWeight: 600,
                fontFamily: 'var(--font-mono)',
                backgroundColor: 'rgba(0, 229, 163, 0.15)',
                color: 'var(--accent-primary)',
                padding: '0.05rem 0.35rem',
                borderRadius: 'var(--radius-sm)'
              }}
            >
              You
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {isMuted ? (
            <div
              style={{
                width: '22px',
                height: '22px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 92, 112, 0.2)',
                color: 'var(--danger)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title="Microphone Muted"
            >
              <MicOff size={12} />
            </div>
          ) : (
            <div
              style={{
                width: '22px',
                height: '22px',
                borderRadius: '50%',
                backgroundColor: 'rgba(0, 229, 163, 0.15)',
                color: 'var(--accent-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title="Microphone Active"
            >
              <Mic size={12} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
