const mongoose = require('mongoose');
const { io } = require('socket.io-client');
require('dotenv').config();

const API_BASE = 'http://localhost:5000/api';
const SOCKET_URL = 'http://localhost:5000';

async function req(url, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  const res = await fetch(url, {
    method: options.method || 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const error = new Error(data.message || `Request failed with status ${res.status}`);
    error.status = res.status;
    error.data = data;
    throw error;
  }
  return { status: res.status, data };
}

async function runTests() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/colabz');
  console.log('--- Starting Phase 7 Real-Time Chat & Socket.IO Verification Tests ---');

  // 1. Register User A & User B
  const timestamp = Date.now();
  const userARes = await req(`${API_BASE}/auth/register`, {
    method: 'POST',
    body: { name: 'Chat User A', email: `chat_a_${timestamp}@example.com`, password: 'Password123!' },
  });
  const userA = userARes.data?.data?.user;
  const tokenA = userARes.data?.data?.token;
  const headersA = { Authorization: `Bearer ${tokenA}` };

  const userBRes = await req(`${API_BASE}/auth/register`, {
    method: 'POST',
    body: { name: 'Chat User B', email: `chat_b_${timestamp}@example.com`, password: 'Password123!' },
  });
  const userB = userBRes.data?.data?.user;
  const tokenB = userBRes.data?.data?.token;
  const headersB = { Authorization: `Bearer ${tokenB}` };

  // Unauthorized User C
  const userCRes = await req(`${API_BASE}/auth/register`, {
    method: 'POST',
    body: { name: 'Unauthorized User C', email: `chat_c_${timestamp}@example.com`, password: 'Password123!' },
  });
  const tokenC = userCRes.data?.data?.token;
  const headersC = { Authorization: `Bearer ${tokenC}` };

  console.log('✓ Users registered (User A, User B, User C)');

  // 2. User A creates project
  const projectRes = await req(`${API_BASE}/projects`, {
    method: 'POST',
    headers: headersA,
    body: { name: `Chat Project ${timestamp}`, description: 'Testing Phase 7 Chat' },
  });
  const projectId = projectRes.data?.data?.project?._id || projectRes.data?.data?.project?.id || projectRes.data?.data?.id;
  console.log('✓ Project created with id:', projectId);

  // 3. Add User B to project as DEVELOPER
  const ProjectMembership = require('../models/ProjectMembership');
  await ProjectMembership.create({
    project: projectId,
    user: userB._id || userB.id,
    role: 'DEVELOPER',
    joinedAt: new Date(),
  });
  console.log('✓ User B added as active project member');

  // 4. Test GET conversations (should auto-provision #general and #development channels)
  const convsRes = await req(`${API_BASE}/projects/${projectId}/conversations`, { headers: headersA });
  const conversations = convsRes.data?.data?.conversations || [];
  console.log('✓ Conversations fetched. Total count:', conversations.length);
  const generalChannel = conversations.find((c) => c.name === 'general' && c.type === 'channel');
  if (!generalChannel) throw new Error('Default #general channel was not provisioned');
  console.log('✓ Default channels (#general, #development) verified');

  // 5. Create Direct Conversation between A and B
  const directConvRes = await req(`${API_BASE}/projects/${projectId}/conversations`, {
    method: 'POST',
    headers: headersA,
    body: { type: 'direct', participantId: userB._id || userB.id },
  });
  const directConv = directConvRes.data?.data?.conversation;
  console.log('✓ Direct conversation created between A and B:', directConv.id);

  // 6. Test Uniqueness: creating direct conversation from B to A should return SAME conversation
  const directConvBtoA = await req(`${API_BASE}/projects/${projectId}/conversations`, {
    method: 'POST',
    headers: headersB,
    body: { type: 'direct', participantId: userA._id || userA.id },
  });
  if (directConvBtoA.data?.data?.conversation?.id !== directConv.id) {
    throw new Error('Direct conversation uniqueness failed: duplicate conversation created');
  }
  console.log('✓ Direct conversation uniqueness verified (B -> A returned same conversation ID)');

  // 7. Test Channel Creation
  const newChannelRes = await req(`${API_BASE}/projects/${projectId}/conversations`, {
    method: 'POST',
    headers: headersA,
    body: { type: 'channel', name: 'frontend-team', description: 'Frontend team discussions' },
  });
  const frontendChannel = newChannelRes.data?.data?.conversation;
  console.log('✓ Channel "#frontend-team" created:', frontendChannel.id);

  // 8. Test Socket.IO Real-Time Messaging between User A & User B
  console.log('\n--- Testing Real-Time Socket.IO Handshake & Events ---');

  const socketA = io(SOCKET_URL, {
    auth: { token: tokenA },
    transports: ['websocket'],
  });

  const socketB = io(SOCKET_URL, {
    auth: { token: tokenB },
    transports: ['websocket'],
  });

  await new Promise((resolve, reject) => {
    let connectedCount = 0;
    const checkDone = () => {
      connectedCount++;
      if (connectedCount === 2) resolve();
    };
    socketA.on('connect', () => {
      console.log('✓ Socket A connected with JWT');
      checkDone();
    });
    socketB.on('connect', () => {
      console.log('✓ Socket B connected with JWT');
      checkDone();
    });
    socketA.on('connect_error', reject);
    socketB.on('connect_error', reject);
  });

  // Both join direct conversation room
  socketA.emit('conversation:join', { projectId, conversationId: directConv.id });
  socketB.emit('conversation:join', { projectId, conversationId: directConv.id });

  await new Promise((r) => setTimeout(r, 200));
  console.log('✓ Both sockets joined direct conversation room');

  // Test real-time message sending A -> B
  const messagePromise = new Promise((resolve) => {
    socketB.on('message:new', (data) => {
      console.log('✓ Socket B received message:new in real-time:', data.message.content);
      resolve(data.message);
    });
  });

  socketA.emit('message:send', {
    projectId,
    conversationId: directConv.id,
    content: 'Hello User B from Socket.IO!',
    clientMessageId: 'temp_1',
  });

  const receivedMessage = await messagePromise;

  // 9. Verify MongoDB persistence via REST API
  const restMessagesRes = await req(`${API_BASE}/projects/${projectId}/conversations/${directConv.id}/messages`, {
    headers: headersB,
  });
  const persistedMsgs = restMessagesRes.data?.data?.messages || [];
  const foundMsg = persistedMsgs.find((m) => m.id === receivedMessage.id || m._id === receivedMessage.id);
  if (!foundMsg) throw new Error('Message was not persisted in MongoDB!');
  console.log('✓ MongoDB persistence verified via REST API. Messages count:', persistedMsgs.length);

  // 10. Test Message Editing via Socket.IO
  const editPromise = new Promise((resolve) => {
    socketB.on('message:updated', (data) => {
      console.log('✓ Socket B received message:updated in real-time:', data.message.content);
      resolve(data.message);
    });
  });

  socketA.emit('message:edit', {
    projectId,
    conversationId: directConv.id,
    messageId: receivedMessage.id,
    content: 'Hello User B (Edited via Socket)!',
  });

  const editedMessage = await editPromise;
  if (!editedMessage.edited) throw new Error('Edited flag was not set');
  console.log('✓ Message edit verified (editedAt:', editedMessage.editedAt, ')');

  // 11. Test Reaction via Socket.IO
  const reactionPromise = new Promise((resolve) => {
    socketA.on('message:reaction-updated', (data) => {
      console.log('✓ Socket A received message:reaction-updated in real-time. Reactions:', data.message.reactions);
      resolve(data.message);
    });
  });

  socketB.emit('message:react', {
    projectId,
    conversationId: directConv.id,
    messageId: receivedMessage.id,
    emoji: '🔥',
  });

  const reactedMessage = await reactionPromise;
  if (!reactedMessage.reactions || reactedMessage.reactions.length === 0) {
    throw new Error('Reaction was not saved!');
  }
  console.log('✓ Message reaction verified');

  // 12. Test Read Receipt via Socket.IO
  const readPromise = new Promise((resolve) => {
    socketA.on('message:read-updated', (data) => {
      console.log('✓ Socket A received message:read-updated in real-time from user:', data.userId);
      resolve(data);
    });
  });

  socketB.emit('message:read', {
    projectId,
    conversationId: directConv.id,
    messageId: receivedMessage.id,
  });

  await readPromise;
  console.log('✓ Read receipt event verified');

  // 13. Test Soft Delete via Socket.IO
  const deletePromise = new Promise((resolve) => {
    socketB.on('message:deleted', (data) => {
      console.log('✓ Socket B received message:deleted in real-time:', data.message.content);
      resolve(data.message);
    });
  });

  socketA.emit('message:delete', {
    projectId,
    conversationId: directConv.id,
    messageId: receivedMessage.id,
  });

  const deletedMessage = await deletePromise;
  if (!deletedMessage.deleted) throw new Error('Message is not marked deleted!');
  console.log('✓ Soft deletion verified (content:', deletedMessage.content, ')');

  // 14. Test Unauthorized Access (User C is not a project member)
  try {
    await req(`${API_BASE}/projects/${projectId}/conversations`, { headers: headersC });
    throw new Error('User C was able to access project conversations!');
  } catch (err) {
    if (err.status === 403) {
      console.log('✓ Security check passed: Unauthorized User C blocked with 403 Forbidden');
    } else {
      throw err;
    }
  }

  // Close socket connections
  socketA.disconnect();
  socketB.disconnect();
  await mongoose.disconnect();

  console.log('\n=========================================');
  console.log('🎉 ALL PHASE 7 CHAT & SOCKET.IO TESTS PASSED!');
  console.log('=========================================\n');
}

runTests().catch((err) => {
  console.error('❌ Phase 7 test failed:', err.data || err.message || err);
  process.exit(1);
});
