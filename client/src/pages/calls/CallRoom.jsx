import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCalls } from '../../context/CallContext';
import CallLobby from '../../components/calls/CallLobby';
import CallHeader from '../../components/calls/CallHeader';
import ParticipantGrid from '../../components/calls/ParticipantGrid';
import CallControls from '../../components/calls/CallControls';
import ParticipantsPanel from '../../components/calls/ParticipantsPanel';
import CallChatPanel from '../../components/calls/CallChatPanel';
import CallDetailsPanel from '../../components/calls/CallDetailsPanel';
import LeaveCallDialog from '../../components/calls/LeaveCallDialog';
import EndCallDialog from '../../components/calls/EndCallDialog';
import Skeleton from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import { ArrowLeft, Clock, Users, Video, MessageSquare, PhoneOff } from 'lucide-react';

export default function CallRoom() {
  const { callId, projectId } = useParams();
  const navigate = useNavigate();
  const activeProjectId = projectId || 'proj_1';

  const {
    calls,
    callState,
    setCallState,
    activeCall,
    loading,
    isChatOpen,
    isParticipantsOpen,
    isDetailsOpen,
    enterLobby,
    leaveActiveCall
  } = useCalls();

  const [isLeaveDialogOpen, setIsLeaveDialogOpen] = useState(false);
  const [isEndDialogOpen, setIsEndDialogOpen] = useState(false);

  const targetCall = activeCall || calls.find((c) => c.id === callId) || calls[0];

  useEffect(() => {
    if (targetCall && callState === 'idle') {
      enterLobby(targetCall);
    }
  }, [targetCall, callState, enterLobby]);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', height: '60vh' }}>
        <Skeleton height="40px" width="200px" />
        <Skeleton height="100%" width="100%" />
      </div>
    );
  }

  if (!targetCall) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <button
          onClick={() => navigate(`/app/projects/${activeProjectId}/calls`)}
          className="clb-btn clb-btn-ghost"
          style={{ width: 'fit-content', gap: '0.4rem' }}
        >
          <ArrowLeft size={16} />
          Back to Calls
        </button>
        <EmptyState
          icon={Video}
          title="Call not found"
          description={`No project call found with ID "${callId}".`}
          actionLabel="View all calls"
          onAction={() => navigate(`/app/projects/${activeProjectId}/calls`)}
        />
      </div>
    );
  }

  // 1. ENDED CALL DETAIL VIEW
  if (targetCall.status === 'ended' || callState === 'ended') {
    const formatDuration = (totalSec) => {
      const mins = Math.floor((totalSec || 0) / 60);
      return `${mins} min`;
    };

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '800px' }}>
        <button
          onClick={() => navigate(`/app/projects/${activeProjectId}/calls`)}
          className="clb-btn clb-btn-ghost"
          style={{ width: 'fit-content', gap: '0.4rem' }}
        >
          <ArrowLeft size={16} />
          Back to Calls
        </button>

        <div
          className="clb-card"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
            backgroundColor: 'var(--bg-elevated)',
            padding: '1.75rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h1 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                  {targetCall.title}
                </h1>
                <span style={{ fontSize: '0.7rem', fontWeight: 600, fontFamily: 'var(--font-mono)', backgroundColor: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-muted)', padding: '0.1rem 0.45rem', borderRadius: 'var(--radius-sm)' }}>
                  ENDED
                </span>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0.25rem 0 0' }}>
                Call session completed.
              </p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
            <div>
              <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>DURATION</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.2rem' }}>
                {formatDuration(targetCall.durationSeconds || 1920)}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>PARTICIPANTS</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.2rem' }}>
                {(targetCall.participantIds || []).length} people
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>TIMESTAMPS</div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                {targetCall.startedAt} — {targetCall.endedAt || 'Finished'}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.85rem', marginTop: '0.5rem' }}>
            <button
              onClick={() => navigate(`/app/projects/${activeProjectId}/chat/${targetCall.conversationId || 'conv_dev'}`)}
              className="clb-btn clb-btn-primary"
              style={{ fontSize: '0.85rem', gap: '0.45rem' }}
            >
              <MessageSquare size={16} />
              <span>Open related chat thread</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. PRE-CALL LOBBY
  if (callState === 'lobby') {
    return <CallLobby call={targetCall} />;
  }

  // 3. CONNECTING STATE
  if (callState === 'connecting') {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '60vh',
          gap: '1rem'
        }}
      >
        <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
          Connecting to {targetCall.title}...
        </div>
        <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
          Establishing encrypted peer connection...
        </div>
      </div>
    );
  }

  // 4. ACTIVE CALL ROOM
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100vh - 170px)',
        minHeight: '520px',
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        boxShadow: '0 12px 36px rgba(0, 0, 0, 0.4)'
      }}
    >
      <CallHeader call={targetCall} />

      {/* Central Content Area (Grid + Drawers) */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative' }}>
        {/* Main Grid */}
        <div style={{ flex: 1, padding: '1rem', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <ParticipantGrid call={targetCall} />
        </div>

        {/* Side Drawers */}
        {isParticipantsOpen && <ParticipantsPanel call={targetCall} />}
        {isChatOpen && <CallChatPanel />}
        {isDetailsOpen && <CallDetailsPanel call={targetCall} />}
      </div>

      <CallControls
        onLeave={() => setIsLeaveDialogOpen(true)}
        onEndCall={() => setIsEndDialogOpen(true)}
      />

      {/* Confirmation Dialogs */}
      <LeaveCallDialog isOpen={isLeaveDialogOpen} onClose={() => setIsLeaveDialogOpen(false)} />
      <EndCallDialog isOpen={isEndDialogOpen} onClose={() => setIsEndDialogOpen(false)} />
    </div>
  );
}
