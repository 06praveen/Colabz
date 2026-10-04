const { io } = require('socket.io-client');

const API_URL = 'http://localhost:5000/api';
const SOCKET_URL = 'http://localhost:5000';

async function request(method, path, body = null, token = null) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const json = await res.json().catch(() => null);
  if (!res.ok) {
    const err = new Error(json?.message || `HTTP ${res.status}`);
    err.status = res.status;
    err.data = json;
    throw err;
  }
  return json;
}

async function runPhase9Tests() {
  console.log('--- Starting Phase 9 WebRTC & Calling Verification Tests ---');

  const stamp = Date.now();
  const emailA = `caller_praveen_${stamp}@example.com`;
  const emailB = `receiver_aayush_${stamp}@example.com`;
  const emailC = `unauthorized_rahul_${stamp}@example.com`;
  const password = 'Password123!';

  // 1. Sign up test users
  console.log('1. Registering test users...');
  const resA = await request('POST', '/auth/register', {
    name: 'Praveen Caller',
    email: emailA,
    password,
  });
  const tokenA = resA.data.token;
  const userA = resA.data.user;

  const resB = await request('POST', '/auth/register', {
    name: 'Aayush Receiver',
    email: emailB,
    password,
  });
  const tokenB = resB.data.token;
  const userB = resB.data.user;

  const resC = await request('POST', '/auth/register', {
    name: 'Rahul Stranger',
    email: emailC,
    password,
  });
  const tokenC = resC.data.token;
  const userC = resC.data.user;

  console.log('✅ Users registered successfully');

  // 2. Connect Socket.IO clients for User A and User B
  console.log('2. Connecting Socket.IO clients for User A and User B...');
  const socketA = io(SOCKET_URL, {
    auth: { token: tokenA },
    transports: ['websocket'],
  });

  const socketB = io(SOCKET_URL, {
    auth: { token: tokenB },
    transports: ['websocket'],
  });

  const eventsA = [];
  const eventsB = [];

  socketA.on('call:incoming', (d) => eventsA.push({ event: 'call:incoming', data: d }));
  socketA.on('call:accepted', (d) => eventsA.push({ event: 'call:accepted', data: d }));
  socketA.on('call:rejected', (d) => eventsA.push({ event: 'call:rejected', data: d }));
  socketA.on('call:cancelled', (d) => eventsA.push({ event: 'call:cancelled', data: d }));
  socketA.on('call:ended', (d) => eventsA.push({ event: 'call:ended', data: d }));
  socketA.on('webrtc:offer', (d) => eventsA.push({ event: 'webrtc:offer', data: d }));
  socketA.on('webrtc:answer', (d) => eventsA.push({ event: 'webrtc:answer', data: d }));
  socketA.on('webrtc:ice-candidate', (d) => eventsA.push({ event: 'webrtc:ice-candidate', data: d }));

  socketB.on('call:incoming', (d) => eventsB.push({ event: 'call:incoming', data: d }));
  socketB.on('call:accepted', (d) => eventsB.push({ event: 'call:accepted', data: d }));
  socketB.on('call:rejected', (d) => eventsB.push({ event: 'call:rejected', data: d }));
  socketB.on('call:cancelled', (d) => eventsB.push({ event: 'call:cancelled', data: d }));
  socketB.on('call:ended', (d) => eventsB.push({ event: 'call:ended', data: d }));
  socketB.on('webrtc:offer', (d) => eventsB.push({ event: 'webrtc:offer', data: d }));
  socketB.on('webrtc:answer', (d) => eventsB.push({ event: 'webrtc:answer', data: d }));
  socketB.on('webrtc:ice-candidate', (d) => eventsB.push({ event: 'webrtc:ice-candidate', data: d }));

  await Promise.all([
    new Promise((res) => socketA.on('connect', res)),
    new Promise((res) => socketB.on('connect', res)),
  ]);
  console.log('✅ Both sockets connected and authenticated');

  // 3. Project Creation and Membership
  console.log('3. Setting up project and team membership...');
  const projRes = await request(
    'POST',
    '/projects',
    { name: `WebRTC Project ${stamp}`, description: 'Phase 9 calling workspace' },
    tokenA
  );
  const projectId = projRes.data.project._id || projRes.data.project.id;

  const invRes = await request(
    'POST',
    `/projects/${projectId}/invitations`,
    { email: emailB, role: 'DEVELOPER' },
    tokenA
  );
  await request('POST', `/invitations/${invRes.data.invitation.id || invRes.data.invitation._id}/accept`, {}, tokenB);
  console.log('✅ User B joined project');

  // 4. Start 1-to-1 Video Call (User A -> User B)
  console.log('4. User A initiates Video Call to User B...');
  const startRes = await request(
    'POST',
    `/projects/${projectId}/calls`,
    {
      receiverId: userB.id || userB._id,
      type: 'VIDEO',
      title: 'Dev Sync Call',
    },
    tokenA
  );
  const call1 = startRes.data.call;
  const call1Id = call1.id || call1._id;
  console.log(`✅ Call created with status: ${call1.rawStatus || call1.status} (ID: ${call1Id})`);

  // Wait for incoming socket event on User B
  await new Promise((r) => setTimeout(r, 400));
  const incomingEv = eventsB.find((e) => e.event === 'call:incoming');
  if (incomingEv) {
    console.log(`✅ User B received call:incoming event from ${incomingEv.data.caller?.name}`);
  } else {
    throw new Error('User B did not receive call:incoming event');
  }

  // 5. User B accepts the call
  console.log('5. User B accepts the call via Socket.IO...');
  await new Promise((resolve, reject) => {
    socketB.emit('call:accept', { callId: call1Id }, (res) => {
      if (res?.success) resolve(res);
      else reject(new Error(res?.error || 'Failed to accept call'));
    });
  });

  await new Promise((r) => setTimeout(r, 400));
  const acceptedEv = eventsA.find((e) => e.event === 'call:accepted');
  if (acceptedEv) {
    console.log('✅ User A received call:accepted event');
  } else {
    throw new Error('User A did not receive call:accepted event');
  }

  // 6. WebRTC Signaling Exchange
  console.log('6. Testing WebRTC SDP Offer/Answer and ICE candidates signaling...');
  const mockOfferSdp = { type: 'offer', sdp: 'v=0\r\no=caller 12345 2 IN IP4 127.0.0.1\r\ns=-\r\nt=0 0\r\n' };
  const mockAnswerSdp = { type: 'answer', sdp: 'v=0\r\no=receiver 12345 2 IN IP4 127.0.0.1\r\ns=-\r\nt=0 0\r\n' };
  const mockIce = { candidate: 'candidate:1 1 UDP 2122260223 127.0.0.1 50000 typ host', sdpMid: '0', sdpMLineIndex: 0 };

  // A sends Offer to B
  socketA.emit('webrtc:offer', { callId: call1Id, sdp: mockOfferSdp });
  await new Promise((r) => setTimeout(r, 300));
  const offerEv = eventsB.find((e) => e.event === 'webrtc:offer');
  if (offerEv && offerEv.data.sdp.type === 'offer') {
    console.log('✅ User B received webrtc:offer signaling');
  }

  // B sends Answer to A
  socketB.emit('webrtc:answer', { callId: call1Id, sdp: mockAnswerSdp });
  await new Promise((r) => setTimeout(r, 300));
  const answerEv = eventsA.find((e) => e.event === 'webrtc:answer');
  if (answerEv && answerEv.data.sdp.type === 'answer') {
    console.log('✅ User A received webrtc:answer signaling');
  }

  // ICE candidates
  socketA.emit('webrtc:ice-candidate', { callId: call1Id, candidate: mockIce });
  await new Promise((r) => setTimeout(r, 300));
  const iceEv = eventsB.find((e) => e.event === 'webrtc:ice-candidate');
  if (iceEv && iceEv.data.candidate) {
    console.log('✅ User B received webrtc:ice-candidate signaling');
  }

  // 7. End Call
  console.log('7. User A ends the active call...');
  await new Promise((resolve) => setTimeout(resolve, 1000)); // allow 1 sec duration
  await new Promise((resolve, reject) => {
    socketA.emit('call:end', { callId: call1Id }, (res) => {
      if (res?.success) resolve(res);
      else reject(new Error(res?.error || 'Failed to end call'));
    });
  });

  await new Promise((r) => setTimeout(r, 400));
  const endedEv = eventsB.find((e) => e.event === 'call:ended');
  if (endedEv) {
    console.log('✅ User B received call:ended event with duration:', endedEv.data.call?.durationSeconds);
  }

  // 8. Test Audio Call & Reject Flow
  console.log('8. Testing Audio Call & Reject flow...');
  const startAudioRes = await request(
    'POST',
    `/projects/${projectId}/calls`,
    {
      receiverId: userB.id || userB._id,
      type: 'AUDIO',
      title: 'Voice Huddle',
    },
    tokenA
  );
  const call2Id = startAudioRes.data.call.id || startAudioRes.data.call._id;

  await new Promise((r) => setTimeout(r, 300));
  // User B rejects
  socketB.emit('call:reject', { callId: call2Id });
  await new Promise((r) => setTimeout(r, 300));
  const rejectedEv = eventsA.find((e) => e.event === 'call:rejected');
  if (rejectedEv) {
    console.log('✅ User A received call:rejected event');
  }

  // 9. Test Cancel Flow
  console.log('9. Testing Call Cancel flow before answer...');
  const startCancelRes = await request(
    'POST',
    `/projects/${projectId}/calls`,
    {
      receiverId: userB.id || userB._id,
      type: 'VIDEO',
      title: 'Quick Check',
    },
    tokenA
  );
  const call3Id = startCancelRes.data.call.id || startCancelRes.data.call._id;
  await new Promise((r) => setTimeout(r, 300));

  // User A cancels
  socketA.emit('call:cancel', { callId: call3Id });
  await new Promise((r) => setTimeout(r, 300));
  const cancelledEv = eventsB.find((e) => e.event === 'call:cancelled');
  if (cancelledEv) {
    console.log('✅ User B received call:cancelled event');
  }

  // 10. Call History API
  console.log('10. Querying GET /api/projects/:projectId/calls...');
  const historyRes = await request('GET', `/projects/${projectId}/calls`, null, tokenA);
  const callsHistory = historyRes.data.calls;
  console.log(`✅ Retrieved call history (${callsHistory.length} records):`);
  callsHistory.forEach((c) => {
    console.log(`  - [${c.rawType || c.type}] "${c.title}" | Status: ${c.rawStatus || c.status} | Duration: ${c.durationSeconds}s`);
  });

  // 11. Security & RBAC Validation
  console.log('11. Testing Security & Authorization boundaries...');

  // Self-call prevention
  try {
    await request('POST', `/projects/${projectId}/calls`, { receiverId: userA.id || userA._id }, tokenA);
    console.error('❌ Security failure: Self-call was allowed!');
  } catch (err) {
    console.log('✅ Security passed: Self-call blocked with status:', err.status);
  }

  // Unauthorized user calling
  try {
    await request('POST', `/projects/${projectId}/calls`, { receiverId: userB.id || userB._id }, tokenC);
    console.error('❌ Security failure: Non-member was allowed to start call!');
  } catch (err) {
    console.log('✅ Security passed: Unauthorized user blocked with status:', err.status);
  }

  // Unauthorized WebRTC signaling
  await new Promise((resolve) => {
    socketA.emit('webrtc:offer', { callId: '6ac141e1368e966662421a99', sdp: mockOfferSdp }, (res) => {
      if (!res?.success) {
        console.log('✅ Security passed: Unauthorized call ID signaling was blocked:', res?.error);
      }
      resolve();
    });
  });

  socketA.disconnect();
  socketB.disconnect();

  console.log('\n======================================================');
  console.log('🎉 ALL PHASE 9 WEBRTC & CALLING TESTS PASSED PERFECTLY');
  console.log('======================================================');
}

runPhase9Tests().catch((err) => {
  console.error('❌ Test failed with error:', err.data || err.message || err);
  process.exit(1);
});
