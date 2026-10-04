const { io } = require("socket.io-client");

const BASE_URL = "http://localhost:5000/api";
const SOCKET_URL = "http://localhost:5000";

async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };
  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`;
  }

  const res = await fetch(url, {
    method: options.method || "GET",
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok && !options.allowError) {
    const error = new Error(data.message || `Request failed with status ${res.status}`);
    error.status = res.status;
    error.data = data;
    throw error;
  }
  return { status: res.status, data };
}

async function runPhase10FullTest() {
  console.log("=================================================");
  console.log("  COLABZ PHASE 10 FULL INTEGRATION & AUDIT TEST  ");
  console.log("=================================================\n");

  const timestamp = Date.now();

  // Test 1: Health Check
  console.log("[1/12] Testing Health Endpoint (/api/health)...");
  const healthRes = await request("/health");
  if (healthRes.data.success && healthRes.data.data.database === "connected") {
    console.log("  ✓ Health check passed:", healthRes.data.data);
  } else {
    throw new Error("Health check failed: " + JSON.stringify(healthRes.data));
  }

  // Test 2: AI Status Endpoint
  console.log("\n[2/12] Testing AI Status Endpoint (/api/ai/status)...");
  const aiStatusRes = await request("/ai/status");
  console.log("  ✓ AI status response:", aiStatusRes.data.data);

  // Test 3: Unauthenticated AI Chat Request (Security check)
  console.log("\n[3/12] Testing Unauthenticated AI Chat Request (expecting 401)...");
  const unauthAiRes = await request("/ai/chat", {
    method: "POST",
    body: { prompt: "Explain React hooks" },
    allowError: true,
  });
  if (unauthAiRes.status === 401) {
    console.log("  ✓ Unauthenticated request blocked correctly with 401 Unauthorized.");
  } else {
    throw new Error(`Expected 401 but received ${unauthAiRes.status}`);
  }

  // Test 4: User Registration & Authentication (JWT + bcrypt)
  console.log("\n[4/12] Registering & Authenticating User A (Ronak) & User B (Praveen)...");
  const userARes = await request("/auth/register", {
    method: "POST",
    body: {
      name: "Ronak Kumar",
      email: `ronak_${timestamp}@example.com`,
      password: "password123",
    },
  });
  const tokenA = userARes.data.data.token;
  const userA = userARes.data.data.user;
  console.log(`  ✓ User A created: ${userA.name} (${userA.email}), ID: ${userA.id || userA._id}`);

  const userBRes = await request("/auth/register", {
    method: "POST",
    body: {
      name: "Praveen Tiwari",
      email: `praveen_${timestamp}@example.com`,
      password: "password123",
    },
  });
  const tokenB = userBRes.data.data.token;
  const userB = userBRes.data.data.user;
  console.log(`  ✓ User B created: ${userB.name} (${userB.email}), ID: ${userB.id || userB._id}`);

  // Test 5: Project Creation & Membership
  console.log("\n[5/12] User A creates workspace project 'Colabz Demo'...");
  const projRes = await request("/projects", {
    method: "POST",
    token: tokenA,
    body: {
      name: "Colabz Demo",
      description: "Phase 10 full integration project",
      language: "JavaScript",
      technologies: ["React", "Node.js", "MongoDB", "Socket.IO", "WebRTC"],
      visibility: "private",
    },
  });
  const project = projRes.data.data.project;
  const projectId = project._id || project.id;
  console.log(`  ✓ Project created: ${project.name}, ID: ${projectId}`);

  // Test 6: Inviting Member & Acceptance
  console.log("\n[6/12] User A invites User B to project...");
  const inviteRes = await request(`/projects/${projectId}/invitations`, {
    method: "POST",
    token: tokenA,
    body: {
      email: userB.email,
      role: "DEVELOPER",
    },
  });
  const invitation = inviteRes.data.data.invitation;
  console.log(`  ✓ Invitation created with role: ${invitation.role}, status: ${invitation.status}`);

  // User B accepts invitation
  const acceptRes = await request(`/invitations/${invitation._id || invitation.id}/accept`, {
    method: "POST",
    token: tokenB,
  });
  console.log("  ✓ User B accepted invitation successfully:", acceptRes.data.message);

  // Test 7: Task & Issue Workflow
  console.log("\n[7/12] Testing Task & Issue Workflow...");
  const taskRes = await request(`/projects/${projectId}/tasks`, {
    method: "POST",
    token: tokenA,
    body: {
      title: "Build Login API",
      description: "Implement JWT authentication with rate limiting",
      priority: "High",
      assignee: userB.id || userB._id,
    },
  });
  const task = taskRes.data.data.task;
  console.log(`  ✓ Task created: ${task.title} (${task.identifier || "Task"}), Assignee: User B`);

  // User B updates task status to IN_PROGRESS
  const updateTaskRes = await request(`/projects/${projectId}/tasks/${task._id || task.id}`, {
    method: "PATCH",
    token: tokenB,
    body: {
      status: "IN_PROGRESS",
    },
  });
  console.log("  ✓ User B updated task status to:", updateTaskRes.data.data.task.status);

  // User A creates issue
  const issueRes = await request(`/projects/${projectId}/issues`, {
    method: "POST",
    token: tokenA,
    body: {
      title: "Fix Token Expiration Logic",
      description: "Ensure 401 status triggers session cleanup",
      priority: "High",
    },
  });
  const issue = issueRes.data.data.issue;
  console.log(`  ✓ Issue created: #${issue.number} - ${issue.title}`);

  // User B comments on issue
  const commentRes = await request(`/projects/${projectId}/issues/${issue._id || issue.id}/comments`, {
    method: "POST",
    token: tokenB,
    body: {
      content: "Looking into the axios interceptor implementation now.",
    },
  });
  console.log("  ✓ User B commented on issue:", commentRes.data.data.comment.content);

  // Test 8: Repository Files, Commits & Branches
  console.log("\n[8/12] Testing Repository Files, Commits & Branches...");
  // Create branch
  const branchRes = await request(`/projects/${projectId}/branches`, {
    method: "POST",
    token: tokenA,
    body: {
      name: "feature/test",
    },
  });
  const branch = branchRes.data.data.branch;
  console.log(`  ✓ Branch created: ${branch.name}`);

  // Create file
  const fileRes = await request(`/projects/${projectId}/repository/files`, {
    method: "POST",
    token: tokenA,
    body: {
      name: "test.js",
      path: "src/test.js",
      content: "console.log('Colabz Phase 10 test suite');",
      branchName: "feature/test",
      commitMessage: "Add test file in feature branch",
    },
  });
  console.log(`  ✓ File created: ${fileRes.data.data.file.path}`);

  // Commit history check
  const commitsRes = await request(`/projects/${projectId}/commits?branchName=feature/test`, {
    token: tokenA,
  });
  console.log(`  ✓ Commits retrieved: ${commitsRes.data.data.commits.length} commit(s) on feature/test`);

  // Test 9: Real-time Socket.IO Chat & Notifications
  console.log("\n[9/12] Testing Socket.IO Chat & Notifications...");
  const socketA = io(SOCKET_URL, {
    auth: { token: tokenA },
    transports: ["websocket"],
  });
  const socketB = io(SOCKET_URL, {
    auth: { token: tokenB },
    transports: ["websocket"],
  });

  await new Promise((resolve) => {
    let connectedCount = 0;
    const check = () => {
      connectedCount++;
      if (connectedCount === 2) resolve();
    };
    socketA.on("connect", check);
    socketB.on("connect", check);
  });
  console.log("  ✓ Both sockets connected with JWT authentication.");

  // Direct conversation creation
  const convRes = await request(`/projects/${projectId}/conversations`, {
    method: "POST",
    token: tokenA,
    body: {
      type: "direct",
      recipientId: userB.id || userB._id,
    },
  });
  const conversation = convRes.data.data.conversation;
  const convId = conversation._id || conversation.id;
  console.log(`  ✓ Direct conversation established ID: ${convId}`);

  // User B joins conversation room
  socketB.emit("conversation:join", { conversationId: convId });

  // User A sends message over REST
  const msgRes = await request(`/projects/${projectId}/conversations/${convId}/messages`, {
    method: "POST",
    token: tokenA,
    body: {
      content: "Hello Praveen! Ready for the Phase 10 demo?",
    },
  });
  console.log(`  ✓ Message sent by User A: "${msgRes.data.data.message.content}"`);

  // Test 10: 1-to-1 WebRTC Call Lifecycle
  console.log("\n[10/12] Testing 1-to-1 Voice/Video Call Lifecycle...");
  const startCallRes = await request(`/projects/${projectId}/calls`, {
    method: "POST",
    token: tokenA,
    body: {
      receiverId: userB.id || userB._id,
      type: "VIDEO",
    },
  });
  const call = startCallRes.data.data.call;
  const callId = call._id || call.id;
  console.log(`  ✓ Call initiated ID: ${callId}, Status: ${call.status}`);

  // User B receives and accepts call over socket
  await new Promise((resolve) => {
    socketA.once("call:accepted", (payload) => {
      console.log(`  ✓ User A received call:accepted event for call ID: ${payload.callId}`);
      resolve();
    });
    socketB.emit("call:accept", { callId });
  });

  // User A ends call after a brief delay
  await new Promise((r) => setTimeout(r, 1000));
  await new Promise((resolve) => {
    socketB.once("call:ended", (payload) => {
      const dur = payload.call?.duration !== undefined ? payload.call.duration : payload.duration;
      console.log(`  ✓ User B received call:ended event with duration: ${dur}s`);
      resolve();
    });
    socketA.emit("call:end", { callId });
  });

  // Verify call record in history
  const callsHistoryRes = await request(`/projects/${projectId}/calls`, { token: tokenA });
  const completedCall = callsHistoryRes.data.data.calls.find((c) => (c._id || c.id) === callId);
  console.log(`  ✓ Call history confirmed: Status = ${completedCall.status}, Duration = ${completedCall.duration}s`);

  // Test 11: AI Coding Assistant with Project Context
  console.log("\n[11/12] Testing Authenticated AI Coding Assistant with Project Context...");
  const aiChatRes = await request("/ai/chat", {
    method: "POST",
    token: tokenA,
    body: {
      prompt: "Explain REST API architectural principles in 3 brief bullet points.",
      actionType: "general",
      projectId: projectId,
      codeSnippet: "app.get('/api/projects', getProjects);",
    },
  });
  console.log("  ✓ AI Assistant Response received successfully:");
  console.log("    Model:", aiChatRes.data.data.model);
  console.log("    IsFallback Mode:", aiChatRes.data.data.isFallback);
  console.log("    Reply preview:\n", aiChatRes.data.data.reply.slice(0, 180) + "...\n");

  // Test 12: Notifications and Activity Feed Verification
  console.log("[12/12] Verifying Notification & Activity Persistence...");
  const notifsRes = await request("/notifications", { token: tokenB });
  console.log(`  ✓ User B received ${notifsRes.data.data.notifications.length} notification(s).`);

  const activityRes = await request(`/projects/${projectId}/activity`, { token: tokenA });
  console.log(`  ✓ Project activity feed has ${activityRes.data.data.activities.length} recorded event(s).`);

  // Cleanup sockets
  socketA.disconnect();
  socketB.disconnect();

  console.log("\n=================================================");
  console.log("  ALL PHASE 10 INTEGRATION TESTS PASSED (12/12)  ");
  console.log("=================================================\n");
}

runPhase10FullTest()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("\n❌ Test failed with error:", err.message);
    if (err.data) {
      console.error("Response data:", err.data);
    }
    process.exit(1);
  });
