import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { callService } from '../services/callService';
import { webrtcService } from '../services/webrtcService';
import { getSocket } from '../services/socket';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import IncomingCallModal from '../components/calls/IncomingCallModal';

const CallContext = createContext(null);

export function CallProvider({ projectId = 'proj_1', children }) {
  const [calls, setCalls] = useState([]);
  const [activeCallId, setActiveCallId] = useState(null);
  const [activeCall, setActiveCall] = useState(null);
  const [incomingCall, setIncomingCall] = useState(null);
  const [callState, setCallState] = useState('idle'); // 'idle' | 'outgoing' | 'incoming' | 'lobby' | 'connecting' | 'active' | 'ended'
  const [loading, setLoading] = useState(true);

  // Streams
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);

  // Local Media & Panel State Controls
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isParticipantsOpen, setIsParticipantsOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const [timerSeconds, setTimerSeconds] = useState(0);

  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);
  const remoteStreamRef = useRef(null);
  const activeCallRef = useRef(null);

  const { user, isAuthenticated } = useAuth();
  const { addToast } = useToast();

  const currentUserId = user ? (user._id ? user._id.toString() : user.id) : 'usr_1';

  // Keep activeCallRef in sync
  useEffect(() => {
    activeCallRef.current = activeCall;
  }, [activeCall]);

  // Load project calls history
  const loadCalls = useCallback(async () => {
    if (!projectId || !isAuthenticated) {
      setCalls([]);
      setLoading(false);
      return;
    }
    try {
      const data = await callService.getCalls(projectId);
      setCalls(data || []);
    } catch (err) {
      console.error('Failed to load call history:', err);
    } finally {
      setLoading(false);
    }
  }, [projectId, isAuthenticated]);

  useEffect(() => {
    loadCalls();
  }, [loadCalls]);

  // Call Timer
  useEffect(() => {
    let interval = null;
    if (callState === 'active') {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    } else if (callState !== 'active') {
      setTimerSeconds(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [callState]);

  // Cleanup helper
  const cleanCallSession = useCallback(() => {
    webrtcService.cleanup(peerConnectionRef.current, localStreamRef.current, remoteStreamRef.current);
    peerConnectionRef.current = null;
    localStreamRef.current = null;
    remoteStreamRef.current = null;
    setLocalStream(null);
    setRemoteStream(null);
    setIsMuted(false);
    setIsVideoOff(false);
    setIsScreenSharing(false);
  }, []);

  // Socket.IO Call & WebRTC signaling listeners
  useEffect(() => {
    if (!isAuthenticated) return;

    const socket = getSocket();
    if (!socket) return;

    // 1. Incoming Call Event
    const handleIncomingCall = (data) => {
      if (!data) return;
      const callData = data.call || data;
      setIncomingCall(callData);
      setCallState('incoming');
    };

    // 2. Call Accepted Event (Caller side)
    const handleCallAccepted = async (data) => {
      const callData = data.call || data;
      setActiveCall(callData);
      setCallState('connecting');

      try {
        // Create Peer Connection
        const pc = webrtcService.createPeerConnection({
          onTrack: (rStream) => {
            remoteStreamRef.current = rStream;
            setRemoteStream(rStream);
            setCallState('active');
          },
          onIceCandidate: (candidate) => {
            socket.emit('webrtc:ice-candidate', {
              callId: callData.id || callData._id,
              candidate,
            });
          },
          onConnectionStateChange: (state) => {
            if (state === 'connected') {
              setCallState('active');
            } else if (state === 'disconnected' || state === 'failed') {
              addToast({
                title: 'Connection warning',
                message: 'Peer connection interrupted. Attempting reconnect...',
                type: 'warning',
              });
            }
          },
        });

        peerConnectionRef.current = pc;

        // Attach local tracks
        if (localStreamRef.current) {
          webrtcService.addLocalTracks(pc, localStreamRef.current);
        }

        // Create and send SDP Offer
        const offer = await webrtcService.createOffer(pc);
        socket.emit('webrtc:offer', {
          callId: callData.id || callData._id,
          sdp: offer,
        });
      } catch (err) {
        console.error('Failed to create WebRTC offer:', err);
        addToast({
          title: 'Call Error',
          message: err.userFriendly || err.message || 'Failed to establish call media.',
          type: 'error',
        });
        cleanCallSession();
        setCallState('idle');
      }
    };

    // 3. Call Rejected Event
    const handleCallRejected = () => {
      addToast({
        title: 'Call Declined',
        message: 'The recipient declined your call request.',
        type: 'warning',
      });
      cleanCallSession();
      setCallState('idle');
      setActiveCall(null);
      setActiveCallId(null);
      loadCalls();
    };

    // 4. Call Cancelled Event (Receiver side)
    const handleCallCancelled = () => {
      setIncomingCall(null);
      if (callState === 'incoming') {
        setCallState('idle');
      }
      addToast({
        title: 'Call Cancelled',
        message: 'The caller cancelled the call.',
        type: 'info',
      });
      loadCalls();
    };

    // 5. Call Ended Event
    const handleCallEnded = (data) => {
      addToast({
        title: 'Call Ended',
        message: 'The call session has ended.',
        type: 'info',
      });
      cleanCallSession();
      setCallState('ended');
      if (data?.call) {
        setActiveCall(data.call);
      }
      loadCalls();
    };

    // 6. WebRTC Offer (Receiver side)
    const handleWebRTCOffer = async (data) => {
      const { callId, sdp } = data;
      try {
        let pc = peerConnectionRef.current;
        if (!pc) {
          pc = webrtcService.createPeerConnection({
            onTrack: (rStream) => {
              remoteStreamRef.current = rStream;
              setRemoteStream(rStream);
              setCallState('active');
            },
            onIceCandidate: (candidate) => {
              socket.emit('webrtc:ice-candidate', {
                callId,
                candidate,
              });
            },
            onConnectionStateChange: (state) => {
              if (state === 'connected') {
                setCallState('active');
              }
            },
          });
          peerConnectionRef.current = pc;
        }

        // Attach local tracks
        if (localStreamRef.current) {
          webrtcService.addLocalTracks(pc, localStreamRef.current);
        }

        // Create and send SDP Answer
        const answer = await webrtcService.createAnswer(pc, sdp);
        socket.emit('webrtc:answer', {
          callId,
          sdp: answer,
        });
      } catch (err) {
        console.error('Failed to handle WebRTC offer:', err);
      }
    };

    // 7. WebRTC Answer (Caller side)
    const handleWebRTCAnswer = async (data) => {
      const { sdp } = data;
      try {
        const pc = peerConnectionRef.current;
        if (pc) {
          await webrtcService.setRemoteAnswer(pc, sdp);
        }
      } catch (err) {
        console.error('Failed to set remote answer:', err);
      }
    };

    // 8. WebRTC ICE Candidate
    const handleIceCandidate = async (data) => {
      const { candidate } = data;
      try {
        const pc = peerConnectionRef.current;
        if (pc) {
          await webrtcService.addIceCandidate(pc, candidate);
        }
      } catch (err) {
        console.error('Failed to add ICE candidate:', err);
      }
    };

    socket.on('call:incoming', handleIncomingCall);
    socket.on('call:accepted', handleCallAccepted);
    socket.on('call:rejected', handleCallRejected);
    socket.on('call:cancelled', handleCallCancelled);
    socket.on('call:ended', handleCallEnded);
    socket.on('webrtc:offer', handleWebRTCOffer);
    socket.on('webrtc:answer', handleWebRTCAnswer);
    socket.on('webrtc:ice-candidate', handleIceCandidate);

    return () => {
      socket.off('call:incoming', handleIncomingCall);
      socket.off('call:accepted', handleCallAccepted);
      socket.off('call:rejected', handleCallRejected);
      socket.off('call:cancelled', handleCallCancelled);
      socket.off('call:ended', handleCallEnded);
      socket.off('webrtc:offer', handleWebRTCOffer);
      socket.off('webrtc:answer', handleWebRTCAnswer);
      socket.off('webrtc:ice-candidate', handleIceCandidate);
    };
  }, [isAuthenticated, addToast, cleanCallSession, loadCalls, callState]);

  // Page unload cleanup
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (activeCallRef.current) {
        const socket = getSocket();
        if (socket) {
          socket.emit('call:end', { callId: activeCallRef.current.id || activeCallRef.current._id });
        }
      }
      cleanCallSession();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      cleanCallSession();
    };
  }, [cleanCallSession]);

  const activeCallsList = useMemo(() => {
    return calls.filter((c) => c.status === 'active' || c.status === 'ONGOING' || c.status === 'RINGING');
  }, [calls]);

  const recentCallsList = useMemo(() => {
    return calls.filter((c) => c.status === 'ended' || c.status === 'COMPLETED' || c.status === 'DECLINED' || c.status === 'CANCELLED' || c.status === 'MISSED');
  }, [calls]);

  // Actions
  const enterLobby = useCallback((call) => {
    if (call) {
      setActiveCallId(call.id || call._id);
      setActiveCall(call);
      setIsVideoOff(call.type === 'voice' || call.type === 'AUDIO');
    }
    setCallState('lobby');
  }, []);

  /**
   * Start 1-to-1 Call
   */
  const startNewCall = useCallback(
    async ({ receiverId, type = 'video', title = '' }) => {
      try {
        const isVoice = (type || '').toLowerCase() === 'voice' || (type || '').toUpperCase() === 'AUDIO';
        const stream = await webrtcService.getLocalMedia({
          audio: true,
          video: !isVoice,
        });

        localStreamRef.current = stream;
        setLocalStream(stream);
        setIsVideoOff(isVoice);

        const newCall = await callService.startCall(projectId, {
          receiverId,
          type: isVoice ? 'AUDIO' : 'VIDEO',
          title,
        });

        setActiveCall(newCall);
        setActiveCallId(newCall.id || newCall._id);
        setCallState('outgoing');
        await loadCalls();

        addToast({
          title: 'Calling...',
          message: `Ringing ${newCall.receiver?.name || 'peer'}...`,
          type: 'info',
        });

        return newCall;
      } catch (err) {
        console.error('Failed to start call:', err);
        addToast({
          title: 'Call initiation error',
          message: err.userFriendly || err.message || 'Unable to access media or start call.',
          type: 'error',
        });
        cleanCallSession();
        throw err;
      }
    },
    [projectId, loadCalls, addToast, cleanCallSession]
  );

  /**
   * Accept incoming call
   */
  const acceptIncomingCall = useCallback(async () => {
    if (!incomingCall) return;

    try {
      const isVoice = (incomingCall.type || '').toLowerCase() === 'voice' || (incomingCall.type || '').toUpperCase() === 'AUDIO';
      const stream = await webrtcService.getLocalMedia({
        audio: true,
        video: !isVoice,
      });

      localStreamRef.current = stream;
      setLocalStream(stream);
      setIsVideoOff(isVoice);

      const targetCall = incomingCall;
      setIncomingCall(null);
      setActiveCall(targetCall);
      setActiveCallId(targetCall.id || targetCall._id);
      setCallState('connecting');

      const socket = getSocket();
      if (socket) {
        socket.emit('call:accept', { callId: targetCall.id || targetCall._id });
      }
    } catch (err) {
      console.error('Failed to accept incoming call:', err);
      addToast({
        title: 'Call accept error',
        message: err.userFriendly || err.message || 'Unable to access media to join call.',
        type: 'error',
      });
      cleanCallSession();
      setCallState('idle');
    }
  }, [incomingCall, addToast, cleanCallSession]);

  /**
   * Reject incoming call
   */
  const rejectIncomingCall = useCallback(() => {
    if (!incomingCall) return;
    const socket = getSocket();
    if (socket) {
      socket.emit('call:reject', { callId: incomingCall.id || incomingCall._id });
    }
    setIncomingCall(null);
    setCallState('idle');
  }, [incomingCall]);

  /**
   * Cancel outgoing call
   */
  const cancelCall = useCallback(() => {
    if (activeCallId) {
      const socket = getSocket();
      if (socket) {
        socket.emit('call:cancel', { callId: activeCallId });
      }
    }
    cleanCallSession();
    setCallState('idle');
    setActiveCall(null);
    setActiveCallId(null);
    loadCalls();
  }, [activeCallId, cleanCallSession, loadCalls]);

  /**
   * Join from lobby
   */
  const joinActiveCall = useCallback(
    async (callId) => {
      const targetId = callId || activeCallId;
      if (!targetId) return;

      try {
        setCallState('connecting');
        const targetCall = calls.find((c) => (c.id || c._id) === targetId) || activeCall;
        const isVoice = targetCall?.type === 'voice' || targetCall?.type === 'AUDIO';

        if (!localStreamRef.current) {
          const stream = await webrtcService.getLocalMedia({
            audio: true,
            video: !isVoice,
          });
          localStreamRef.current = stream;
          setLocalStream(stream);
        }

        const socket = getSocket();
        if (socket) {
          socket.emit('call:accept', { callId: targetId });
        }
      } catch (err) {
        console.error('Failed to join call from lobby:', err);
        addToast({
          title: 'Join Error',
          message: err.userFriendly || err.message || 'Failed to access camera/microphone.',
          type: 'error',
        });
        setCallState('lobby');
      }
    },
    [activeCallId, calls, activeCall, addToast]
  );

  /**
   * Leave call / End call
   */
  const leaveActiveCall = useCallback(async () => {
    if (activeCallId) {
      const socket = getSocket();
      if (socket) {
        socket.emit('call:end', { callId: activeCallId });
      }
    }
    cleanCallSession();
    setCallState('idle');
    setActiveCall(null);
    setActiveCallId(null);
    setIsChatOpen(false);
    setIsParticipantsOpen(false);
    setIsDetailsOpen(false);
    await loadCalls();
  }, [activeCallId, cleanCallSession, loadCalls]);

  const endCallForEveryone = useCallback(async () => {
    await leaveActiveCall();
  }, [leaveActiveCall]);

  const toggleMicrophone = () => {
    if (localStreamRef.current) {
      const nextState = !isMuted;
      webrtcService.toggleAudioTrack(localStreamRef.current, !nextState);
      setIsMuted(nextState);
    } else {
      setIsMuted((prev) => !prev);
    }
  };

  const toggleCamera = () => {
    if (localStreamRef.current) {
      const nextState = !isVideoOff;
      webrtcService.toggleVideoTrack(localStreamRef.current, !nextState);
      setIsVideoOff(nextState);
    } else {
      setIsVideoOff((prev) => !prev);
    }
  };

  const toggleScreenShare = () => setIsScreenSharing((prev) => !prev);
  const toggleChat = () => {
    setIsChatOpen((prev) => !prev);
    if (!isChatOpen) setIsParticipantsOpen(false);
  };
  const toggleParticipants = () => {
    setIsParticipantsOpen((prev) => !prev);
    if (!isParticipantsOpen) setIsChatOpen(false);
  };
  const toggleDetails = () => setIsDetailsOpen((prev) => !prev);

  const value = {
    projectId,
    calls,
    activeCallsList,
    recentCallsList,
    activeCallId,
    activeCall,
    incomingCall,
    callState,
    setCallState,
    localStream,
    remoteStream,
    loading,
    currentUserId,
    isMuted,
    isVideoOff,
    isScreenSharing,
    isChatOpen,
    isParticipantsOpen,
    isDetailsOpen,
    timerSeconds,
    enterLobby,
    startNewCall,
    acceptIncomingCall,
    rejectIncomingCall,
    cancelCall,
    joinActiveCall,
    leaveActiveCall,
    endCallForEveryone,
    toggleMicrophone,
    toggleCamera,
    toggleScreenShare,
    toggleChat,
    toggleParticipants,
    toggleDetails,
    reloadCalls: loadCalls,
  };

  return (
    <CallContext.Provider value={value}>
      {children}
      <IncomingCallModal />
    </CallContext.Provider>
  );
}

export function useCalls() {
  const context = useContext(CallContext);
  if (!context) {
    return {
      callState: 'idle',
      activeCall: null,
      incomingCall: null,
      isMuted: false,
      isVideoOff: false,
      isScreenSharing: false,
      isChatOpen: false,
      isParticipantsOpen: false,
      isDetailsOpen: false,
      timerSeconds: 0,
      calls: [],
      enterLobby: () => {},
      startNewCall: async () => {},
      acceptIncomingCall: () => {},
      rejectIncomingCall: () => {},
      cancelCall: () => {},
      joinActiveCall: async () => {},
      leaveActiveCall: () => {},
      endCallForEveryone: async () => {},
      toggleMicrophone: () => {},
      toggleCamera: () => {},
      toggleScreenShare: () => {},
      toggleChat: () => {},
      toggleParticipants: () => {},
      toggleDetails: () => {},
      reloadCalls: async () => {},
    };
  }
  return context;
}
