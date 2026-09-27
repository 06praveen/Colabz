export const mockTasks = [
  {
    id: 'task_1',
    identifier: 'COL-1',
    projectId: 'proj_1',
    title: 'Improve repository mobile layout and sidebar responsiveness',
    description: 'Ensure code tree sidebar collapses gracefully on mobile screens and back button is visible when inspecting single files.',
    status: 'IN PROGRESS',
    priority: 'High',
    assignee: { name: 'Praveen Tiwari', initials: 'PR', role: 'Maintainer' },
    labels: ['Frontend', 'UI', 'Mobile'],
    dueDate: '2026-09-30',
    createdAt: '2026-09-24',
    updatedAt: '2 hours ago',
    activity: [
      { id: 'act_1', user: 'Praveen Tiwari', action: 'created the task', time: '2 days ago' },
      { id: 'act_2', user: 'Praveen Tiwari', action: 'changed status from TODO to IN PROGRESS', time: '2 hours ago' }
    ]
  },
  {
    id: 'task_2',
    identifier: 'COL-2',
    projectId: 'proj_1',
    title: 'Implement authentication flow and session provider',
    description: 'Add AuthContext wrapper with persistent mock user tokens and login page validation.',
    status: 'DONE',
    priority: 'Urgent',
    assignee: { name: 'Rahul Sharma', initials: 'RS', role: 'Contributor' },
    labels: ['Frontend', 'Auth'],
    dueDate: '2026-09-25',
    createdAt: '2026-09-20',
    updatedAt: 'Yesterday',
    activity: [
      { id: 'act_3', user: 'Rahul Sharma', action: 'created the task', time: '6 days ago' },
      { id: 'act_4', user: 'Rahul Sharma', action: 'marked task as DONE', time: 'Yesterday' }
    ]
  },
  {
    id: 'task_3',
    identifier: 'COL-3',
    projectId: 'proj_1',
    title: 'Add dark mode color tokens and Geist font loading',
    description: 'Configure index.css with CSS custom properties for surfaces, borders, and typography scales.',
    status: 'DONE',
    priority: 'Medium',
    assignee: { name: 'Amit Kumar', initials: 'AK', role: 'Contributor' },
    labels: ['UI', 'Design System'],
    dueDate: '2026-09-22',
    createdAt: '2026-09-18',
    updatedAt: '3 days ago',
    activity: [
      { id: 'act_5', user: 'Amit Kumar', action: 'created the task', time: '8 days ago' },
      { id: 'act_6', user: 'Amit Kumar', action: 'marked task as DONE', time: '3 days ago' }
    ]
  },
  {
    id: 'task_4',
    identifier: 'COL-4',
    projectId: 'proj_1',
    title: 'Set up file tree recursive component and diff viewer',
    description: 'Build reusable RepositoryTree component supporting nested directory expansion and line-by-line diff highlight.',
    status: 'IN REVIEW',
    priority: 'High',
    assignee: { name: 'Neha Verma', initials: 'NV', role: 'Contributor' },
    labels: ['Frontend', 'Repository'],
    dueDate: '2026-10-02',
    createdAt: '2026-09-25',
    updatedAt: '5 hours ago',
    activity: [
      { id: 'act_7', user: 'Neha Verma', action: 'created the task', time: '2 days ago' },
      { id: 'act_8', user: 'Neha Verma', action: 'changed status to IN REVIEW', time: '5 hours ago' }
    ]
  },
  {
    id: 'task_5',
    identifier: 'COL-5',
    projectId: 'proj_1',
    title: 'Write phase 7 learning documentation and architecture guides',
    description: 'Document React dynamic routes, CRUD state patterns, custom modals, and accessibility rules in PHASE_7_LEARNING.md.',
    status: 'TODO',
    priority: 'Low',
    assignee: { name: 'Praveen Tiwari', initials: 'PR', role: 'Maintainer' },
    labels: ['Documentation'],
    dueDate: '2026-10-05',
    createdAt: '2026-09-26',
    updatedAt: '1 day ago',
    activity: [
      { id: 'act_9', user: 'Praveen Tiwari', action: 'created the task', time: '1 day ago' }
    ]
  }
];
