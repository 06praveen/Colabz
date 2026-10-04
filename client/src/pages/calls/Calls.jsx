import React, { useState } from 'react';
import { useCalls } from '../../context/CallContext';
import CallCard from '../../components/calls/CallCard';
import StartCallModal from '../../components/calls/StartCallModal';
import Skeleton from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import { Video, Mic, Radio, History, Sparkles } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import MotionButton from '../../components/motion/MotionButton';
import ColabzOctopus from '../../components/motion/ColabzOctopus';

export default function Calls() {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const activeProjectId = projectId || 'proj_1';

  const {
    activeCallsList,
    recentCallsList,
    loading,
    enterLobby,
    startNewCall
  } = useCalls();

  const [isStartOpen, setIsStartOpen] = useState(false);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <Skeleton height="40px" width="220px" />
        <Skeleton height="140px" width="100%" />
        <Skeleton height="200px" width="100%" />
      </div>
    );
  }

  const handleEnterLobby = (call) => {
    enterLobby(call);
    navigate(`/app/projects/${activeProjectId}/calls/${call.id}`);
  };

  const handleQuickStartVideo = () => {
    setIsStartOpen(true);
  };

  const handleQuickStartVoice = () => {
    setIsStartOpen(true);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Banner Header with Connector Mascot */}
      <div
        style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-md)',
          padding: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1.5rem'
        }}
      >
        <div style={{ maxWidth: '560px' }}>
          <div
            style={{
              fontSize: '0.725rem',
              fontWeight: 700,
              fontFamily: 'var(--font-mono)',
              color: 'var(--accent-primary)',
              letterSpacing: '0.05em',
              marginBottom: '0.35rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}
          >
            <Sparkles size={13} />
            <span>CONNECT EVERYONE</span>
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.3px' }}>
            Calls & Real-Time Sync
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: '0.25rem 0 0' }}>
            Meet your team without leaving the project. Jump into video calls or voice huddles.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <ColabzOctopus mode="connector" width={160} height={120} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <MotionButton variant="primary" icon={Video} onClick={handleQuickStartVideo}>
              Start video call
            </MotionButton>
            <MotionButton variant="secondary" icon={Mic} onClick={handleQuickStartVoice}>
              Start voice call
            </MotionButton>
          </div>
        </div>
      </div>

      {/* ACTIVE CALLS SECTION */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Radio size={18} color="var(--accent-primary)" />
          <h2 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
            Active now ({activeCallsList.length})
          </h2>
        </div>

        {activeCallsList.length === 0 ? (
          <div
            style={{
              padding: '1.5rem',
              backgroundColor: 'var(--bg-elevated)',
              border: '1px dashed var(--border-default)',
              borderRadius: 'var(--radius-md)',
              textAlign: 'center',
              color: 'var(--text-muted)',
              fontSize: '0.85rem'
            }}
          >
            No active calls in this project right now. Start a call to meet with your teammates.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            {activeCallsList.map((call) => (
              <CallCard
                key={call.id}
                call={call}
                onEnterLobby={handleEnterLobby}
              />
            ))}
          </div>
        )}
      </div>

      {/* RECENT CALLS SECTION */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginTop: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <History size={18} color="var(--text-muted)" />
          <h2 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
            Recent calls
          </h2>
        </div>

        {recentCallsList.length === 0 ? (
          <div style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>No recent call history.</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            {recentCallsList.map((call) => (
              <CallCard
                key={call.id}
                call={call}
                onEnterLobby={handleEnterLobby}
              />
            ))}
          </div>
        )}
      </div>

      {/* START CALL MODAL */}
      <StartCallModal isOpen={isStartOpen} onClose={() => setIsStartOpen(false)} />
    </div>
  );
}
