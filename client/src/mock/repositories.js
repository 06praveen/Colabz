export const mockRepositories = [
  {
    projectId: 'proj_1',
    projectName: 'campus-connect',
    defaultBranch: 'main',
    visibility: 'PUBLIC',
    description: 'Real-time collaborative campus workspace.',
    techStack: ['React', 'Node.js', 'MongoDB', 'Socket.IO'],
    contributors: [
      { name: 'Praveen Tiwari', initials: 'PR', role: 'Maintainer' },
      { name: 'Rahul Sharma', initials: 'RS', role: 'Contributor' },
      { name: 'Amit Kumar', initials: 'AK', role: 'Contributor' },
      { name: 'Neha Verma', initials: 'NV', role: 'Contributor' }
    ],
    stats: {
      commitsCount: 24,
      branchesCount: 4,
      contributorsCount: 4
    }
  },
  {
    projectId: 'proj_2',
    projectName: 'ai-stock-predictor',
    defaultBranch: 'main',
    visibility: 'PRIVATE',
    description: 'Neural model predicting market trends in real time.',
    techStack: ['Python', 'PyTorch', 'FastAPI', 'Pandas'],
    contributors: [
      { name: 'Praveen Tiwari', initials: 'PR', role: 'Maintainer' }
    ],
    stats: {
      commitsCount: 14,
      branchesCount: 2,
      contributorsCount: 1
    }
  },
  {
    projectId: 'proj_3',
    projectName: 'student-management',
    defaultBranch: 'main',
    visibility: 'PUBLIC',
    description: 'Course registration, grading, and attendance portal.',
    techStack: ['Next.js', 'Tailwind', 'PostgreSQL', 'Prisma'],
    contributors: [
      { name: 'Praveen Tiwari', initials: 'PR', role: 'Maintainer' },
      { name: 'Rahul Sharma', initials: 'RS', role: 'Contributor' }
    ],
    stats: {
      commitsCount: 18,
      branchesCount: 3,
      contributorsCount: 2
    }
  }
];
