# Phase 10 — Comprehensive Learning Guide: Full-Stack Architecture, Security Hardening & Integration

---

## 1. Authentication
Authentication is the process of verifying who a user is. In Colabz, users register with their email and password. Passwords are never stored as plaintext; they are hashed with `bcryptjs`. Upon successful login, the server issues a digitally signed JSON Web Token (JWT).

## 2. JWT (JSON Web Tokens)
A JWT consists of three parts separated by dots:
`Header.Payload.Signature`
- **Header**: Contains the algorithm (e.g. `HS256`) and token type.
- **Payload**: Contains non-sensitive claims such as `userId` and `email`.
- **Signature**: Formed by hashing the base64-encoded header and payload with a secret key (`JWT_SECRET`).
When the client presents this token in the `Authorization: Bearer <token>` header, the server verifies the cryptographic signature without needing to hit the database for every single request verification.

## 3. bcrypt & Password Hashing
Bcrypt is an adaptive cryptographic hash function based on the Blowfish cipher. It incorporates a random salt to protect against rainbow table attacks and uses a work factor (salt rounds, e.g. 10) to make brute-force attacks computationally expensive.

## 4. Role-Based Access Control (RBAC)
RBAC restricts system access based on user roles within an organization or workspace. In Colabz:
- **OWNER**: Full administrative privileges, project deletion, and ownership transfer.
- **ADMIN**: Manage workspace settings, invite members, modify roles, and remove members.
- **DEVELOPER**: Work on repositories, create branches, write commits, and manage tasks/issues.
- **DESIGNER**: Create and contribute to tasks, issues, assets, and team discussions.
- **VIEWER**: Read-only access across the workspace.

## 5. REST APIs (Representational State Transfer)
REST is an architectural style for distributed hypermedia systems utilizing standard HTTP methods:
- `GET`: Retrieve resource representation.
- `POST`: Create a new resource.
- `PUT` / `PATCH`: Full replacement or partial modification of a resource.
- `DELETE`: Remove a resource.
Colabz ensures statelessness, standard HTTP status codes (`200`, `201`, `400`, `401`, `403`, `404`, `409`, `422`, `429`, `500`), and consistent JSON envelope responses.

## 6. MongoDB & Mongoose
MongoDB is a document-oriented NoSQL database storing BSON documents. Mongoose is an Object Data Modeling (ODM) library for Node.js providing:
- Strict schema validation
- Type casting and defaults
- Pre/post lifecycle middleware hooks (e.g. password hashing on `pre('save')`)
- Virtual properties and custom JSON transformations (omitting passwords)

## 7. Repository Versioning Architecture
Colabz models Git concepts natively inside MongoDB:
- `RepositoryFile`: Stores path, content, size, language, branch reference, and folder hierarchy.
- `Branch`: Points to the active head commit in a project.
- `Commit`: Stores author metadata, parent commit references, and change diffs (additions, modifications, deletions).

## 8. Real-Time Chat with Socket.IO
Socket.IO enables low-latency bidirectional event communication over WebSocket protocols with HTTP long-polling fallback. Rooms (`conversation:<id>`, `user:<id>`) isolate broadcasts, allowing instant messaging and typing indicators without client polling.

## 9. Notifications & Activity Feeds
- **Notifications**: Targeted personal updates (e.g. task assignment, issue mention) delivered in real-time to private user rooms (`user:<userId>`) and stored in the `Notification` collection.
- **Activity Feed**: Workspace-level audit timeline recording major events (commits, branch creations, project status changes) stored in the `Activity` collection.

## 10. WebRTC & Peer-to-Peer Media
WebRTC allows browsers to stream audio and video directly to one another using SRTP (Secure Real-time Transport Protocol). Socket.IO acts as the signaling channel exchanging SDP offers, SDP answers, and ICE candidates.

## 11. AI Assistant Integration
Colabz connects to Google Gemini (`gemini-3.8-flash`) via `@google/generative-ai`. The backend validates user authentication and project authorization, constructs prompt context safely without leaking secrets, and streams expert code analysis and debugging assistance.

## 12. API Security & IDOR Protection
Insecure Direct Object Reference (IDOR) vulnerabilities occur when an API allows users to manipulate parameters (like IDs) to access unauthorized records. Colabz protects against IDOR by:
1. Always checking project membership before accessing any nested resource.
2. Deriving user identity from verified JWTs, never trusting client body IDs.
3. Filtering queries by `{ _id: resourceId, project: projectId }`.

## 13. Input Validation
All user inputs are validated using `express-validator` chains checking lengths, required fields, and sanitization before hitting controllers. Malformed MongoDB ObjectIds are caught early with `validateObjectId`.

## 14. Cross-Origin Resource Sharing (CORS)
CORS is a browser security mechanism that restricts HTTP requests from other origins. Colabz configures CORS to whitelist only the configured `CLIENT_URL` with explicit HTTP methods and allowed headers.

## 15. Helmet Security Headers
Helmet configures HTTP response headers to secure Express apps against well-known web vulnerabilities (such as clickjacking, MIME-type sniffing, and cross-site scripting).

## 16. Rate Limiting & Brute-Force Defense
Sliding-window rate limiters prevent denial-of-service and brute-force password cracking on sensitive routes (`/api/auth/*` and `/api/ai/*`).

## 17. Pagination & Query Safety
All list endpoints support `page` and `limit` with safe boundaries (default 20, max 100) preventing attackers from exhausting server memory by requesting millions of records.

## 18. Database Indexes
Indexes allow MongoDB to find documents without scanning entire collections. Colabz implements single-field and compound indexes (e.g. `{ project: 1, createdAt: -1 }`, `{ caller: 1, receiver: 1, status: 1 }`).

## 19. Centralized Error Handling
One centralized Express error middleware captures all thrown exceptions and Mongoose errors (CastError, DuplicateKeyError, ValidationError), producing uniform error JSON while omitting sensitive stack traces in production.

## 20. Environment Configuration
Secrets (database connection URIs, JWT signing keys, Gemini API keys) are stored in `.env` and validated at startup via `config/env.js`.

## 21. Production Deployment Concepts
Production readiness requires:
- HTTPS/TLS certificates
- Process supervisors (PM2 / Docker)
- Environment variable injection
- Build optimization (Vite bundle splitting)
- Health monitoring (`/api/health`)

---

## 22. 40 Comprehensive Interview & Viva Questions

1. **What is the MERN stack?**
   MongoDB (database), Express.js (web framework), React (frontend library), and Node.js (runtime environment).
2. **What is the purpose of JWT and how is it structured?**
   JWT provides stateless authentication. It consists of Header, Payload, and Signature.
3. **How does bcrypt hashing protect passwords?**
   It uses random salts and configurable work factors to make rainbow table lookups and brute-force cracking infeasible.
4. **What is RBAC?**
   Role-Based Access Control assigns permissions to roles (e.g. OWNER, ADMIN, DEVELOPER) rather than individual users.
5. **What is an IDOR vulnerability and how did you prevent it?**
   IDOR happens when an API trusts user-supplied IDs without verifying ownership. Prevented by validating project membership and scoping queries by project ID.
6. **What is the difference between WebRTC and Socket.IO?**
   WebRTC transmits audio/video directly peer-to-peer over UDP/SRTP. Socket.IO is used over TCP exclusively for signaling (SDP & ICE exchange).
7. **Does Socket.IO transmit the video streams?**
   No. Socket.IO only transmits lightweight signaling metadata (<1 KB). Streaming video over Socket.IO would saturate server bandwidth.
8. **What is an SDP offer and answer?**
   Session Description Protocol (SDP) defines media capabilities (codecs, resolutions, encryption keys, network formats) negotiated between peers.
9. **What are ICE candidates?**
   Interactive Connectivity Establishment candidates represent potential network routing paths (IP addresses and ports) for peer-to-peer connectivity.
10. **What is a STUN server?**
    Session Traversal Utilities for NAT (STUN) allows a browser behind a NAT router to discover its public IP address and port.
11. **When is a TURN server required?**
    Traversal Using Relays around NAT (TURN) is required when symmetric NATs or corporate firewalls prevent direct peer-to-peer UDP connections.
12. **What is `getUserMedia()`?**
    A Web API that requests user permission to capture local microphone and camera MediaStreams.
13. **How does mute and camera toggle work without reconnecting?**
    By toggling `track.enabled = false` or `true` on the existing `MediaStreamTrack` without tearing down the `RTCPeerConnection`.
14. **Why is call duration calculated on the backend?**
    To prevent client clock tampering. The server computes `endedAt - answeredAt` in seconds.
15. **What is the purpose of Mongoose compound indexes?**
    They index multiple fields together (e.g. `{ project: 1, createdAt: -1 }`) to support queries filtering by project and sorting by date in a single B-tree lookup.
16. **Why do we use `select: false` on the User password field?**
    To ensure password hashes are not accidentally queried or returned in API responses.
17. **What is Helmet in Express?**
    A middleware collection that sets secure HTTP response headers to protect against common web vulnerabilities.
18. **Why should `origin: "*"` not be used with credentials in CORS?**
    Browsers forbid wildcard origins when `credentials: true` (cookies/auth headers) is enabled for security reasons.
19. **What is a sliding-window rate limiter?**
    A rate limiter that counts request timestamps within a moving time window to prevent sudden bursts and brute-force attacks.
20. **How does the AI assistant securely receive project context?**
    The backend verifies that the user is an active member of the requested project before enriching the prompt with repository metadata.
21. **Why is `GEMINI_API_KEY` kept exclusively on the server?**
    To prevent client-side exposure and unauthorized quota consumption.
22. **What is the difference between authentication and authorization?**
    Authentication verifies identity ("Who are you?"), while authorization verifies permissions ("What are you allowed to do?").
23. **What is graceful shutdown in Node.js?**
    Intercepting `SIGINT` / `SIGTERM` signals to cleanly finish ongoing requests, close WebSocket connections, and disconnect MongoDB before exiting.
24. **How are real-time notifications routed to specific users?**
    Each authenticated user automatically joins a private room (`user:<userId>`) on connection. Notifications are emitted specifically to that room.
25. **What happens if a user navigates between pages during an active call?**
    The CallContext maintains the ongoing media stream and peer connection across SPA route changes without interruption.
26. **What is Mongoose population?**
    A mechanism for referencing documents in other collections by ObjectId, similar to an SQL JOIN.
27. **Why should you use field projection in `.populate()`?**
    To avoid fetching unnecessary or sensitive user fields (e.g. `.populate('author', 'name avatar')`).
28. **What is optimistic UI vs. server-authoritative state?**
    Optimistic UI updates local state immediately for perceived speed; server-authoritative state confirms and synchronizes the definitive record.
29. **What is an unhandled rejection in Node.js?**
    A rejected Promise without a `.catch()` block, which can cause Node.js processes to terminate unexpectedly.
30. **What is the function of the health endpoint (`/api/health`)?**
    It provides monitoring tools and load balancers with real-time status of the API and database connectivity.
31. **What is a CastError in Mongoose?**
    An error thrown when a string cannot be converted into a valid ObjectId.
32. **How does Colabz prevent duplicate direct chat conversations?**
    By generating a deterministic sorted `participantKey` (e.g. `userA_userB`) and applying a unique compound index `{ project: 1, participantKey: 1 }`.
33. **What is the difference between direct chat and channel chat?**
    Direct chat is 1-to-1 between two workspace members; channel chat is a multi-member topic-based room.
34. **How are unread notification counts kept accurate in real-time?**
    Socket events notify the client whenever a new notification arrives, incrementing the unread badge without polling.
35. **Why is password hashing asynchronous?**
    To prevent blocking the Node.js single-threaded event loop during intensive cryptographic computations.
36. **What is the role of `dotenv`?**
    It loads environment variables from a local `.env` file into `process.env`.
37. **What is Vite and why is it used for the frontend build?**
    Vite is a modern frontend build tool providing lightning-fast Hot Module Replacement (HMR) and optimized Rollup production bundles.
38. **How does Colabz ensure no orphaned resources are created?**
    By validating parent project relationships on every entity creation and cascading status checks.
39. **What happens if the Gemini API key is missing?**
    The AI service enters a graceful development fallback mode, returning guidance and instructions rather than crashing the server.
40. **How do you verify complete system health across all 10 phases?**
    By executing automated end-to-end test suites testing authentication, projects, RBAC, tasks, issues, git repositories, real-time chat, notifications, WebRTC calls, and AI assistant integration.

---

## 23. 10 Practical Exercises for Developers

1. **Test User Registration & JWT Issuance**: Register two accounts and inspect the issued JWT tokens using `jwt.io`.
2. **Test Brute-Force Rate Limiting**: Attempt 25 rapid failed login requests to observe `429 Too Many Requests`.
3. **Test Project RBAC Demotion Defense**: Verify that an Admin cannot demote or remove the project Owner.
4. **Test IDOR Boundary Protection**: Attempt to access a private project using an account that is not a member and confirm `403 Forbidden`.
5. **Inspect WebRTC Signaling in Console**: Open two browser tabs, start a video call, and inspect the `webrtc:offer`, `webrtc:answer`, and `webrtc:ice-candidate` payloads.
6. **Test Track Muting & Camera Toggling**: Mute audio and disable video during a call to confirm tracks are toggled without session renegotiation.
7. **Test Real-Time Notification Delivery**: Assign a task from User A to User B and observe the real-time notification badge update in User B's header.
8. **Test AI Code Explanation**: Attach a code snippet to the AI assistant in the repository viewer and request a line-by-line explanation.
9. **Inspect MongoDB Collections & Indexes**: Open MongoDB Compass or `mongosh` and inspect the compound indexes across `calls`, `messages`, and `tasks`.
10. **Execute Full Automated Integration Suite**: Run `node scratch/test_phase10_full.js` to execute the automated verification suite across all 10 phases.
