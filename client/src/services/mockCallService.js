import { mockCalls } from '../mock/calls';

let callsStore = [...mockCalls];

export const mockCallService = {
  async getCalls(projectId) {
    if (!projectId) return callsStore;
    return callsStore.filter((c) => c.projectId === projectId || !c.projectId);
  },

  async getCall(callId) {
    return callsStore.find((c) => c.id === callId) || null;
  },

  async createCall(projectId, { title, type = 'video', conversationId = 'conv_dev' }) {
    const trimmedTitle = (title || '').trim() || 'Team Sync';
    const newCall = {
      id: `call_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      projectId: projectId || 'proj_1',
      title: trimmedTitle,
      type: type || 'video',
      status: 'active',
      hostId: 'usr_1', // Praveen Tiwari
      startedAt: 'Just now',
      durationSeconds: 0,
      conversationId: conversationId || 'conv_dev',
      participantIds: ['usr_1', 'usr_2', 'usr_3'],
      speakingParticipantId: 'usr_2',
      connectionQuality: 'Good'
    };

    callsStore.unshift(newCall);
    return newCall;
  },

  async joinCall(callId, userId = 'usr_1') {
    const index = callsStore.findIndex((c) => c.id === callId);
    if (index === -1) throw new Error('Call not found');

    const call = callsStore[index];
    if (!call.participantIds.includes(userId)) {
      const updated = {
        ...call,
        participantIds: [...call.participantIds, userId]
      };
      callsStore[index] = updated;
      return updated;
    }
    return call;
  },

  async leaveCall(callId, userId = 'usr_1') {
    const index = callsStore.findIndex((c) => c.id === callId);
    if (index === -1) return true;

    const call = callsStore[index];
    const updatedParticipants = call.participantIds.filter((id) => id !== userId);

    if (updatedParticipants.length === 0) {
      callsStore[index] = {
        ...call,
        status: 'ended',
        endedAt: 'Just now',
        participantIds: []
      };
    } else {
      callsStore[index] = {
        ...call,
        participantIds: updatedParticipants
      };
    }

    return true;
  },

  async endCall(callId) {
    const index = callsStore.findIndex((c) => c.id === callId);
    if (index === -1) return true;

    callsStore[index] = {
      ...callsStore[index],
      status: 'ended',
      endedAt: 'Just now'
    };
    return true;
  }
};
