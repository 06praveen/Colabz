# COLABZ BACKEND LEARNING GUIDE — PHASE 7

## Real-Time Chat, Socket.IO, JWT Handshake & Persistent Messaging

Welcome to Phase 7 of the Colabz developer workspace. In this phase, we implemented a full real-time communication system combining **Socket.IO WebSockets** with **MongoDB database persistence** and **JWT authentication**.

This document covers the architectural concepts, message lifecycle, room design, security validation, interview questions, and hands-on exercises in clear, beginner-friendly terms.

---

## 1. What is Socket.IO?

**Socket.IO** is an event-driven JavaScript library that enables low-latency, bidirectional, real-time communication between web clients (browsers) and Node.js servers.

Under the hood, Socket.IO uses standard **WebSockets** whenever supported, with automatic fallback to HTTP long-polling if the client is behind restrictive firewalls or proxies. It adds powerful features on top of plain WebSockets:
- Automatic reconnection management
- Room-based multi-casting (`socket.join`, `io.to(room).emit`)
- Message acknowledgments / callbacks
- Packet buffering during temporary disconnects

---

## 2. WebSocket vs HTTP

| Feature | Standard HTTP (REST) | WebSocket / Socket.IO |
| :--- | :--- | :--- |
| **Connection Model** | Request-Response: Client initiates, server responds, connection closes | Persistent full-duplex TCP connection remains open |
| **Communication** | One-way at a time (Half-duplex) | Both client and server can send data anytime (Full-duplex) |
| **Overhead** | Heavy HTTP headers sent with every single request | Minimal frame overhead (2-8 bytes per message) |
| **Latency** | 100ms - 1000ms+ (polling) | 5ms - 50ms (instant real-time push) |
| **Best Used For** | Initial page load, CRUD records, file uploads, paginated lists | Instant messaging, typing indicators, live cursor syncing |

```text
HTTP Request / Response:
Client  ────────────────► Server (Request)
Client  ◄──────────────── Server (Response & Close)

Socket.IO Real-Time Stream:
Client  ═════════════════ Server (Open Persistent TCP Connection)
Client  ───(Message)────► Server
Client  ◄──(New Alert)─── Server
Client  ◄──(Chat Push)─── Server
```

---

## 3. Why Colabz Uses Both REST and Socket.IO

Colabz combines the strengths of both protocols:

1. **REST APIs:**
   - Perfect for **fetching initial data** (e.g. loading the conversation list, retrieving message history with pagination).
   - Serves as a reliable **fallback** if WebSockets fail or during offline sync.
2. **Socket.IO:**
   - Handles **instant real-time events** (e.g. delivering messages to other active users, live edits, soft deletes, reactions, and read receipts without refreshing the page).

---

## 4. Socket.IO Authentication via JWT Handshake

Sockets cannot rely on traditional per-request HTTP middleware. Instead, authentication happens during the initial **connection handshake**:

```javascript
// Client: Passes token in auth object during handshake
const socket = io("http://localhost:5000", {
  auth: {
    token: localStorage.getItem("colabz_token")
  }
});

// Server: Socket.IO middleware intercepts before connection is accepted
io.use(async (socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error("Authentication error: Token required"));

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select("name email avatar");
    if (!user) return next(new Error("User not found"));

    socket.user = { id: user._id.toString(), _id: user._id, name: user.name };
    next();
  } catch (err) {
    next(new Error("Invalid token"));
  }
});
```

> **Security Rule:** Never trust a `senderId` passed in socket payloads from the client. The server *always* derives the sender identity from `socket.user.id`.

---

## 5. Socket Rooms and Namespaces

Socket.IO provides **Rooms** — arbitrary channels that sockets can join and leave:

```text
Room: "conversation:64a1f..."
   ├── User A (Socket ID: x7k...)
   └── User B (Socket ID: m2p...)
```

- When User A and User B open a conversation, both join room `conversation:<conversationId>`.
- When User A sends a message, the server broadcasts exclusively to that room:
  ```javascript
  io.to(`conversation:${conversationId}`).emit("message:new", { message: savedMessage });
  ```
- Other project members who are not in that conversation room do **not** receive the private message traffic.

---

## 6. Event-Based Communication in Colabz

Colabz uses semantic namespaced events:

| Event | Direction | Purpose |
| :--- | :---: | :--- |
| `conversation:join` | Client ➔ Server | Join a conversation room |
| `conversation:leave` | Client ➔ Server | Leave a conversation room |
| `message:send` | Client ➔ Server | Send a new message |
| `message:new` | Server ➔ Room | Broadcast newly saved message to all participants |
| `message:edit` | Client ➔ Server | Edit an existing message |
| `message:updated` | Server ➔ Room | Broadcast updated message content to all participants |
| `message:delete` | Client ➔ Server | Delete an existing message |
| `message:deleted` | Server ➔ Room | Broadcast soft-delete status to all participants |
| `message:read` | Client ➔ Server | Mark a message as read |
| `message:read-updated` | Server ➔ Room | Broadcast read receipt update |
| `message:react` | Client ➔ Server | Add/remove emoji reaction |
| `message:reaction-updated` | Server ➔ Room | Broadcast updated reaction counts |
| `chat:error` | Server ➔ Client | Emit permission or validation error to the sender |

---

## 7. MongoDB Message Persistence

Why not just send messages purely through WebSockets in memory?
- If the recipient is offline or in another tab, in-memory messages would be lost forever.
- When any user refreshes or switches projects, history would disappear.

**The Golden Rule of Real-Time Chat:**
> **Persist first, then broadcast.** The server writes the message to MongoDB and confirms successful write before emitting `message:new` to other sockets.

---

## 8. Conversation and Direct Messaging Architecture

Colabz supports two types of conversations:
1. **Channels (`type: "channel"`):** Public team spaces (e.g. `#general`, `#development`, `#frontend-team`) accessible by all project members.
2. **Direct Messages (`type: "direct"`):** 1-on-1 private conversations between two project members.

### Deterministic Participant Key for Direct Messages:
To prevent duplicate 1-on-1 conversations, Colabz generates a sorted key:
```javascript
const participantKey = [userA._id.toString(), userB._id.toString()].sort().join("_");
```
Whether User A opens User B or User B opens User A, the key is identical: `user1_user2`. A unique compound index on `{ project: 1, participantKey: 1 }` guarantees that exactly one conversation exists.

---

## 9. Message Lifecycle Flow

```text
1. User A types "Hello" and presses Enter
       │
       ▼
2. Client emits `message:send` via Socket.IO
       │ (Payload: { projectId, conversationId, content })
       ▼
3. Server intercepts `message:send`
       │ ➔ Checks socket.user authentication
       │ ➔ Verifies project membership
       │ ➔ Verifies conversation access
       │ ➔ Validates message length & content
       ▼
4. Server saves Message to MongoDB
       │ ➔ Updates Conversation.lastMessage & lastMessageAt
       ▼
5. Server emits `message:new` to room `conversation:${conversationId}`
       │
       ▼
6. User A & User B receive `message:new`
       │ ➔ Appended to React state
       │ ➔ UI updates instantly
```

---

## 10. Read Receipts (`readBy` Array)

Each `Message` document contains a `readBy` array storing ObjectIds of users who have viewed the message:
```javascript
readBy: [ObjectId("usr_1"), ObjectId("usr_2")]
```
- When a user views a conversation, unread messages add their ID to `readBy`.
- Unread counts are computed efficiently:
  ```javascript
  const unreadCount = await Message.countDocuments({
    conversation: convId,
    sender: { $ne: currentUserId },
    readBy: { $ne: currentUserId },
    deleted: false,
  });
  ```

---

## 11. Soft Deletion

In team collaboration tools, hard-deleting database records breaks reply threads, references, and audit logs. Colabz implements **Soft Deletion**:

- When a message is deleted:
  ```javascript
  message.deleted = true;
  message.deletedAt = new Date();
  message.content = "This message was deleted";
  ```
- The message document remains in MongoDB with `deleted: true`.
- The frontend renders `"This message was deleted"` with muted styling.

---

## 12. Socket Reconnection & Preventing Duplicate Listeners

In React, improper `useEffect` cleanup can register duplicate socket event listeners every time a component re-renders:

```javascript
// ❌ WRONG: Attaches a new listener on every render without cleanup!
useEffect(() => {
  socket.on("message:new", handleNewMessage);
});

// ✅ CORRECT: Cleans up listeners when unmounting or changing conversations
useEffect(() => {
  const socket = getSocket();
  socket.on("message:new", handleNewMessage);

  return () => {
    socket.off("message:new", handleNewMessage);
  };
}, [activeConversationId]);
```

---

## 13. Complete End-to-End Architecture

```text
React Chat UI (MessageList, ChatSidebar, MessageComposer)
       │
       ├── Initial Load ──► Axios ──► Express REST ──► MongoDB
       │
       └── Live Stream  ──► Socket.IO ──► Node Server ──► MongoDB (Write)
                                                │
                                                └──► Socket.IO Broadcast ──► Teammate UI
```

---

## 14. 20 Interview & Viva Questions with Answers

### 1. What is WebSocket?
**Answer:** WebSocket is a standard transport protocol (RFC 6455) providing persistent, low-latency, full-duplex communication channels over a single TCP connection.

### 2. What is Socket.IO?
**Answer:** Socket.IO is a JavaScript library built on top of WebSockets that provides event-based messaging, automatic reconnection, room multiplexing, and HTTP long-polling fallback.

### 3. What is the difference between raw WebSockets and Socket.IO?
**Answer:** WebSockets is a low-level protocol. Socket.IO is a feature-rich library adding room management, broadcast utilities, automatic heartbeats, and reconnection handling.

### 4. Why does a chat application need both REST and WebSockets?
**Answer:** REST is optimal for stateless operations like fetching paginated history or initial state on page load. WebSockets provide sub-50ms push delivery for live messages without polling.

### 5. What is a Socket.IO Room?
**Answer:** A Room is a server-side grouping mechanism allowing developers to broadcast events to a specific subset of connected sockets (e.g. `conversation:123`).

### 6. How do you authenticate Socket.IO connections?
**Answer:** By passing a JWT in the client connection handshake (`auth: { token }`) and verifying it with Socket.IO server middleware (`io.use()`) before allowing the connection.

### 7. Why should the server ignore `senderId` sent in socket payloads?
**Answer:** A malicious user could tamper with the client payload to impersonate other users. The server must derive identity exclusively from the verified JWT in `socket.user`.

### 8. What is full-duplex communication?
**Answer:** A communication channel where both the client and server can send and receive data simultaneously at any time without waiting for a request.

### 9. Why save messages in MongoDB before broadcasting?
**Answer:** To ensure atomicity and persistence. If the database write fails, broadcasting would create ghost messages that disappear on page refresh.

### 10. How does Colabz prevent duplicate direct conversations?
**Answer:** By generating a sorted `participantKey` (`userA_userB`) and applying a compound unique index on `{ project: 1, participantKey: 1 }`.

### 11. What is soft deletion in chat systems?
**Answer:** Marking a message as `deleted: true` and replacing its text with `"This message was deleted"` while preserving the document ID to maintain thread consistency.

### 12. How are unread message counts calculated?
**Answer:** By counting messages in a conversation where `sender !== currentUserId`, `currentUserId` is not in `readBy`, and `deleted !== true`.

### 13. What happens when a Socket.IO client disconnects?
**Answer:** The server removes the socket from its joined rooms and frees socket memory. The client automatically attempts periodic reconnection until the connection is restored.

### 14. What causes duplicate messages on the frontend?
**Answer:** Failing to clean up socket event listeners in React `useEffect` hooks, causing the same event callback to execute multiple times per broadcast.

### 15. What is optimistic UI in chat?
**Answer:** Displaying the user's message in the UI immediately upon pressing Send with a temporary ID, then updating it with the permanent ID once the server acknowledges.

### 16. What is the purpose of the `readBy` array?
**Answer:** It tracks which participants have viewed a specific message, powering read indicators and accurate unread badges.

### 17. How does Socket.IO handle server crashes?
**Answer:** Clients detect heartbeat timeouts and automatically attempt reconnection using exponential backoff.

### 18. What is the difference between `socket.emit`, `socket.broadcast.emit`, and `io.to().emit`?
**Answer:**
- `socket.emit`: Sends only to the sending client.
- `socket.broadcast.emit`: Sends to all connected clients *except* the sender.
- `io.to(room).emit`: Sends to all sockets in a specific room (including sender).

### 19. How do you secure conversation rooms against unauthorized snooping?
**Answer:** By checking that the authenticated socket user is an active project member and participant before allowing them to join the room (`socket.join`).

### 20. What is message pagination?
**Answer:** Loading messages in chunks (e.g. 50 at a time) using database queries with `skip` and `limit` to prevent memory overload when conversations contain thousands of messages.

---

## 15. Practical Exercises

### Exercise 1: Send a Message via REST
Send a `POST` request to `/api/projects/<projectId>/conversations/<convId>/messages`:
```json
{
  "content": "Hello team, testing REST endpoint!"
}
```

### Exercise 2: Connect via Socket.IO Client
Write a quick script to connect to `http://localhost:5000` using your JWT token in `auth: { token }`.

### Exercise 3: Join Room and Listen for Events
Emit `conversation:join` with `{ conversationId }` and listen for `message:new`.

### Exercise 4: Test Soft Deletion
Delete a message and verify that the response returns `deleted: true` and `content: "This message was deleted"`.

### Exercise 5: Test Cross-Project Isolation
Attempt to join a conversation belonging to a project you are not a member of, and verify you receive a `chat:error` event with code `FORBIDDEN`.

### Exercise 6: Verify Duplicate Listener Cleanup
Switch between two conversations 5 times in the UI, send one message, and verify in the console that `message:new` fired exactly once.
