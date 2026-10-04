# Colabz — Final Complete Architecture Document

Colabz is a comprehensive developer collaboration platform designed to combine GitHub-style repository management with real-time workspace chat, task boards, issue tracking, activity feeds, voice/video calling via WebRTC, and an AI coding assistant.

---

## 1. High-Level Architectural Flow

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

## 2. WebRTC Peer-to-Peer Media vs. Socket.IO Signaling

A core principle in Colabz is strict separation between high-bandwidth media streams and signaling:

```text
┌────────────────────────────────────────────────────────┐
│                      User A Peer                       │
└──────────────┬───────────────────────────▲─────────────┘
               │                           │
   1. SDP Offer / Candidates   2. SDP Answer / Candidates
        (JSON over TCP)             (JSON over TCP)
               │                           │
               ▼                           │
┌──────────────────────────────────────────┴─────────────┐
│           Socket.IO Server (Signaling Relay)           │
│  - Validates call participants & JWT                   │
│  - Forwards strictly to target user:<userId> room      │
└──────────────┬───────────────────────────▲─────────────┘
               │                           │
               ▼                           │
┌──────────────────────────────────────────┴─────────────┐
│                      User B Peer                       │
└──────────────┬───────────────────────────▲─────────────┘
               │                           │
               └═══════════════════════════┘
                Peer-to-Peer WebRTC Stream
                (Audio/Video via SRTP/UDP)
```

1. **Signaling (Socket.IO)**: Exchanges session descriptions (SDP offers and answers) and network candidates (ICE). Payload size is minuscule (<1 KB).
2. **Media (WebRTC)**: Carries high-definition video and opus audio directly between peer browsers over encrypted SRTP, completely bypassing the backend server.
3. **Call Records (MongoDB)**: Stores permanent call history, start/answered/ended timestamps, status (`COMPLETED`, `MISSED`, `DECLINED`, `CANCELLED`), and server-calculated durations.

---

## 3. Security Architecture & Layers

1. **Layer 1 — Transport & Network Security**:
   - Helmet HTTP headers (`X-Frame-Options`, `X-Content-Type-Options`, `Strict-Transport-Security`).
   - Strict CORS origin whitelisting (`CLIENT_URL`).
   - Rate limiting on authentication (`/api/auth/*`) and AI endpoints (`/api/ai/*`).
2. **Layer 2 — Identity & Authentication**:
   - Bcrypt password hashing (10 salt rounds), passwords never selected or returned.
   - Cryptographically signed JWT tokens with expiration.
   - Authenticated Socket.IO handshake associating `socket.user`.
3. **Layer 3 — Authorization & RBAC**:
   - `requireProjectMember`: Ensures user belongs to the project before granting access to any workspace resource.
   - `requireProjectRole("OWNER", "ADMIN", ...)`: Enforces role permissions on sensitive operations (invitations, role updates, repository deletions).
4. **Layer 4 — Data Integrity & IDOR Defense**:
   - Resource queries scope by both `_id` and `project: req.project._id`.
   - Sender, caller, and actor IDs are derived strictly from verified JWT tokens.
5. **Layer 5 — Environment & Error Sanitization**:
   - Startup environment validation (`config/env.js`).
   - Centralized error handler preventing stack traces or internal secrets from leaking in production responses.
