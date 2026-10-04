# COLABZ BACKEND API & SOCKET SPECIFICATION — PHASE 7

## Real-Time Chat, Conversations, Messages & Socket.IO Events

This document provides the complete API and Socket.IO specification for **Phase 7** of the Colabz developer workspace.

---

## REST API Specification

### Base URL
```text
http://localhost:5000/api
```

### Authentication
All REST requests must include the JWT token:
```text
Authorization: Bearer <jwt_token>
```

---

### 1. Get Conversations
Retrieves all channels and direct conversations accessible to the authenticated user in the specified project. Automatically provisions `#general` and `#development` channels if none exist.

- **Method:** `GET`
- **URL:** `/api/projects/:projectId/conversations`
- **Required Role:** Any active project member
- **Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Success",
  "data": {
    "count": 2,
    "conversations": [
      {
        "id": "64a1f...",
        "projectId": "64a0e...",
        "name": "general",
        "type": "channel",
        "description": "General project announcements and coordination.",
        "recipientId": null,
        "unreadCount": 0,
        "lastMessage": "Welcome to the project team workspace!",
        "lastTime": "Just now",
        "memberIds": []
      },
      {
        "id": "64a2g...",
        "projectId": "64a0e...",
        "name": "Rahul Sharma",
        "type": "direct",
        "description": "Direct conversation",
        "recipientId": "64a3h...",
        "unreadCount": 1,
        "lastMessage": "See you in the review meeting.",
        "lastTime": "10:45 AM",
        "memberIds": ["64a1a...", "64a3h..."]
      }
    ]
  }
}
```

---

### 2. Create / Retrieve Conversation
Creates a new channel or establishes a 1-on-1 direct conversation with a project member. If a direct conversation already exists between the two users, returns the existing record.

- **Method:** `POST`
- **URL:** `/api/projects/:projectId/conversations`
- **Required Role:** Any active project member

#### Request Body for Direct Message:
```json
{
  "type": "direct",
  "participantId": "64a3h..."
}
```

#### Request Body for Channel:
```json
{
  "type": "channel",
  "name": "frontend-team",
  "description": "Discussion regarding UI and components"
}
```

- **Success Response (201 Created):**
```json
{
  "success": true,
  "message": "Conversation created successfully",
  "data": {
    "conversation": {
      "id": "64a4i...",
      "projectId": "64a0e...",
      "name": "frontend-team",
      "type": "channel",
      "description": "Discussion regarding UI and components",
      "unreadCount": 0,
      "lastMessage": "Channel created",
      "lastTime": "Just now"
    }
  }
}
```

---

### 3. Get Messages
Retrieves messages for a conversation in chronological order (oldest to newest for the requested page). Marks unread messages as read by the current user.

- **Method:** `GET`
- **URL:** `/api/projects/:projectId/conversations/:conversationId/messages`
- **Required Role:** Any active project member with conversation access
- **Query Parameters:**
  - `page` *(optional, default 1)*: Page number
  - `limit` *(optional, default 50)*: Number of messages per page
- **Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Success",
  "data": {
    "messages": [
      {
        "id": "64a5j...",
        "conversationId": "64a1f...",
        "senderId": "64a1a...",
        "sender": {
          "id": "64a1a...",
          "name": "Praveen Tiwari",
          "email": "praveen@colabz.io",
          "avatar": null
        },
        "content": "Hello team, let's sync up on Phase 7 implementation.",
        "messageType": "TEXT",
        "replyTo": null,
        "reactions": [
          { "emoji": "👍", "count": 2, "users": ["64a2b...", "64a3c..."] }
        ],
        "edited": false,
        "editedAt": null,
        "deleted": false,
        "readBy": ["64a1a...", "64a2b..."],
        "attachments": [],
        "createdAt": "10:30 AM",
        "timestamp": "2026-10-03T10:30:00.000Z"
      }
    ],
    "page": 1,
    "limit": 50,
    "totalCount": 1,
    "hasMore": false
  }
}
```

---

### 4. Send Message (REST Fallback)
- **Method:** `POST`
- **URL:** `/api/projects/:projectId/conversations/:conversationId/messages`
- **Required Role:** Any active project member with conversation access
- **Request Body:**
```json
{
  "content": "Message content here",
  "replyTo": "64a5j..."
}
```
- **Success Response (201 Created):**
```json
{
  "success": true,
  "message": "Message sent successfully",
  "data": {
    "message": {
      "id": "64a6k...",
      "conversationId": "64a1f...",
      "senderId": "64a1a...",
      "content": "Message content here",
      "replyTo": "64a5j...",
      "createdAt": "10:35 AM"
    }
  }
}
```

---

### 5. Edit Message
- **Method:** `PATCH`
- **URL:** `/api/projects/:projectId/conversations/:conversationId/messages/:messageId`
- **Required Role:** Message author only
- **Request Body:**
```json
{
  "content": "Updated message text"
}
```
- **Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Message updated successfully",
  "data": {
    "message": {
      "id": "64a6k...",
      "content": "Updated message text",
      "edited": true,
      "editedAt": "Edited"
    }
  }
}
```

---

### 6. Delete Message (Soft Delete)
- **Method:** `DELETE`
- **URL:** `/api/projects/:projectId/conversations/:conversationId/messages/:messageId`
- **Required Role:** Message author OR Project Owner / Admin
- **Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Message deleted successfully",
  "data": {
    "message": {
      "id": "64a6k...",
      "deleted": true,
      "content": "This message was deleted"
    }
  }
}
```

---

### 7. Mark Conversation as Read
- **Method:** `POST`
- **URL:** `/api/projects/:projectId/conversations/:conversationId/read`
- **Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Conversation marked as read",
  "data": null
}
```

---

## Socket.IO Real-Time Events Specification

### Connection & Authentication
Clients must authenticate upon connection:
```javascript
const socket = io("http://localhost:5000", {
  auth: { token: "<jwt_token>" }
});
```

---

### 1. `conversation:join`
Joins the Socket.IO room for a specific conversation.

- **Direction:** Client ➔ Server
- **Payload:**
```json
{
  "projectId": "64a0e...",
  "conversationId": "64a1f..."
}
```
- **Acknowledgment / Response:** `{ "success": true, "room": "conversation:64a1f..." }`
- **Server Broadcast:** None

---

### 2. `conversation:leave`
Leaves the conversation room.

- **Direction:** Client ➔ Server
- **Payload:**
```json
{
  "conversationId": "64a1f..."
}
```

---

### 3. `message:send`
Sends a message in real-time, persists it to MongoDB, and broadcasts it to all participants in the conversation room.

- **Direction:** Client ➔ Server
- **Payload:**
```json
{
  "projectId": "64a0e...",
  "conversationId": "64a1f...",
  "content": "Hello team!",
  "replyTo": null,
  "clientMessageId": "temp_msg_123"
}
```
- **Server Broadcast Event (`message:new`):** Emitted to `conversation:<conversationId>`
```json
{
  "conversationId": "64a1f...",
  "clientMessageId": "temp_msg_123",
  "message": {
    "id": "64a7l...",
    "conversationId": "64a1f...",
    "senderId": "64a1a...",
    "sender": { "id": "64a1a...", "name": "Praveen Tiwari" },
    "content": "Hello team!",
    "createdAt": "10:40 AM"
  }
}
```

---

### 4. `message:edit`
Edits a message in real-time.

- **Direction:** Client ➔ Server
- **Payload:**
```json
{
  "projectId": "64a0e...",
  "conversationId": "64a1f...",
  "messageId": "64a7l...",
  "content": "Hello team! (Revised)"
}
```
- **Server Broadcast Event (`message:updated`):** Emitted to `conversation:<conversationId>`
```json
{
  "conversationId": "64a1f...",
  "message": {
    "id": "64a7l...",
    "content": "Hello team! (Revised)",
    "edited": true,
    "editedAt": "Edited"
  }
}
```

---

### 5. `message:delete`
Soft-deletes a message in real-time.

- **Direction:** Client ➔ Server
- **Payload:**
```json
{
  "projectId": "64a0e...",
  "conversationId": "64a1f...",
  "messageId": "64a7l..."
}
```
- **Server Broadcast Event (`message:deleted`):** Emitted to `conversation:<conversationId>`
```json
{
  "conversationId": "64a1f...",
  "messageId": "64a7l...",
  "message": {
    "id": "64a7l...",
    "deleted": true,
    "content": "This message was deleted"
  }
}
```

---

### 6. `message:react`
Adds or removes an emoji reaction.

- **Direction:** Client ➔ Server
- **Payload:**
```json
{
  "projectId": "64a0e...",
  "conversationId": "64a1f...",
  "messageId": "64a7l...",
  "emoji": "🔥"
}
```
- **Server Broadcast Event (`message:reaction-updated`):** Emitted to `conversation:<conversationId>`
```json
{
  "conversationId": "64a1f...",
  "message": {
    "id": "64a7l...",
    "reactions": [
      { "emoji": "🔥", "count": 1, "users": ["64a1a..."] }
    ]
  }
}
```

---

### 7. `message:read`
Marks a message as read by the authenticated user.

- **Direction:** Client ➔ Server
- **Payload:**
```json
{
  "projectId": "64a0e...",
  "conversationId": "64a1f...",
  "messageId": "64a7l..."
}
```
- **Server Broadcast Event (`message:read-updated`):** Emitted to `conversation:<conversationId>`
```json
{
  "conversationId": "64a1f...",
  "messageId": "64a7l...",
  "userId": "64a2b..."
}
```

---

### 8. `chat:error`
Emitted by the server to the sender's socket when a permission or validation error occurs.

- **Direction:** Server ➔ Client
- **Payload:**
```json
{
  "code": "FORBIDDEN",
  "message": "You are not an active member of this project"
}
```
