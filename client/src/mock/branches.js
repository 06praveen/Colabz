export const mockBranches = {
  proj_1: [
    {
      name: 'main',
      isDefault: true,
      updatedAt: '10 minutes ago',
      lastCommit: '9f4a8b1',
      lastCommitMessage: 'Update routes for Phase 6 repository workspace',
      behindAhead: 'Default branch',
      author: 'Praveen Tiwari'
    },
    {
      name: 'development',
      isDefault: false,
      updatedAt: '3 hours ago',
      lastCommit: '3c1d9f0',
      lastCommitMessage: 'feat(core): setup file tree navigation state',
      behindAhead: '2 commits ahead of main',
      author: 'Rahul Sharma'
    },
    {
      name: 'feature/auth-ui',
      isDefault: false,
      updatedAt: '1 day ago',
      lastCommit: '7bd91aa',
      lastCommitMessage: 'refactor(auth): simplify login form fields',
      behindAhead: '4 commits ahead, 1 behind',
      author: 'Neha Verma'
    },
    {
      name: 'feature/chat-sockets',
      isDefault: false,
      updatedAt: '2 days ago',
      lastCommit: '2ac18fd',
      lastCommitMessage: 'feat(socket): add channel room listeners',
      behindAhead: '1 commit ahead',
      author: 'Amit Kumar'
    }
  ]
};
