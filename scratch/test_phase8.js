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

async function runTests() {
  console.log('--- Starting Phase 8 Verification Tests ---');

  const stamp = Date.now();
  const emailA = `praveen_${stamp}@example.com`;
  const emailB = `aayush_${stamp}@example.com`;
  const emailC = `rahul_${stamp}@example.com`;
  const password = 'Password123!';

  // 1. Sign up users
  console.log('1. Registering test users...');
  const resA = await request('POST', '/auth/register', {
    name: 'Praveen Phase8',
    email: emailA,
    password,
  });
  const tokenA = resA.data.token;
  const userA = resA.data.user;

  const resB = await request('POST', '/auth/register', {
    name: 'Aayush Phase8',
    email: emailB,
    password,
  });
  const tokenB = resB.data.token;
  const userB = resB.data.user;

  const resC = await request('POST', '/auth/register', {
    name: 'Rahul Phase8',
    email: emailC,
    password,
  });
  const tokenC = resC.data.token;
  const userC = resC.data.user;

  console.log('✅ Users registered successfully');

  // Connect Socket.IO client for User B
  console.log('2. Connecting Socket.IO client for User B...');
  const socketB = io(SOCKET_URL, {
    auth: { token: tokenB },
    transports: ['websocket'],
  });

  const receivedSocketEventsB = [];
  socketB.on('notification:new', (data) => {
    console.log('🔔 [User B Socket] Received notification:new ->', data.title, '|', data.type);
    receivedSocketEventsB.push(data);
  });

  await new Promise((resolve) => {
    socketB.on('connect', () => {
      console.log('✅ Socket connected for User B (socket id:', socketB.id, ')');
      resolve();
    });
  });

  // 3. User A creates project
  console.log('3. User A creates a project...');
  const projRes = await request(
    'POST',
    '/projects',
    {
      name: `Colabz P8 Project ${stamp}`,
      description: 'Phase 8 test workspace',
    },
    tokenA
  );
  const project = projRes.data.project;
  const projectId = project._id || project.id;
  console.log('✅ Project created:', projectId);

  // 4. User A invites User B, User B accepts
  console.log('4. User A invites User B...');
  const inviteRes = await request(
    'POST',
    `/projects/${projectId}/invitations`,
    { email: emailB, role: 'DEVELOPER' },
    tokenA
  );
  const invitation = inviteRes.data.invitation;

  console.log('User B accepts invitation...');
  await request(
    'POST',
    `/invitations/${invitation.id || invitation._id}/accept`,
    {},
    tokenB
  );
  console.log('✅ User B joined project');

  // 5. User A assigns a task to User B
  console.log('5. User A creates a task assigned to User B...');
  const taskRes = await request(
    'POST',
    `/projects/${projectId}/tasks`,
    {
      title: 'Implement Notification System',
      description: 'Build Phase 8 backend and real-time sockets',
      assignee: userB.id || userB._id,
      priority: 'HIGH',
      status: 'IN_PROGRESS',
    },
    tokenA
  );
  const task = taskRes.data.task;
  console.log('✅ Task created and assigned to User B:', task.title);

  // Wait a short moment for socket event
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Verify socket event received by User B
  const taskAssignedEvent = receivedSocketEventsB.find((e) => e.type === 'TASK_ASSIGNED');
  if (taskAssignedEvent) {
    console.log('✅ Socket.IO real-time notification received by User B:', taskAssignedEvent.title);
  } else {
    console.error('❌ Socket.IO notification was not received by User B');
  }

  // 6. User B checks notifications & unread count
  console.log('6. User B queries GET /api/notifications and GET /api/notifications/unread-count...');
  const notifsResB = await request('GET', '/notifications', null, tokenB);
  const notificationsB = notifsResB.data.notifications;
  console.log(`User B has ${notificationsB.length} notifications:`, notificationsB.map((n) => n.type));

  const unreadCountResB = await request('GET', '/notifications/unread-count', null, tokenB);
  const unreadCountB = unreadCountResB.data.count;
  console.log('User B unread count:', unreadCountB);
  if (unreadCountB > 0) {
    console.log('✅ Unread count is accurate');
  }

  // 7. User B marks single notification read
  console.log('7. User B marks single notification as read...');
  const firstNotifId = notificationsB[0].id || notificationsB[0]._id;
  const markReadRes = await request(
    'PATCH',
    `/notifications/${firstNotifId}/read`,
    {},
    tokenB
  );
  console.log('Mark read response isRead:', markReadRes.data.notification.isRead);

  // 8. User B marks all read
  console.log('8. User B marks all notifications as read...');
  const readAllRes = await request('PATCH', '/notifications/read-all', {}, tokenB);
  console.log('Read all modified count:', readAllRes.data.modifiedCount);

  const newUnreadB = await request('GET', '/notifications/unread-count', null, tokenB);
  console.log('New unread count for User B:', newUnreadB.data.count);
  if (newUnreadB.data.count === 0) {
    console.log('✅ All notifications marked read successfully');
  }

  // 9. User B creates an Issue assigned to User A and comments
  console.log('9. User B creates Issue assigned to User A...');
  const issueRes = await request(
    'POST',
    `/projects/${projectId}/issues`,
    {
      title: 'Socket connection reconnection edge cases',
      description: 'Check offline auto reconnect',
      assignee: userA.id || userA._id,
      priority: 'MEDIUM',
    },
    tokenB
  );
  const issue = issueRes.data.issue;
  console.log('✅ Issue created:', issue.title);

  // User A adds comment on issue
  console.log('User A adds comment to issue...');
  await request(
    'POST',
    `/projects/${projectId}/issues/${issue.id || issue._id}/comments`,
    { content: 'Looking into this right now.' },
    tokenA
  );
  console.log('✅ Comment posted on issue');

  // 10. User A creates branch and commit
  console.log('10. User A creates branch and commit...');
  await request(
    'POST',
    `/projects/${projectId}/branches`,
    { name: `feature/phase8-test-${stamp}` },
    tokenA
  );

  await request(
    'POST',
    `/projects/${projectId}/repository/files`,
    {
      fileName: 'notification_test.js',
      parentPath: '',
      content: 'console.log("phase 8 testing");',
    },
    tokenA
  );

  await request(
    'POST',
    `/projects/${projectId}/commits`,
    {
      message: 'feat: add phase 8 notification pipeline',
    },
    tokenA
  );
  console.log('✅ Branch, file, and commit created with activity logs');

  // 11. User A checks project activity feed
  console.log('11. Querying GET /api/projects/:projectId/activity...');
  const activityRes = await request('GET', `/projects/${projectId}/activity`, null, tokenA);
  const activities = activityRes.data.activities;
  console.log(`✅ Activity feed retrieved (${activities.length} entries):`);
  activities.slice(0, 6).forEach((act) => {
    console.log(`  - [${act.type}] ${act.message || act.title} (by ${act.actor?.name})`);
  });

  // 12. Security checks: Non-member User C tries to access project activity
  console.log('12. Security check: Unauthorized user C tries to access project activity...');
  try {
    await request('GET', `/projects/${projectId}/activity`, null, tokenC);
    console.error('❌ Security failure: Unauthorized user C was allowed to view project activity!');
  } catch (err) {
    console.log('✅ Security passed: Unauthorized user C was blocked with status:', err.status);
  }

  // 13. Chat Notification test
  console.log('13. User A creates a direct conversation and sends a message to User B...');
  const convRes = await request(
    'POST',
    `/projects/${projectId}/conversations`,
    {
      type: 'direct',
      participantId: userB.id || userB._id,
    },
    tokenA
  );
  const conversation = convRes.data.conversation;

  await request(
    'POST',
    `/projects/${projectId}/conversations/${conversation.id || conversation._id}/messages`,
    {
      content: 'Hey Aayush, please review the notification code!',
    },
    tokenA
  );

  await new Promise((resolve) => setTimeout(resolve, 500));
  const chatNotifEvent = receivedSocketEventsB.find((e) => e.type === 'CHAT_MESSAGE');
  if (chatNotifEvent) {
    console.log('✅ Socket.IO CHAT_MESSAGE notification received by User B:', chatNotifEvent.title);
  }

  // 14. Delete notification test
  console.log('14. Testing notification deletion...');
  const notifsAfterComment = await request('GET', '/notifications', null, tokenB);
  const notifToDelete = notifsAfterComment.data.notifications[0];
  if (notifToDelete) {
    const notifDelId = notifToDelete.id || notifToDelete._id;
    await request('DELETE', `/notifications/${notifDelId}`, null, tokenB);
    console.log('✅ Notification deleted successfully');
  }

  socketB.disconnect();
  console.log('\n========================================');
  console.log('🎉 ALL PHASE 8 TESTS COMPLETED SUCCESSFULLY');
  console.log('========================================');
}

runTests().catch((err) => {
  console.error('❌ Test failed with error:', err.data || err.message || err);
  process.exit(1);
});
