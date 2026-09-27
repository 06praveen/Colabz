export const mockIssues = [
  {
    id: 'issue_1',
    number: 24,
    projectId: 'proj_1',
    title: 'Repository search input drops last character on fast typing',
    description: 'When typing quickly into the repository search input, the filter state occasionally misses the final character due to un-debounced state updates.',
    status: 'Open',
    priority: 'High',
    assignee: { name: 'Praveen Tiwari', initials: 'PR', role: 'Maintainer' },
    author: 'Rahul Sharma',
    authorInitials: 'RS',
    labels: ['Bug', 'Frontend'],
    createdAt: '2 days ago',
    updatedAt: '1 hour ago',
    comments: [
      {
        id: 'comm_1',
        author: 'Praveen Tiwari',
        initials: 'PR',
        text: 'I found the problem in the search state update handler. Need to update state synchronously.',
        time: '2 hours ago'
      },
      {
        id: 'comm_2',
        author: 'Rahul Sharma',
        initials: 'RS',
        text: 'Sounds good, let me know when the patch is ready for testing.',
        time: '1 hour ago'
      }
    ]
  },
  {
    id: 'issue_2',
    number: 18,
    projectId: 'proj_1',
    title: 'Code viewer horizontal scrollbar overlaps with last line text',
    description: 'On WebKit browsers, the horizontal scrollbar covers the final line of code in CodeViewer when padding is insufficient.',
    status: 'Open',
    priority: 'Medium',
    assignee: { name: 'Neha Verma', initials: 'NV', role: 'Contributor' },
    author: 'Amit Kumar',
    authorInitials: 'AK',
    labels: ['UI', 'CSS'],
    createdAt: '4 days ago',
    updatedAt: '1 day ago',
    comments: [
      {
        id: 'comm_3',
        author: 'Neha Verma',
        initials: 'NV',
        text: 'Adding a bottom padding of 0.85rem to the pre block resolves this overlay.',
        time: '1 day ago'
      }
    ]
  },
  {
    id: 'issue_3',
    number: 12,
    projectId: 'proj_1',
    title: 'Branch dropdown loses keyboard focus on Escape key',
    description: 'Pressing Escape inside BranchSelector closes the menu but loses tab focus ring position.',
    status: 'Closed',
    priority: 'Low',
    assignee: { name: 'Amit Kumar', initials: 'AK', role: 'Contributor' },
    author: 'Praveen Tiwari',
    authorInitials: 'PR',
    labels: ['Accessibility', 'UI'],
    createdAt: '1 week ago',
    updatedAt: '3 days ago',
    comments: [
      {
        id: 'comm_4',
        author: 'Amit Kumar',
        initials: 'AK',
        text: 'Fixed by restoring focus to the trigger button ref upon modal close.',
        time: '3 days ago'
      }
    ]
  }
];
