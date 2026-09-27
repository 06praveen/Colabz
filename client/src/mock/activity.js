export const mockActivity = [
  {
    id: "act_001",
    type: "commit_pushed",
    actorId: "usr_1",
    projectId: "proj_1",
    entityType: "repository",
    entityId: "repo_1",
    title: "Praveen Tiwari pushed 3 commits",
    detail: "fix(auth): update JWT token refreshing mechanism and clean session storage",
    metadata: {
      branch: "main",
      commitCount: 3,
      commitSha: "9f4a8b1"
    },
    createdAt: "2026-09-27T10:42:00Z",
    timeAgo: "10 mins ago"
  },
  {
    id: "act_002",
    type: "call_started",
    actorId: "usr_2",
    projectId: "proj_1",
    entityType: "call",
    entityId: "call_001",
    title: "Rahul Sharma started a video call",
    detail: "Development Sync · 4 participants joined",
    metadata: {
      callType: "video",
      roomName: "Development"
    },
    createdAt: "2026-09-27T10:15:00Z",
    timeAgo: "30 mins ago"
  },
  {
    id: "act_003",
    type: "issue_opened",
    actorId: "usr_2",
    projectId: "proj_1",
    entityType: "issue",
    entityId: "issue_1",
    title: "Rahul Sharma opened Issue #24",
    detail: "WebSocket connection drop on tab switch in background state",
    metadata: {
      issueNumber: 24,
      priority: "HIGH",
      status: "OPEN"
    },
    createdAt: "2026-09-27T08:30:00Z",
    timeAgo: "2 hours ago"
  },
  {
    id: "act_004",
    type: "task_assigned",
    actorId: "usr_2",
    projectId: "proj_1",
    entityType: "task",
    entityId: "task_1",
    title: "Rahul Sharma assigned COL-24 to Praveen Tiwari",
    detail: "Improve repository mobile layout and responsiveness",
    metadata: {
      taskId: "COL-24",
      assigneeId: "usr_1"
    },
    createdAt: "2026-09-27T07:50:00Z",
    timeAgo: "3 hours ago"
  },
  {
    id: "act_005",
    type: "member_joined",
    actorId: "usr_3",
    projectId: "proj_1",
    entityType: "member",
    entityId: "usr_3",
    title: "Amit Kumar joined the project",
    detail: "Assigned role: DEVELOPER",
    metadata: {
      role: "DEVELOPER"
    },
    createdAt: "2026-09-26T14:10:00Z",
    timeAgo: "Yesterday"
  },
  {
    id: "act_006",
    type: "pull_request_created",
    actorId: "usr_4",
    projectId: "proj_2",
    entityType: "repository",
    entityId: "repo_2",
    title: "Neha Verma created PR #12",
    detail: "feat(model): integration of PyTorch neural inference pipeline",
    metadata: {
      prNumber: 12,
      sourceBranch: "feature/pytorch-model",
      targetBranch: "main"
    },
    createdAt: "2026-09-26T11:00:00Z",
    timeAgo: "Yesterday"
  },
  {
    id: "act_007",
    type: "task_completed",
    actorId: "usr_4",
    projectId: "proj_2",
    entityType: "task",
    entityId: "task_2",
    title: "Neha Verma completed COL-18",
    detail: "Setup PyTorch model inference service",
    metadata: {
      taskId: "COL-18",
      status: "DONE"
    },
    createdAt: "2026-09-25T16:30:00Z",
    timeAgo: "2 days ago"
  },
  {
    id: "act_008",
    type: "message_sent",
    actorId: "usr_3",
    projectId: "proj_1",
    entityType: "conversation",
    entityId: "conv_1",
    title: "Amit Kumar posted in #development",
    detail: "Shared link to API schema documentation v2.1",
    metadata: {
      channel: "development"
    },
    createdAt: "2026-09-25T14:15:00Z",
    timeAgo: "2 days ago"
  },
  {
    id: "act_009",
    type: "branch_created",
    actorId: "usr_1",
    projectId: "proj_1",
    entityType: "repository",
    entityId: "repo_1",
    title: "Praveen Tiwari created branch feature/realtime-calls",
    detail: "Created from branch main",
    metadata: {
      branch: "feature/realtime-calls"
    },
    createdAt: "2026-09-24T10:00:00Z",
    timeAgo: "3 days ago"
  },
  {
    id: "act_010",
    type: "project_created",
    actorId: "usr_1",
    projectId: "proj_1",
    entityType: "project",
    entityId: "proj_1",
    title: "Praveen Tiwari created Campus Connect project",
    detail: "Project workspace initialized with main repository",
    metadata: {
      visibility: "PUBLIC"
    },
    createdAt: "2026-09-20T09:00:00Z",
    timeAgo: "7 days ago"
  }
];
