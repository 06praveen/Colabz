const { io } = require("socket.io-client");

const API_BASE = "http://localhost:5000/api";
const SOCKET_URL = "http://localhost:5000";

const ts = Date.now();
const userAData = {
  name: "User Alpha",
  username: `unique_user_a_${ts.toString().slice(-6)}`,
  email: `user_a_${ts}@example.com`,
  password: "Password123!",
};

const userBData = {
  name: "User Beta",
  username: `unique_user_b_${ts.toString().slice(-6)}`,
  email: `user_b_${ts}@example.com`,
  password: "Password123!",
};

async function api(path, options = {}, token = null) {
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });
  const data = await res.json();
  return { status: res.status, ok: res.ok, data };
}

async function runTests() {
  console.log("=== COLABZ PHASE 1 VERIFICATION TEST SUITE ===");

  // TEST 1: Register User A
  console.log("\n[TEST 1] Registering User A with username:", userAData.username);
  const regARes = await api("/auth/register", {
    method: "POST",
    body: JSON.stringify(userAData),
  });
  if (!regARes.ok || !regARes.data?.data?.token) {
    throw new Error(`Failed to register User A: ${JSON.stringify(regARes.data)}`);
  }
  const tokenA = regARes.data.data.token;
  const userA = regARes.data.data.user;
  console.log("✓ PASS: User A registered. ID:", userA._id, "Username:", userA.username);

  // TEST 2: Register User B
  console.log("\n[TEST 2] Registering User B with username:", userBData.username);
  const regBRes = await api("/auth/register", {
    method: "POST",
    body: JSON.stringify(userBData),
  });
  if (!regBRes.ok || !regBRes.data?.data?.token) {
    throw new Error(`Failed to register User B: ${JSON.stringify(regBRes.data)}`);
  }
  const tokenB = regBRes.data.data.token;
  const userB = regBRes.data.data.user;
  console.log("✓ PASS: User B registered. ID:", userB._id, "Username:", userB.username);

  // TEST 3: Reject duplicate username
  console.log("\n[TEST 3] Testing duplicate username registration rejection...");
  const dupRes = await api("/auth/register", {
    method: "POST",
    body: JSON.stringify({
      name: "Duplicate User",
      username: userAData.username,
      email: `duplicate_${ts}@example.com`,
      password: "Password123!",
    }),
  });
  if (dupRes.status === 409 || dupRes.status === 400) {
    console.log("✓ PASS: Duplicate username correctly rejected with status:", dupRes.status, "message:", dupRes.data.message);
  } else {
    throw new Error(`Duplicate username was not rejected: ${JSON.stringify(dupRes.data)}`);
  }

  // TEST 4: Search users by username
  console.log("\n[TEST 4] Testing User Search by username: 'unique_user_b'...");
  const searchRes = await api(`/users/search?q=${userBData.username}`, {}, tokenA);
  if (!searchRes.ok || !searchRes.data?.data?.users?.length) {
    throw new Error(`User search failed: ${JSON.stringify(searchRes.data)}`);
  }
  const foundUser = searchRes.data.data.users.find(u => u.username === userBData.username);
  if (!foundUser) {
    throw new Error(`User B not found in search results: ${JSON.stringify(searchRes.data)}`);
  }
  console.log("✓ PASS: User search returned User B:", foundUser.name, "@" + foundUser.username);

  // TEST 5: Update profile username via PATCH /api/users/me
  console.log("\n[TEST 5] Testing Profile Update (PATCH /api/users/me)...");
  const newUsernameA = `alpha_updated_${ts}`;
  const updateRes = await api("/users/me", {
    method: "PATCH",
    body: JSON.stringify({ username: newUsernameA, bio: "Updated Bio for User Alpha" }),
  }, tokenA);
  if (!updateRes.ok || updateRes.data?.data?.user?.username !== newUsernameA) {
    throw new Error(`Profile update failed: ${JSON.stringify(updateRes.data)}`);
  }
  console.log("✓ PASS: User A username updated to:", updateRes.data.data.user.username);

  // TEST 6: User A creates a project
  console.log("\n[TEST 6] User A creates a new project...");
  const projectRes = await api("/projects", {
    method: "POST",
    body: JSON.stringify({
      name: `Project Alpha ${ts}`,
      description: "A collaborative test project for Phase 1",
      visibility: "private",
    }),
  }, tokenA);
  if (!projectRes.ok || !projectRes.data?.data?.project) {
    throw new Error(`Project creation failed: ${JSON.stringify(projectRes.data)}`);
  }
  const project = projectRes.data.data.project;
  console.log("✓ PASS: Project created:", project.name, "ID:", project._id);

  // TEST 7: User A adds User B as member by username
  console.log("\n[TEST 7] User A adds User B to project by username...");
  const addMemberRes = await api(`/projects/${project._id}/members`, {
    method: "POST",
    body: JSON.stringify({
      username: userBData.username,
      role: "DEVELOPER",
    }),
  }, tokenA);
  if (!addMemberRes.ok) {
    throw new Error(`Failed to add member: ${JSON.stringify(addMemberRes.data)}`);
  }
  console.log("✓ PASS: Member added to project successfully. Role:", addMemberRes.data.data?.member?.role || "DEVELOPER");

  // TEST 8: Check project membership list
  console.log("\n[TEST 8] Fetching project members list...");
  const membersRes = await api(`/projects/${project._id}/members`, {}, tokenA);
  if (!membersRes.ok || !membersRes.data?.data?.members?.length) {
    throw new Error(`Failed to get project members: ${JSON.stringify(membersRes.data)}`);
  }
  const memberList = membersRes.data.data.members;
  console.log("✓ PASS: Project has", memberList.length, "members:");
  memberList.forEach(m => console.log(`  - ${m.user?.name || m.user} (@${m.user?.username || m.username}) [${m.role}]`));

  // TEST 9: User B project access
  console.log("\n[TEST 9] Verifying User B project access...");
  const bProjectRes = await api(`/projects/${project._id}`, {}, tokenB);
  if (!bProjectRes.ok) {
    throw new Error(`User B cannot access project: ${JSON.stringify(bProjectRes.data)}`);
  }
  console.log("✓ PASS: User B successfully accessed project details.");

  // TEST 10: Chat - Socket.IO & Message Persistence
  console.log("\n[TEST 10] Testing real-time chat with Socket.IO...");
  const socketA = io(SOCKET_URL, { auth: { token: tokenA }, transports: ["websocket"] });
  const socketB = io(SOCKET_URL, { auth: { token: tokenB }, transports: ["websocket"] });

  await new Promise((resolve, reject) => {
    let connectedCount = 0;
    const timeout = setTimeout(() => reject(new Error("Socket connection timeout")), 5000);
    function check() {
      connectedCount++;
      if (connectedCount === 2) {
        clearTimeout(timeout);
        resolve();
      }
    }
    socketA.on("connect", () => {
      console.log("  Socket A connected successfully");
      check();
    });
    socketB.on("connect", () => {
      console.log("  Socket B connected successfully");
      check();
    });
  });

  // Join project room
  socketA.emit("project:join", { projectId: project._id });
  // Create conversation between User A and User B
  console.log("  Creating project conversation between User A and User B...");
  const convRes = await api(`/projects/${project._id}/conversations`, {
    method: "POST",
    body: JSON.stringify({
      participantId: userB._id,
      type: "direct",
    }),
  }, tokenA);
  if (!convRes.ok || !convRes.data?.data?.conversation?._id) {
    throw new Error(`Failed to create conversation: ${JSON.stringify(convRes.data)}`);
  }
  const conversation = convRes.data.data.conversation;
  console.log("✓ PASS: Conversation created. ID:", conversation._id);

  // Join project & conversation rooms
  socketA.emit("conversation:join", { conversationId: conversation._id });
  socketB.emit("conversation:join", { conversationId: conversation._id });

  // Test sending and receiving a real-time message
  const messageText = "Hello from User A to User B in Phase 1 verification!";
  const receivedMessagePromise = new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("Message receive timeout")), 5000);
    socketB.on("message:new", (msgData) => {
      clearTimeout(timer);
      resolve(msgData);
    });
  });

  // User A sends message via REST API
  console.log("  User A sending conversation message...");
  const sendMsgRes = await api(`/projects/${project._id}/conversations/${conversation._id}/messages`, {
    method: "POST",
    body: JSON.stringify({
      content: messageText,
    }),
  }, tokenA);
  if (!sendMsgRes.ok) {
    throw new Error(`Failed to send message via API: ${JSON.stringify(sendMsgRes.data)}`);
  }

  const receivedMsg = await receivedMessagePromise;
  console.log("✓ PASS: User B received real-time Socket.IO message:", receivedMsg.content || receivedMsg.data?.content || receivedMsg);

  // TEST 11: Message persistence verification
  console.log("\n[TEST 11] Verifying message persistence from database...");
  const historyRes = await api(`/projects/${project._id}/conversations/${conversation._id}/messages`, {}, tokenB);
  if (!historyRes.ok || !historyRes.data?.data?.messages?.length) {
    throw new Error(`Failed to load persistent messages: ${JSON.stringify(historyRes.data)}`);
  }
  const persisted = historyRes.data.data.messages.find(m => m.content === messageText);
  if (!persisted) {
    throw new Error("Sent message not found in persistent DB history!");
  }
  console.log("✓ PASS: Persistent message verified in DB history:", persisted.content);

  // TEST 12: Call Signaling & WebRTC Exchange
  console.log("\n[TEST 12] Testing WebRTC Call initiation and signaling over Socket.IO...");
  const incomingCallPromise = new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("Call signaling receive timeout")), 5000);
    socketB.on("call:incoming", (callData) => {
      clearTimeout(timer);
      resolve(callData);
    });
  });

  // User A initiates call to User B via POST /api/projects/:projectId/calls
  console.log("  User A initiating video call to User B...");
  const startCallRes = await api(`/projects/${project._id}/calls`, {
    method: "POST",
    body: JSON.stringify({
      receiverId: userB._id,
      type: "VIDEO",
      title: "Phase 1 Video Call",
    }),
  }, tokenA);

  if (!startCallRes.ok || !startCallRes.data?.data?.call) {
    throw new Error(`Failed to start call: ${JSON.stringify(startCallRes.data)}`);
  }

  const callRecord = startCallRes.data.data.call;
  console.log("✓ PASS: Call created via API. ID:", callRecord.id, "Status:", callRecord.status);

  const incomingCall = await incomingCallPromise;
  console.log("✓ PASS: User B received incoming call notification from User A via Socket.IO. Call ID:", incomingCall.callId);

  // User B accepts call via socket
  const callAcceptedPromise = new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("Call accept receive timeout")), 5000);
    socketA.on("call:accepted", (data) => {
      clearTimeout(timer);
      resolve(data);
    });
  });

  socketB.emit("call:accept", { callId: incomingCall.callId });
  const acceptedData = await callAcceptedPromise;
  console.log("✓ PASS: User A received call acceptance confirmation via Socket.IO.");

  // TEST 13: WebRTC Offer / Answer / ICE Candidates
  console.log("\n[TEST 13] Testing WebRTC SDP offer, answer and ICE candidate exchange...");
  const offerPromise = new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("WebRTC offer receive timeout")), 5000);
    socketB.on("webrtc:offer", (data) => {
      clearTimeout(timer);
      resolve(data);
    });
  });

  socketA.emit("webrtc:offer", {
    callId: incomingCall.callId,
    sdp: { type: "offer", sdp: "v=0\r\no=alice..." },
  });
  const receivedOffer = await offerPromise;
  console.log("✓ PASS: User B received WebRTC offer from User A.");

  const answerPromise = new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("WebRTC answer receive timeout")), 5000);
    socketA.on("webrtc:answer", (data) => {
      clearTimeout(timer);
      resolve(data);
    });
  });

  socketB.emit("webrtc:answer", {
    callId: incomingCall.callId,
    sdp: { type: "answer", sdp: "v=0\r\no=bob..." },
  });
  const receivedAnswer = await answerPromise;
  console.log("✓ PASS: User A received WebRTC answer from User B.");

  const icePromise = new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("WebRTC ICE receive timeout")), 5000);
    socketB.on("webrtc:ice-candidate", (data) => {
      clearTimeout(timer);
      resolve(data);
    });
  });

  socketA.emit("webrtc:ice-candidate", {
    callId: incomingCall.callId,
    candidate: { candidate: "candidate:1 1 UDP 2130706431 ...", sdpMid: "0", sdpMLineIndex: 0 },
  });
  const receivedIce = await icePromise;
  console.log("✓ PASS: User B received ICE candidate from User A.");

  // TEST 14: End Call & Verify History
  console.log("\n[TEST 14] Testing Call Ending and History Persistence...");
  const callEndedPromise = new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("Call end receive timeout")), 5000);
    socketB.on("call:ended", (data) => {
      clearTimeout(timer);
      resolve(data);
    });
  });

  socketA.emit("call:end", { callId: incomingCall.callId });
  const endedData = await callEndedPromise;
  console.log("✓ PASS: User B received call:ended event.");

  // Verify call history from DB
  const callsHistoryRes = await api(`/projects/${project._id}/calls`, {}, tokenB);
  if (!callsHistoryRes.ok || !callsHistoryRes.data?.data?.calls?.length) {
    throw new Error(`Failed to load call history: ${JSON.stringify(callsHistoryRes.data)}`);
  }
  const completedCall = callsHistoryRes.data.data.calls.find(c => c.id === incomingCall.callId);
  if (!completedCall || completedCall.status !== "ended") {
    throw new Error(`Call history status mismatch: ${JSON.stringify(completedCall)}`);
  }
  console.log("✓ PASS: Call record in database verified with status 'ended'.");

  // Clean up sockets
  socketA.disconnect();
  socketB.disconnect();

  console.log("\n=======================================================");
  console.log("🎉 ALL PHASE 1 REQUIREMENTS PASS VERIFICATION!");
  console.log("=======================================================\n");
  console.log("=======================================================\n");
}

runTests().catch((err) => {
  console.error("\n❌ TEST FAILED:", err);
  process.exit(1);
});
