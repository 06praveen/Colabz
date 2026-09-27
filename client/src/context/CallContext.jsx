import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { mockCallService } from '../services/mockCallService';

const CallContext = createContext(null);

export function CallProvider({ projectId = 'proj_1', children }) {
  const [calls, setCalls] = useState([]);
  const [activeCallId, setActiveCallId] = useState(null);
  const [callState, setCallState] = useState('idle'); // 'idle' | 'lobby' | 'connecting' | 'active' | 'ended'
  const [loading, setLoading] = useState(true);

  // Local Media & Panel State Controls
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isParticipantsOpen, setIsParticipantsOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const [timerSeconds, setTimerSeconds] = useState(0);

  const currentUserId = 'usr_1'; // Praveen Tiwari

  const loadCalls = useCallback(async () => {
    try {
      const data = await mockCallService.getCalls(projectId);
      setCalls([...data]);
    } catch (err) {
      console.error('Failed to load calls:', err);
    }
  }, [projectId]);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await loadCalls();
      setLoading(false);
    };
    init();
  }, [projectId, loadCalls]);

  // Timer Effect for Active Call
  useEffect(() => {
    let interval = null;
    if (callState === 'active') {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      setTimerSeconds(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [callState]);

  const activeCall = useMemo(() => {
    return calls.find((c) => c.id === activeCallId) || null;
  }, [calls, activeCallId]);

  const activeCallsList = useMemo(() => {
    return calls.filter((c) => c.status === 'active');
  }, [calls]);

  const recentCallsList = useMemo(() => {
    return calls.filter((c) => c.status === 'ended');
  }, [calls]);

  // Actions
  const enterLobby = useCallback((call) => {
    if (call) {
      setActiveCallId(call.id);
      setIsVideoOff(call.type === 'voice');
    }
    setCallState('lobby');
  }, []);

  const startNewCall = useCallback(async ({ title, type = 'video', conversationId = 'conv_dev' }) => {
    const newCall = await mockCallService.createCall(projectId, { title, type, conversationId });
    await loadCalls();
    setActiveCallId(newCall.id);
    setIsVideoOff(type === 'voice');
    setCallState('lobby');
    return newCall;
  }, [projectId, loadCalls]);

  const joinActiveCall = useCallback(async (callId) => {
    const targetId = callId || activeCallId || 'call_dev_sync';
    setActiveCallId(targetId);
    setCallState('connecting');

    // Simulate clean, fast connecting transition
    setTimeout(async () => {
      await mockCallService.joinCall(targetId, currentUserId);
      await loadCalls();
      setCallState('active');
    }, 450);
  }, [activeCallId, loadCalls]);

  const leaveActiveCall = useCallback(async () => {
    if (activeCallId) {
      await mockCallService.leaveCall(activeCallId, currentUserId);
      await loadCalls();
    }
    setCallState('idle');
    setIsScreenSharing(false);
    setIsChatOpen(false);
    setIsParticipantsOpen(false);
    setIsDetailsOpen(false);
  }, [activeCallId, loadCalls]);

  const endCallForEveryone = useCallback(async () => {
    if (activeCallId) {
      await mockCallService.endCall(activeCallId);
      await loadCalls();
    }
    setCallState('ended');
    setIsScreenSharing(false);
  }, [activeCallId, loadCalls]);

  const toggleMicrophone = () => setIsMuted((prev) => !prev);
  const toggleCamera = () => setIsVideoOff((prev) => !prev);
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

  return (
    <CallContext.Provider
      value={{
        projectId,
        calls,
        activeCallsList,
        recentCallsList,
        activeCallId,
        activeCall,
        callState,
        setCallState,
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
        joinActiveCall,
        leaveActiveCall,
        endCallForEveryone,
        toggleMicrophone,
        toggleCamera,
        toggleScreenShare,
        toggleChat,
        toggleParticipants,
        toggleDetails,
        reloadCalls: loadCalls
      }}
    >
      {children}
    </CallContext.Provider>
  );
}

export function useCalls() {
  const context = useContext(CallContext);
  if (!context) {
    throw new Error('useCalls must be used within a CallProvider');
  }
  return context;
}
