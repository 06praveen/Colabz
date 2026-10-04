import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, PhoneOff, Video, Mic, Sparkles } from 'lucide-react';
import Avatar from '../ui/Avatar';
import { useCalls } from '../../context/CallContext';

export default function IncomingCallModal() {
  const navigate = useNavigate();
  const { incomingCall, acceptIncomingCall, rejectIncomingCall } = useCalls();

  if (!incomingCall) return null;

  const caller = incomingCall.caller || { name: 'Team Member' };
  const isVideo = (incomingCall.type || 'video').toLowerCase() === 'video';

  const handleAccept = async () => {
    const callToAccept = incomingCall;
    await acceptIncomingCall();
    if (callToAccept) {
      const projId = callToAccept.projectId || (callToAccept.project?._id || callToAccept.project?.id || callToAccept.project);
      const cId = callToAccept.id || callToAccept._id;
      if (projId && cId) {
        navigate(`/app/projects/${projId}/calls/${cId}`);
      }
    }
  };

  return (
    <AnimatePresence>
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(5, 6, 8, 0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99999,
          padding: '1rem',
        }}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          style={{
            width: '100%',
            maxWidth: '380px',
            backgroundColor: 'var(--bg-elevated)',
            border: '1px solid rgba(0, 229, 163, 0.4)',
            borderRadius: 'var(--radius-xl)',
            padding: '2rem 1.5rem',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8), 0 0 30px rgba(0, 229, 163, 0.2)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            gap: '1.25rem',
          }}
        >
          {/* Top Tag */}
          <div
            style={{
              fontSize: '0.725rem',
              fontWeight: 700,
              fontFamily: 'var(--font-mono)',
              color: 'var(--accent-primary)',
              backgroundColor: 'rgba(0, 229, 163, 0.12)',
              border: '1px solid rgba(0, 229, 163, 0.25)',
              padding: '0.2rem 0.6rem',
              borderRadius: 'var(--radius-pill)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
            }}
          >
            <Sparkles size={12} />
            <span>INCOMING {isVideo ? 'VIDEO' : 'VOICE'} CALL</span>
          </div>

          {/* Caller Avatar with Pulsing Ring */}
          <div style={{ position: 'relative', marginTop: '0.5rem' }}>
            <div
              style={{
                position: 'absolute',
                inset: '-10px',
                borderRadius: '50%',
                border: '2px solid var(--accent-primary)',
                animation: 'clb-pulse-speak 1.5s infinite ease-in-out',
                opacity: 0.6,
              }}
            />
            <Avatar name={caller.name} src={caller.avatar} size={84} />
          </div>

          {/* Caller Info */}
          <div>
            <h3
              style={{
                fontSize: '1.25rem',
                fontWeight: 700,
                color: 'var(--text-primary)',
                margin: 0,
              }}
            >
              {caller.name}
            </h3>
            <p
              style={{
                fontSize: '0.85rem',
                color: 'var(--text-muted)',
                margin: '0.25rem 0 0',
              }}
            >
              is calling you in <strong>Colabz</strong>...
            </p>
          </div>

          {/* Action Buttons */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '1.5rem',
              width: '100%',
              marginTop: '0.5rem',
            }}
          >
            {/* Decline Button */}
            <button
              type="button"
              onClick={rejectIncomingCall}
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                backgroundColor: 'var(--danger, #ff5c70)',
                color: '#ffffff',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 4px 15px rgba(255, 92, 112, 0.4)',
                transition: 'transform 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.08)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
              title="Decline Call"
            >
              <PhoneOff size={22} />
            </button>

            {/* Accept Button */}
            <button
              type="button"
              onClick={handleAccept}
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                backgroundColor: 'var(--accent-primary, #00E5A3)',
                color: '#050608',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 4px 15px rgba(0, 229, 163, 0.5)',
                transition: 'transform 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.08)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
              title="Accept Call"
            >
              {isVideo ? <Video size={22} /> : <Phone size={22} />}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
