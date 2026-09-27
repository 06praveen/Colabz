export const mockConversations = [
  {
    id: 'conv_dev',
    projectId: 'proj_1',
    name: 'development',
    type: 'channel',
    description: 'Technical implementation, architecture, and code reviews.',
    unreadCount: 2,
    lastMessage: "Authentication UI is ready. I've linked COL-24 to the task.",
    lastTime: '10:44 AM',
    memberIds: ['usr_1', 'usr_2', 'usr_3', 'usr_4', 'usr_5']
  },
  {
    id: 'conv_general',
    projectId: 'proj_1',
    name: 'general',
    type: 'channel',
    description: 'General project announcements and campus-connect coordination.',
    unreadCount: 0,
    lastMessage: 'Welcome to the campus-connect team workspace!',
    lastTime: 'Yesterday',
    memberIds: ['usr_1', 'usr_2', 'usr_3', 'usr_4', 'usr_5']
  },
  {
    id: 'conv_design',
    projectId: 'proj_1',
    name: 'design',
    type: 'channel',
    description: 'UI tokens, Geist typography, and design system feedback.',
    unreadCount: 0,
    lastMessage: 'Dark mode color scale updated in index.css.',
    lastTime: '2 days ago',
    memberIds: ['usr_1', 'usr_2', 'usr_4']
  },
  {
    id: 'conv_random',
    projectId: 'proj_1',
    name: 'random',
    type: 'channel',
    description: 'Non-work banter, news, and developer recommendations.',
    unreadCount: 0,
    lastMessage: 'Check out the new React 19 documentation!',
    lastTime: '3 days ago',
    memberIds: ['usr_1', 'usr_2', 'usr_3', 'usr_4', 'usr_5']
  },
  {
    id: 'conv_dm_rahul',
    projectId: 'proj_1',
    name: 'Rahul Sharma',
    type: 'direct',
    recipientId: 'usr_2',
    unreadCount: 1,
    lastMessage: "Nice. I'll connect it with the project flow.",
    lastTime: '10:44 AM',
    memberIds: ['usr_1', 'usr_2']
  },
  {
    id: 'conv_dm_amit',
    projectId: 'proj_1',
    name: 'Amit Kumar',
    type: 'direct',
    recipientId: 'usr_3',
    unreadCount: 0,
    lastMessage: 'Branch dropdown keyboard focus bug fixed in Issue #12.',
    lastTime: '3 days ago',
    memberIds: ['usr_1', 'usr_3']
  },
  {
    id: 'conv_dm_neha',
    projectId: 'proj_1',
    name: 'Neha Verma',
    type: 'direct',
    recipientId: 'usr_4',
    unreadCount: 0,
    lastMessage: 'CSS padding fix for code viewer scrollbar looks great!',
    lastTime: '1 day ago',
    memberIds: ['usr_1', 'usr_4']
  }
];
