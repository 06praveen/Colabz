# Phase 10 — Security & Authorization Matrix

This document provides a comprehensive security audit matrix for every feature and route in the Colabz platform, verifying Authentication (JWT), Membership Verification, Role-Based Access Control (RBAC), IDOR (Insecure Direct Object Reference) Protection, and Rate Limiting.

---

## 1. Security Matrix Table

| Feature / Resource | Route / Event | Auth Required? | Member Check? | Role Required | Resource Ownership / Project Check | Rate Limited? |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Authentication** | `POST /api/auth/register` | ❌ No | ❌ N/A | Any | Unique Email / Bcrypt Hashed | ✅ Yes (20 req / 5 min) |
| **Authentication** | `POST /api/auth/login` | ❌ No | ❌ N/A | Any | Bcrypt Comparison / JWT Issued | ✅ Yes (20 req / 5 min) |
| **Authentication** | `GET /api/auth/me` | ✅ Yes (JWT) | ❌ N/A | Any | Matches `req.user._id` | ❌ No |
| **Authentication** | `POST /api/auth/logout` | ❌ No | ❌ N/A | Any | Session Cleared | ❌ No |
| **Projects** | `POST /api/projects` | ✅ Yes (JWT) | ❌ N/A | Authenticated | User set as Owner | ❌ No |
| **Projects** | `GET /api/projects` | ✅ Yes (JWT) | ❌ Filtered | Member / Public | Only user's projects returned | ❌ No |
| **Projects** | `GET /api/projects/:projectId` | ✅ Yes (JWT) | ✅ Yes | Any active member | Validates project membership | ❌ No |
| **Projects** | `PATCH /api/projects/:projectId` | ✅ Yes (JWT) | ✅ Yes | `OWNER`, `ADMIN` | Verified via membership middleware | ❌ No |
| **Projects** | `DELETE /api/projects/:projectId` | ✅ Yes (JWT) | ✅ Yes | `OWNER` | Owner only verification | ❌ No |
| **Members** | `GET /api/projects/:id/members` | ✅ Yes (JWT) | ✅ Yes | Any active member | Project boundary verified | ❌ No |
| **Members** | `PATCH /api/projects/:id/members/:userId` | ✅ Yes (JWT) | ✅ Yes | `OWNER`, `ADMIN` | Cannot demote last Owner | ❌ No |
| **Members** | `DELETE /api/projects/:id/members/:userId` | ✅ Yes (JWT) | ✅ Yes | `OWNER`, `ADMIN` | Target member verified in project | ❌ No |
| **Invitations** | `POST /api/projects/:id/invitations` | ✅ Yes (JWT) | ✅ Yes | `OWNER`, `ADMIN` | Checks existing memberships | ❌ No |
| **Invitations** | `POST /api/invitations/:id/accept` | ✅ Yes (JWT) | ❌ Pending check | Invited User | Matches email or invitedUser ID | ❌ No |
| **Tasks** | `GET /api/projects/:id/tasks` | ✅ Yes (JWT) | ✅ Yes | Any active member | Project-scoped query | ❌ No |
| **Tasks** | `POST /api/projects/:id/tasks` | ✅ Yes (JWT) | ✅ Yes | `DEVELOPER`+ | Assignee must belong to project | ❌ No |
| **Tasks** | `PATCH /api/projects/:id/tasks/:taskId` | ✅ Yes (JWT) | ✅ Yes | `DEVELOPER`+ | Task ID verified in project | ❌ No |
| **Tasks** | `DELETE /api/projects/:id/tasks/:taskId` | ✅ Yes (JWT) | ✅ Yes | `DEVELOPER`+ | Task ID verified in project | ❌ No |
| **Issues** | `GET /api/projects/:id/issues` | ✅ Yes (JWT) | ✅ Yes | Any active member | Project-scoped query | ❌ No |
| **Issues** | `POST /api/projects/:id/issues` | ✅ Yes (JWT) | ✅ Yes | Any active member | Reporter authenticated | ❌ No |
| **Issues** | `PATCH /api/projects/:id/issues/:issueId` | ✅ Yes (JWT) | ✅ Yes | Any active member | Issue ID verified in project | ❌ No |
| **Issues** | `POST /api/projects/:id/issues/:id/comments`| ✅ Yes (JWT) | ✅ Yes | Any active member | Author authenticated | ❌ No |
| **Repository** | `GET /api/projects/:id/repository/tree` | ✅ Yes (JWT) | ✅ Yes | Any active member | Branch & project checked | ❌ No |
| **Repository** | `POST /api/projects/:id/repository/files` | ✅ Yes (JWT) | ✅ Yes | `DEVELOPER`+ | Branch verified, creates commit | ❌ No |
| **Repository** | `PATCH /api/projects/:id/repository/files/:id` | ✅ Yes (JWT) | ✅ Yes | `DEVELOPER`+ | File verified in project & branch | ❌ No |
| **Repository** | `DELETE /api/projects/:id/repository/files/:id`| ✅ Yes (JWT) | ✅ Yes | `DEVELOPER`+ | File verified in project & branch | ❌ No |
| **Branches** | `GET /api/projects/:id/branches` | ✅ Yes (JWT) | ✅ Yes | Any active member | Project-scoped query | ❌ No |
| **Branches** | `POST /api/projects/:id/branches` | ✅ Yes (JWT) | ✅ Yes | `DEVELOPER`+ | Unique branch name in project | ❌ No |
| **Commits** | `GET /api/projects/:id/commits` | ✅ Yes (JWT) | ✅ Yes | Any active member | Branch & project verified | ❌ No |
| **Chat** | `GET /api/projects/:id/conversations` | ✅ Yes (JWT) | ✅ Yes | Any active member | Direct or channel participant check | ❌ No |
| **Chat** | `POST /api/projects/:id/conversations` | ✅ Yes (JWT) | ✅ Yes | Any active member | Recipient verified in project | ❌ No |
| **Chat** | `POST /api/projects/:id/chat/:convId/messages`| ✅ Yes (JWT) | ✅ Yes | Participant | Sender derived from `req.user.id` | ❌ No |
| **Notifications** | `GET /api/notifications` | ✅ Yes (JWT) | ❌ User-scoped | Any | Filtered by `recipient: req.user._id` | ❌ No |
| **Notifications** | `PATCH /api/notifications/:id/read` | ✅ Yes (JWT) | ❌ User-scoped | Recipient | Verifies `recipient === req.user._id` | ❌ No |
| **Activity Feed** | `GET /api/projects/:id/activity` | ✅ Yes (JWT) | ✅ Yes | Any active member | Project-scoped timeline query | ❌ No |
| **Calls** | `POST /api/projects/:id/calls` | ✅ Yes (JWT) | ✅ Yes | Any active member | Caller !== Receiver, active in proj | ❌ No |
| **Calls** | `GET /api/projects/:id/calls` | ✅ Yes (JWT) | ✅ Yes | Any active member | Filtered by participant | ❌ No |
| **AI Assistant** | `POST /api/ai/chat` | ✅ Yes (JWT) | ✅ Conditional | Authenticated | Verified member if `projectId` provided | ✅ Yes (30 req / 1 min) |
| **AI Assistant** | `GET /api/ai/status` | ❌ No | ❌ N/A | Any | Never reveals API secrets | ❌ No |

---

## 2. Socket.IO Security Boundaries

| Event Name | Socket Auth Required? | Verification Flow | Room Isolation |
| :--- | :--- | :--- | :--- |
| `connection` | ✅ Yes (JWT handshake) | `socket.user` attached from verified JWT token | Auto-joined to `user:<userId>` |
| `conversation:join` | ✅ Yes | User must be in conversation `participants` or public channel | Joined to `conversation:<convId>` |
| `message:send` | ✅ Yes | Validates user membership in conversation; sender = `socket.user.id` | Emitted only to `conversation:<convId>` |
| `call:incoming` | ✅ Yes | Server-initiated upon `POST /calls` validation | Sent strictly to `user:<receiverId>` |
| `call:accept` | ✅ Yes | Verifies `call.receiver === socket.user.id` and status is `RINGING` | Emitted to `user:<callerId>` |
| `call:reject` | ✅ Yes | Verifies `call.receiver === socket.user.id` | Emitted to `user:<callerId>` |
| `call:cancel` | ✅ Yes | Verifies `call.caller === socket.user.id` | Emitted to `user:<receiverId>` |
| `call:end` | ✅ Yes | Verifies user is caller or receiver; calculates duration on server | Emitted to `user:<otherParticipantId>` |
| `webrtc:offer` | ✅ Yes | Verifies user is participant; forwards only to target peer | Emitted to `user:<targetUserId>` |
| `webrtc:answer` | ✅ Yes | Verifies user is participant; forwards only to target peer | Emitted to `user:<targetUserId>` |
| `webrtc:ice-candidate` | ✅ Yes | Verifies user is participant; forwards candidate to target peer | Emitted to `user:<targetUserId>` |

---

## 3. IDOR Defense Summary

1. **No Frontend Trust**: Sender IDs, caller IDs, and reporter IDs are never accepted from client request bodies. They are always extracted from the cryptographically verified JWT payload (`req.user._id` / `socket.user.id`).
2. **Project Boundary Guard**: Nested resources (`/tasks/:taskId`, `/issues/:issueId`, `/files/:fileId`, `/commits/:commitId`) check that the resource belongs to the active `projectId` and that the user holds an active membership.
3. **Notification & Conversation Ownership**: Notifications can only be read or deleted by their intended recipient. Direct chats can only be viewed by the two members involved.
4. **CastError Immunity**: Malformed ObjectIds (e.g. `/projects/invalid-id`) are intercepted cleanly and returned as `400 Bad Request` rather than producing Mongoose uncaught exceptions.
