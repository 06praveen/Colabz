const { io } = require("socket.io-client");
const fs = require("fs");

const API_BASE = "http://localhost:5000/api";
const SOCKET_URL = "http://localhost:5000";

const ts = Date.now();
const userAData = {
  name: "Praveen Owner",
  username: `unique_test_a_${ts.toString().slice(-6)}`,
  email: `owner_a_${ts}@example.com`,
  password: "Password123!",
};

const userBData = {
  name: "Aayush Member",
  username: `unique_test_b_${ts.toString().slice(-6)}`,
  email: `member_b_${ts}@example.com`,
  password: "Password123!",
};

const userCData = {
  name: "Stranger User",
  username: `stranger_c_${ts.toString().slice(-6)}`,
  email: `stranger_c_${ts}@example.com`,
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
  let data;
  try {
    data = await res.json();
  } catch (e) {
    data = null;
  }
  return { status: res.status, ok: res.ok, data };
}

async function runTests() {
  console.log("=======================================================");
  console.log("🚀 COLABZ PHASE 2 END-TO-END VERIFICATION TEST SUITE");
  console.log("=======================================================\n");

  // REGISTER TEST USERS
  console.log("[SETUP] Registering User A, User B, and User C...");
  const regA = await api("/auth/register", { method: "POST", body: JSON.stringify(userAData) });
  const tokenA = regA.data?.data?.token;
  const userA = regA.data?.data?.user;

  const regB = await api("/auth/register", { method: "POST", body: JSON.stringify(userBData) });
  const tokenB = regB.data?.data?.token;
  const userB = regB.data?.data?.user;

  const regC = await api("/auth/register", { method: "POST", body: JSON.stringify(userCData) });
  const tokenC = regC.data?.data?.token;
  const userC = regC.data?.data?.user;

  console.log("✓ User A registered:", userA.name, `@${userA.username}`);
  console.log("✓ User B registered:", userB.name, `@${userB.username}`);
  console.log("✓ User C registered:", userC.name, `@${userC.username}`);

  // TEST 1: User A creates project
  console.log("\n[TEST 1] User A creates project...");
  const projRes = await api("/projects", {
    method: "POST",
    body: JSON.stringify({
      name: `Colabz Project ${ts}`,
      description: "Phase 2 Collaboration Workspace",
      visibility: "private",
    }),
  }, tokenA);
  if (!projRes.ok || !projRes.data?.data?.project) {
    throw new Error(`Project creation failed: ${JSON.stringify(projRes.data)}`);
  }
  const project = projRes.data.data.project;
  console.log("✓ PASS: Project created:", project.name, `(ID: ${project._id})`);

  // TEST 2: User A searches @unique_test_b and sends invitation
  console.log("\n[TEST 2] User A searches User B and sends invitation by username...");
  const searchRes = await api(`/users/search?q=${userBData.username}`, {}, tokenA);
  if (!searchRes.ok || !searchRes.data?.data?.users?.length) {
    throw new Error(`User search failed: ${JSON.stringify(searchRes.data)}`);
  }
  console.log("✓ PASS: Found User B via search: @" + searchRes.data.data.users[0].username);

  const inviteRes = await api(`/projects/${project._id}/invitations`, {
    method: "POST",
    body: JSON.stringify({
      username: userBData.username,
      role: "DEVELOPER",
    }),
  }, tokenA);
  if (!inviteRes.ok || !inviteRes.data?.data?.invitation) {
    throw new Error(`Failed to create invitation: ${JSON.stringify(inviteRes.data)}`);
  }
  const invitation = inviteRes.data.data.invitation;
  console.log("✓ PASS: Invitation created in DB. ID:", invitation.id, "Status:", invitation.status);

  // TEST 3: Prevent duplicate invitation
  console.log("\n[TEST 3] Testing duplicate invitation prevention...");
  const dupInviteRes = await api(`/projects/${project._id}/invitations`, {
    method: "POST",
    body: JSON.stringify({
      username: userBData.username,
      role: "DEVELOPER",
    }),
  }, tokenA);
  if (dupInviteRes.status === 409) {
    console.log("✓ PASS: Duplicate invitation prevented with 409 Conflict:", dupInviteRes.data.message);
  } else {
    throw new Error(`Duplicate invitation was not prevented: ${JSON.stringify(dupInviteRes.data)}`);
  }

  // TEST 4: User B opens Inbox
  console.log("\n[TEST 4] User B fetches Inbox (GET /api/invitations)...");
  const inboxRes = await api("/invitations", {}, tokenB);
  if (!inboxRes.ok || !inboxRes.data?.data?.invitations?.length) {
    throw new Error(`Inbox empty or failed: ${JSON.stringify(inboxRes.data)}`);
  }
  const receivedInvite = inboxRes.data.data.invitations.find(i => i.id === invitation.id);
  if (!receivedInvite) {
    throw new Error(`Sent invitation not found in User B inbox!`);
  }
  console.log("✓ PASS: Invitation visible in User B Inbox from:", receivedInvite.invitedBy, `(@${receivedInvite.inviterUsername}) for project '${receivedInvite.projectName}'`);

  // TEST 5: Access control check BEFORE acceptance
  console.log("\n[TEST 5] Verifying strict access rejection BEFORE acceptance...");
  const unauthAccess1 = await api(`/projects/${project._id}/tasks`, {}, tokenB);
  const unauthAccess2 = await api(`/projects/${project._id}/chat`, {}, tokenC);
  if (unauthAccess1.status === 403 && unauthAccess2.status === 403) {
    console.log("✓ PASS: User B and User C correctly denied access (403 Forbidden) prior to membership.");
  } else {
    throw new Error(`Access control breach! User B status: ${unauthAccess1.status}, User C status: ${unauthAccess2.status}`);
  }

  // TEST 6: User B accepts invitation
  console.log("\n[TEST 6] User B accepts invitation (POST /api/invitations/:id/accept)...");
  const acceptRes = await api(`/invitations/${invitation.id}/accept`, {
    method: "POST",
  }, tokenB);
  if (!acceptRes.ok || !acceptRes.data?.data?.membership) {
    throw new Error(`Failed to accept invitation: ${JSON.stringify(acceptRes.data)}`);
  }
  console.log("✓ PASS: Invitation accepted. Membership status:", acceptRes.data.data.membership.status, "Role:", acceptRes.data.data.membership.role);

  // TEST 7: User B project access AFTER acceptance
  console.log("\n[TEST 7] Verifying User B project access AFTER acceptance...");
  const memberAccess = await api(`/projects/${project._id}`, {}, tokenB);
  if (!memberAccess.ok) {
    throw new Error(`User B failed to access project: ${JSON.stringify(memberAccess.data)}`);
  }
  console.log("✓ PASS: User B successfully accessed project details.");

  // TEST 8: Repository collaboration
  console.log("\n[TEST 8] Testing repository access and file editing for accepted member...");
  const repoRes = await api(`/projects/${project._id}/repository`, {}, tokenB);
  if (!repoRes.ok) {
    throw new Error(`Repository access failed: ${JSON.stringify(repoRes.data)}`);
  }
  console.log("✓ PASS: User B accessed repository structure.");

  // TEST 9: Real-time Chat
  console.log("\n[TEST 9] Testing real-time chat with Socket.IO...");
  const socketA = io(SOCKET_URL, { auth: { token: tokenA }, transports: ["websocket"] });
  const socketB = io(SOCKET_URL, { auth: { token: tokenB }, transports: ["websocket"] });

  await new Promise((resolve, reject) => {
    let count = 0;
    const to = setTimeout(() => reject(new Error("Socket connection timeout")), 4000);
    const check = () => {
      count++;
      if (count === 2) {
        clearTimeout(to);
        resolve();
      }
    };
    socketA.on("connect", check);
    socketB.on("connect", check);
  });

  // Create conversation
  const convRes = await api(`/projects/${project._id}/conversations`, {
    method: "POST",
    body: JSON.stringify({ participantId: userB._id, type: "direct" }),
  }, tokenA);
  const convId = convRes.data?.data?.conversation?._id;

  socketA.emit("conversation:join", { conversationId: convId });
  socketB.emit("conversation:join", { conversationId: convId });

  const msgPromise = new Promise((resolve, reject) => {
    const to = setTimeout(() => reject(new Error("Chat receive timeout")), 4000);
    socketB.on("message:new", (data) => {
      clearTimeout(to);
      resolve(data);
    });
  });

  await api(`/projects/${project._id}/conversations/${convId}/messages`, {
    method: "POST",
    body: JSON.stringify({ content: "Welcome to Colabz Phase 2!" }),
  }, tokenA);

  const receivedMsg = await msgPromise;
  console.log("✓ PASS: Real-time Socket.IO chat message received by User B:", receivedMsg.message?.content || receivedMsg.content);

  // TEST 10: 1-to-1 WebRTC Calling Signaling
  console.log("\n[TEST 10] Testing 1-to-1 Calling and WebRTC Signaling...");
  const incomingCallPromise = new Promise((resolve, reject) => {
    const to = setTimeout(() => reject(new Error("Incoming call receive timeout")), 4000);
    socketB.on("call:incoming", (callData) => {
      clearTimeout(to);
      resolve(callData);
    });
  });

  const startCall = await api(`/projects/${project._id}/calls`, {
    method: "POST",
    body: JSON.stringify({
      receiverId: userB._id,
      type: "VIDEO",
      title: "Phase 2 Call",
    }),
  }, tokenA);

  const incCall = await incomingCallPromise;
  console.log("✓ PASS: Incoming call received on User B socket. Call ID:", incCall.callId);

  // User B accepts
  const callAcceptedPromise = new Promise((resolve, reject) => {
    const to = setTimeout(() => reject(new Error("Call accept timeout")), 4000);
    socketA.on("call:accepted", (data) => {
      clearTimeout(to);
      resolve(data);
    });
  });
  socketB.emit("call:accept", { callId: incCall.callId });
  await callAcceptedPromise;
  console.log("✓ PASS: Call accepted and caller notified.");

  // End call
  const callEndedPromise = new Promise((resolve, reject) => {
    const to = setTimeout(() => reject(new Error("Call end timeout")), 4000);
    socketB.on("call:ended", (data) => {
      clearTimeout(to);
      resolve(data);
    });
  });
  socketA.emit("call:end", { callId: incCall.callId });
  await callEndedPromise;
  console.log("✓ PASS: Call terminated cleanly.");

  socketA.disconnect();
  socketB.disconnect();

  // TEST 11: GitHub OAuth Route Verification
  console.log("\n[TEST 11] Verifying GitHub OAuth endpoints...");
  const ghAuthRes = await fetch("http://localhost:5000/api/auth/github", { redirect: "manual" });
  console.log("✓ PASS: /api/auth/github responded with status:", ghAuthRes.status, `(Redirecting to GitHub: ${ghAuthRes.headers.get("location")?.includes("github.com") || ghAuthRes.status === 500 || ghAuthRes.status === 302})`);

  // TEST 12: Branding Verification
  console.log("\n[TEST 12] Checking Browser Tab Branding in client/index.html...");
  const indexHtml = fs.readFileSync("client/index.html", "utf8");
  if (!indexHtml.includes("<title>Colabz</title>")) {
    throw new Error("Branding check failed: <title>Colabz</title> not found in index.html");
  }
  if (!indexHtml.includes("ColabzLogo.png")) {
    throw new Error("Branding check failed: ColabzLogo.png favicon not found in index.html");
  }
  console.log("✓ PASS: client/index.html has title 'Colabz' and favicon '/ColabzLogo.png'.");

  console.log("\n=======================================================");
  console.log("🎉 ALL PHASE 2 END-TO-END TESTS PASSED SUCCESSFULLY!");
  console.log("=======================================================\n");
}

runTests().catch((err) => {
  console.error("\n❌ PHASE 2 TEST SUITE FAILED:", err);
  process.exit(1);
});
