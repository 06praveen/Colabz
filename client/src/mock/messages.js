export const mockMessages = [
  // #development Channel Messages
  {
    id: 'msg_101',
    conversationId: 'conv_dev',
    senderId: 'usr_1', // Praveen Tiwari
    content: 'Hey team, should we move authentication state into a global session provider before starting Phase 8?',
    createdAt: '10:30 AM',
    dateSeparator: 'Today',
    editedAt: null,
    replyTo: null,
    reactions: [{ emoji: '👍', count: 2, users: ['usr_2', 'usr_3'] }],
    attachments: []
  },
  {
    id: 'msg_102',
    conversationId: 'conv_dev',
    senderId: 'usr_2', // Rahul Sharma
    content: "Yes, that makes total sense! I implemented the session provider in task COL-2.",
    createdAt: '10:32 AM',
    dateSeparator: null,
    editedAt: null,
    replyTo: 'msg_101',
    reactions: [{ emoji: '🚀', count: 1, users: ['usr_1'] }],
    attachments: [
      {
        type: 'task',
        taskId: 'task_2',
        identifier: 'COL-2',
        title: 'Implement authentication flow and session provider',
        status: 'DONE',
        priority: 'Urgent'
      }
    ]
  },
  {
    id: 'msg_103',
    conversationId: 'conv_dev',
    senderId: 'usr_2', // Rahul Sharma (Grouped message)
    content: 'Check commit 9f4a8b1 in main branch for the full implementation details.',
    createdAt: '10:33 AM',
    dateSeparator: null,
    editedAt: null,
    replyTo: null,
    reactions: [],
    attachments: [
      {
        type: 'commit',
        commitHash: '9f4a8b1',
        message: 'fix(auth): update JWT token refreshing mechanism',
        author: 'Praveen Tiwari'
      }
    ]
  },
  {
    id: 'msg_104',
    conversationId: 'conv_dev',
    senderId: 'usr_3', // Amit Kumar
    content: 'Also, Rahul reported an issue with search state debounce: Issue #24. I am taking a look at it.',
    createdAt: '10:38 AM',
    dateSeparator: null,
    editedAt: null,
    replyTo: null,
    reactions: [{ emoji: '👀', count: 2, users: ['usr_1', 'usr_2'] }],
    attachments: [
      {
        type: 'issue',
        issueId: 'issue_1',
        number: 24,
        title: 'Repository search input drops last character on fast typing',
        status: 'Open',
        priority: 'High'
      }
    ]
  },
  {
    id: 'msg_105',
    conversationId: 'conv_dev',
    senderId: 'usr_1', // Praveen Tiwari
    content: "Authentication UI is ready. I've linked COL-24 to the task.",
    createdAt: '10:42 AM',
    dateSeparator: null,
    editedAt: null,
    replyTo: null,
    reactions: [{ emoji: '👍', count: 3, users: ['usr_2', 'usr_3', 'usr_4'] }],
    attachments: [
      {
        type: 'task',
        taskId: 'task_1',
        identifier: 'COL-1',
        title: 'Improve repository mobile layout and sidebar responsiveness',
        status: 'IN PROGRESS',
        priority: 'High'
      }
    ]
  },
  {
    id: 'msg_106',
    conversationId: 'conv_dev',
    senderId: 'usr_2', // Rahul Sharma
    content: "Nice. I'll connect it with the project flow and verify the responsiveness.",
    createdAt: '10:44 AM',
    dateSeparator: null,
    editedAt: null,
    replyTo: 'msg_105',
    reactions: [],
    attachments: []
  },

  // #general Channel Messages
  {
    id: 'msg_201',
    conversationId: 'conv_general',
    senderId: 'usr_1',
    content: 'Welcome to campus-connect team workspace! Please review your assigned tasks and update project statuses.',
    createdAt: 'Yesterday, 2:15 PM',
    dateSeparator: 'Yesterday',
    editedAt: null,
    replyTo: null,
    reactions: [{ emoji: '🚀', count: 4, users: ['usr_2', 'usr_3', 'usr_4', 'usr_5'] }],
    attachments: []
  },
  {
    id: 'msg_202',
    conversationId: 'conv_general',
    senderId: 'usr_4', // Neha Verma
    content: 'Excited to build together! Design system tokens are available in index.css.',
    createdAt: 'Yesterday, 2:20 PM',
    dateSeparator: null,
    editedAt: null,
    replyTo: null,
    reactions: [{ emoji: '❤️', count: 2, users: ['usr_1', 'usr_2'] }],
    attachments: [
      {
        type: 'file',
        name: 'index.css',
        size: '24 KB',
        path: 'client/src/index.css'
      }
    ]
  },

  // Direct Message Rahul <-> Praveen
  {
    id: 'msg_301',
    conversationId: 'conv_dm_rahul',
    senderId: 'usr_1',
    content: 'Hey @rahul.dev, how is the session provider integration coming along?',
    createdAt: '10:40 AM',
    dateSeparator: 'Today',
    editedAt: null,
    replyTo: null,
    reactions: [],
    attachments: []
  },
  {
    id: 'msg_302',
    conversationId: 'conv_dm_rahul',
    senderId: 'usr_2',
    content: "Nice. I'll connect it with the project flow.",
    createdAt: '10:44 AM',
    dateSeparator: null,
    editedAt: null,
    replyTo: 'msg_301',
    reactions: [{ emoji: '👍', count: 1, users: ['usr_1'] }],
    attachments: []
  }
];
