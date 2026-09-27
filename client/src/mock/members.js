export const mockMembers = [
  {
    id: 'usr_1',
    name: 'Praveen Tiwari',
    username: 'praveen',
    email: 'praveen@colabz.dev',
    role: 'owner',
    avatar: null,
    initials: 'PR',
    status: 'active',
    joinedAt: 'September 2026',
    bio: 'Full-stack software developer & open source enthusiast. Lead maintainer of Colabz developer workspace.',
    projectIds: ['proj_1', 'proj_2', 'proj_3'],
    contributions: {
      commits: 24,
      tasksCompleted: 8,
      issuesResolved: 5
    },
    activities: [
      { id: 'act_101', action: 'Pushed changes to repository', time: '2 hours ago', detail: 'fix(auth): update JWT token refreshing mechanism' },
      { id: 'act_102', action: 'Completed task COL-24', time: 'Yesterday', detail: 'Repository mobile layout polish' },
      { id: 'act_103', action: 'Opened Issue #24', time: '2 days ago', detail: 'Search input state debounce bug' }
    ]
  },
  {
    id: 'usr_2',
    name: 'Rahul Sharma',
    username: 'rahul.dev',
    email: 'rahul@colabz.dev',
    role: 'developer',
    avatar: null,
    initials: 'RH',
    status: 'active',
    joinedAt: 'September 2026',
    bio: 'Frontend engineer focused on component architecture, design systems, and Web Platform APIs.',
    projectIds: ['proj_1', 'proj_3'],
    contributions: {
      commits: 14,
      tasksCompleted: 5,
      issuesResolved: 3
    },
    activities: [
      { id: 'act_104', action: 'Completed task COL-2', time: 'Yesterday', detail: 'Authentication session provider' },
      { id: 'act_105', action: 'Commented on Issue #24', time: '1 hour ago', detail: 'Verified patch fix for search input' }
    ]
  },
  {
    id: 'usr_3',
    name: 'Amit Kumar',
    username: 'amit_k',
    email: 'amit@colabz.dev',
    role: 'developer',
    avatar: null,
    initials: 'AM',
    status: 'away',
    joinedAt: 'August 2026',
    bio: 'Backend systems engineer specializing in data models and real-time event distribution.',
    projectIds: ['proj_1'],
    contributions: {
      commits: 18,
      tasksCompleted: 4,
      issuesResolved: 2
    },
    activities: [
      { id: 'act_106', action: 'Resolved Issue #12', time: '3 days ago', detail: 'Branch dropdown keyboard accessibility' },
      { id: 'act_107', action: 'Joined project campus-connect', time: '1 week ago', detail: 'Assigned DEVELOPER role' }
    ]
  },
  {
    id: 'usr_4',
    name: 'Neha Verma',
    username: 'neha_v',
    email: 'neha@colabz.dev',
    role: 'designer',
    avatar: null,
    initials: 'NV',
    status: 'offline',
    joinedAt: 'August 2026',
    bio: 'UI/UX designer crafting clean, dark-mode developer tools and micro-interactions.',
    projectIds: ['proj_1'],
    contributions: {
      commits: 6,
      tasksCompleted: 3,
      issuesResolved: 1
    },
    activities: [
      { id: 'act_108', action: 'Updated task COL-4', time: '5 hours ago', detail: 'Set status to IN REVIEW' },
      { id: 'act_109', action: 'Commented on Issue #18', time: '1 day ago', detail: 'CSS padding fix for code viewer scrollbar' }
    ]
  },
  {
    id: 'usr_5',
    name: 'Campus Student',
    username: 'campus_s',
    email: 'student@campus.edu',
    role: 'viewer',
    avatar: null,
    initials: 'CS',
    status: 'offline',
    joinedAt: 'September 2026',
    bio: 'Computer Science student learning collaborative developer workflows and code reviews.',
    projectIds: ['proj_1'],
    contributions: {
      commits: 0,
      tasksCompleted: 1,
      issuesResolved: 0
    },
    activities: [
      { id: 'act_110', action: 'Joined project campus-connect', time: '3 days ago', detail: 'Assigned VIEWER role' }
    ]
  }
];

export const mockPendingInvitations = [
  {
    id: 'inv_1',
    projectId: 'proj_1',
    email: 'vikram@example.com',
    role: 'developer',
    invitedAt: '2 hours ago',
    invitedBy: 'Praveen Tiwari'
  }
];

export const ROLE_DESCRIPTIONS = {
  owner: {
    label: 'Owner',
    description: 'Full project control and administrative ownership.'
  },
  admin: {
    label: 'Admin',
    description: 'Can manage project settings, repositories, and members.'
  },
  developer: {
    label: 'Developer',
    description: 'Can work on project resources, code, tasks, and issues.'
  },
  designer: {
    label: 'Designer',
    description: 'Can contribute to project work, UI specifications, and assets.'
  },
  viewer: {
    label: 'Viewer',
    description: 'Can view project content, code, and discussions.'
  }
};
