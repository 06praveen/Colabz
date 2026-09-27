export const mockCalls = [
  {
    id: 'call_dev_sync',
    projectId: 'proj_1',
    title: 'Development Sync',
    type: 'video', // 'video' | 'voice'
    status: 'active', // 'active' | 'ended' | 'scheduled'
    hostId: 'usr_1', // Praveen Tiwari
    startedAt: '10:15 AM',
    durationSeconds: 1122, // 18 mins 42 secs
    conversationId: 'conv_dev',
    participantIds: ['usr_1', 'usr_2', 'usr_3', 'usr_4'],
    speakingParticipantId: 'usr_2', // Rahul Sharma
    connectionQuality: 'Good'
  },
  {
    id: 'call_design_review',
    projectId: 'proj_1',
    title: 'Design System Review',
    type: 'video',
    status: 'ended',
    hostId: 'usr_4', // Neha Verma
    startedAt: 'Yesterday, 3:00 PM',
    endedAt: 'Yesterday, 3:48 PM',
    durationSeconds: 2880, // 48 mins
    conversationId: 'conv_design',
    participantIds: ['usr_1', 'usr_2', 'usr_4'],
    connectionQuality: 'Excellent'
  },
  {
    id: 'call_sprint_planning',
    projectId: 'proj_1',
    title: 'Sprint Planning & Backlog',
    type: 'voice',
    status: 'ended',
    hostId: 'usr_1',
    startedAt: 'Sep 24, 11:00 AM',
    endedAt: 'Sep 24, 11:41 AM',
    durationSeconds: 2460, // 41 mins
    conversationId: 'conv_general',
    participantIds: ['usr_1', 'usr_2', 'usr_3', 'usr_4', 'usr_5'],
    connectionQuality: 'Good'
  }
];
