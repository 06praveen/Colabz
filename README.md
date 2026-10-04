# Colabz — Collaborative Developer Workspace

**Colabz** is a modern, unified collaborative developer workspace combining GitHub-style repository versioning with real-time workspace chat, task boards, issue tracking, activity audit feeds, 1-to-1 WebRTC voice/video calling, and an integrated AI coding assistant.

---

## 🚀 Features Across All 10 Phases

1. **Authentication & Identity**: Secure user registration, login, and JWT-authenticated sessions with bcrypt password hashing (10 salt rounds), rate limiting, and profile customization.
2. **Projects & Workspaces**: Workspace repository creation, metadata management, technology stack tagging, and public/private visibility controls.
3. **Members & Role-Based Access Control (RBAC)**: Team member invitations via email/token, role assignment (`OWNER`, `ADMIN`, `DEVELOPER`, `DESIGNER`, `VIEWER`), and granular permission enforcement.
4. **Task & Issue Management**: Interactive Kanban-style task boards (`TODO`, `IN_PROGRESS`, `DONE`), issue tracking with priority tagging, and threaded discussion comments.
5. **Repository Files & Version History**: In-browser file and folder explorer, branch creation, commit creation with change diffs, and commit history tracking.
6. **Real-Time Workspace Chat**: Direct 1-to-1 messaging and project-wide channels with Socket.IO, typing indicators, rich task/issue attachment cards, emoji reactions, and unread counts.
7. **Notifications & Activity Feed**: Real-time push notifications delivered via Socket.IO, unread badge indicators, project-level muting, and historical activity timelines.
8. **1-to-1 Voice & Video Calling (WebRTC)**: Peer-to-peer audio and video calling powered by WebRTC and Socket.IO signaling, STUN NAT traversal, microphone mute, camera toggle, incoming call dialogs, and persistent call history in MongoDB.
9. **AI Coding Assistant**: Google Gemini-powered coding assistant (`gemini-3.8-flash`) providing code explanation, error debugging, project summarization, and setup assistance.
10. **Security Hardening & Integration**: Helmet HTTP security headers, origin-restricted CORS, rate limiting against brute-force attacks, IDOR boundary protection, centralized error handling, and graceful process shutdown.

---

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite, React Router 6, Axios, Lucide React Icons, Socket.IO Client.
- **Backend**: Node.js, Express.js, Socket.IO, Helmet, Express-Validator, BcryptJS, JSONWebToken.
- **Database**: MongoDB & Mongoose ODM (16 indexed collections).
- **Real-Time Communication**: WebRTC (`RTCPeerConnection`, `MediaStream`), Socket.IO (Signaling & Live Events).
- **AI Engine**: Google Gemini API (`@google/generative-ai`).

---

## 🏛️ High-Level Architecture

```text
┌────────────────────────────────────────────────────────┐
│               React Frontend (Vite + SPA)              │
│  - AppShell, ProjectLayout, Contexts, WebRTC Service   │
└──────────────┬───────────────────────────┬─────────────┘
               │                           │
        HTTP / REST (Axios)         WebSocket (Socket.IO)
               │                           │
               ▼                           ▼
┌────────────────────────────────────────────────────────┐
│                   Express.js Server                    │
│  - Helmet Security Headers, CORS, Rate Limiters        │
│  - JWT Authentication Middleware                       │
│  - Project Membership & RBAC Enforcement               │
│  - Centralized Error & 404 Handlers                    │
└──────────────┬───────────────────────────┬─────────────┘
               │                           │
               ▼                           ▼
┌──────────────────────────┐    ┌────────────────────────┐
│      Service Layer       │    │   Socket Event Hub     │
│ - AuthService            │    │ - Chat & Messaging     │
│ - ProjectService         │    │ - Live Notifications   │
│ - Task & IssueService    │    │ - WebRTC Signaling     │
│ - RepositoryService      │    │ - Presence Management  │
│ - NotificationService    │    └──────────┬─────────────┘
│ - CallService            │               │
│ - AIService (Gemini)     │               │
└──────────────┬───────────┘               │
               │                           │
               ▼                           │
┌──────────────────────────────────────────┴─────────────┐
│                 Mongoose ODM & MongoDB                 │
│  - 16 Indexed Collections                              │
│  - Strong Schema Validation & Virtual Transforms       │
│  - High-Speed Compound Indexes for Queries             │
└────────────────────────────────────────────────────────┘
```

---

## 📁 Repository Structure

```text
Colabz/
├── config/                  # Database and startup environment validation
│   ├── db.js
│   └── env.js
├── controllers/             # Express API controllers
├── middleware/              # Auth, RBAC, Rate limiting, ObjectId validation, Error handlers
├── models/                  # 16 Mongoose Schemas & compound indexes
├── routes/                  # REST API routes
├── services/                # Backend business logic & Socket.IO emitters
├── sockets/                 # Authenticated Socket.IO routers & WebRTC signaling
├── validators/              # Express-validator input validation chains
├── learning/backend/        # Complete learning documentation, security matrices, & API references
├── client/                  # React + Vite frontend application
│   ├── src/
│   │   ├── components/      # UI components (Calls, Chat, Tasks, Issues, AI, Shell)
│   │   ├── context/         # Auth, Project, Member, Task, Issue, Chat, Call, Notification Contexts
│   │   ├── pages/           # Dashboard, Projects, Repository, Chat, Calls, Settings
│   │   ├── services/        # Axios API clients & WebRTC Peer Connection manager
│   │   └── config/          # STUN server and client configurations
└── server.js                # Express entrypoint with Graceful Shutdown
```

---

## ⚙️ Environment Variables

Create `.env` in the project root:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/colabz
JWT_SECRET=your_super_secret_jwt_key_here
CLIENT_URL=http://localhost:5173
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-3.8-flash
```

---

## 💻 Running Locally

### 1. Start the Backend Server

```bash
# In the root directory:
npm install
npm run dev
```

The server will start on `http://localhost:5000` with MongoDB and Socket.IO initialized.

### 2. Start the Frontend Client

```bash
# In the client directory:
cd client
npm install
npm run dev
```

The frontend will start on `http://localhost:5173`.

### 3. Run Automated End-to-End Tests

```bash
# Full Phase 1-10 end-to-end integration test:
node scratch/test_phase10_full.js

# WebRTC & calling test suite:
node scratch/test_phase9.js

# Notifications & activity feed test suite:
node scratch/test_phase8.js
```

---

## 🔐 Security Summary

- **Authentication**: Bcrypt password hashing (10 salt rounds) and JWT verification on all protected routes and Socket.IO handshakes.
- **Authorization**: Granular RBAC (`requireProjectMember`, `requireProjectRole`) verifying project boundaries before mutations.
- **IDOR Protection**: All resource lookups are scoped by both resource ID and parent project ID. Caller/Sender IDs are derived from JWTs, never trusted from request bodies.
- **Rate Limiting**: Sliding-window rate limiters on authentication endpoints (20 req / 5 min) and AI chat (30 req / 1 min).
- **Transport Security**: Helmet security headers, CORS origin whitelisting, and strict request body size limits.

---

## ⚠️ Known Limitations & Design Decisions

1. **WebRTC NAT Traversal**: Configured with Google's public STUN server (`stun:stun.l.google.com:19302`). Sufficient for local and direct internet connections; complex corporate firewalls/symmetric NATs would require a dedicated TURN server in production.
2. **Simplified Repository Versioning**: Uses MongoDB document versioning rather than an external Git binary/libgit2.
3. **1-to-1 Calling**: Optimized for high-fidelity 1-to-1 peer-to-peer calling without SFU/MCU media servers.

---

## 📄 License

This project is licensed under the MIT License.
