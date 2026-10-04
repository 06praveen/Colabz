# Colabz — Deployment Guide

Comprehensive, step-by-step production and local deployment manual for **Colabz** (collaborative developer workspace combining repository management, task tracking, real-time chat, and WebRTC audio/video calling).

---

## 1. Project Overview

Colabz is a full-stack real-time collaboration platform designed for developer teams.

- **Frontend**: React 18, Vite, React Router 6, Framer Motion, Three.js, Lucide Icons, Vanilla CSS Design System
- **Backend**: Node.js, Express.js (REST API + WebSocket Gateway)
- **Database**: MongoDB (via Mongoose ODM)
- **Real-Time Engine**: Socket.IO (bidirectional event streams for chat, presence, notifications, and signaling)
- **Authentication**: Stateless JSON Web Tokens (JWT) + bcrypt password hashing + optional GitHub OAuth 2.0
- **Calling**: WebRTC peer-to-peer audio and video streaming with Socket.IO SDP/ICE signaling
- **File & Repository Storage**: Multi-branch tree file storage in MongoDB with multipart upload parsing via Multer

---

## 2. Architecture

```text
               ┌────────────────────────────────────────┐
               │         Browser / Client App           │
               │        (React 18 + Vite SPA)           │
               └────┬──────────────┬───────────────┬────┘
                    │              │               │
       HTTPS / REST │    WebSocket │        WebRTC │ P2P Media
       (Axios API)  │  (Socket.IO) │      (Audio & │ Video)
                    ▼              ▼               ▼
         ┌───────────────────────────────┐   ┌────────────────┐
         │     Node.js + Express API     │   │ Remote Peer    │
         │      (Port 5000 / HTTPS)      │   │ (Other Browser)│
         └──────────────┬────────────────┘   └────────────────┘
                        │
                        │ Mongoose Driver
                        ▼
         ┌───────────────────────────────┐
         │       MongoDB Database        │
         │  (Local or MongoDB Atlas)     │
         └───────────────────────────────┘
```

- **REST API**: Handles user auth, project management, invitations, tasks, issues, and file uploads.
- **Socket.IO**: Powers instant messaging, live typing status, notification broadcasts, and WebRTC call signaling.
- **WebRTC**: Directly streams microphone and camera media between connected peers once signaling completes.
- **MongoDB**: Persists users, projects, memberships, branches, commits, files, messages, and notifications.

---

## 3. Prerequisites

Ensure the following runtimes and tools are installed on your deployment host or local workstation:

| Tool / Runtime | Recommended Version | Purpose |
|---|---|---|
| **Node.js** | `v18.x` or `v20.x` LTS (>= 18.0.0) | JavaScript runtime engine |
| **npm** | `v9.x` or `v10.x` | Package manager |
| **MongoDB** | `v6.0+` or MongoDB Atlas Cluster | NoSQL Database |
| **Git** | `v2.30+` | Version control |
| **GitHub Account** | Standard account | GitHub OAuth App configuration |

---

## 4. Clone the Repository

Clone the project repository to your target server:

```bash
git clone https://github.com/<your-username>/Colabz.git
cd Colabz
```

---

## 5. Install Dependencies

Colabz is structured with a root backend workspace and a nested `client/` frontend directory. Install dependencies in both environments:

### Step 1: Install Backend Dependencies (Root Directory)
```bash
npm install
```

### Step 2: Install Frontend Dependencies (`client` Directory)
```bash
cd client
npm install
cd ..
```

---

## 6. Environment Variables

Create `.env` files in both the project root (Backend) and inside `client/` (Frontend).

### A. Backend `.env` (Location: `./.env`)

```env
# Server Network Port
PORT=5000

# Server Runtime Environment (development | production)
NODE_ENV=production

# MongoDB Connection URI (Local or MongoDB Atlas)
MONGO_URI=mongodb+srv://<db_user>:<db_password>@cluster0.mongodb.net/colabz?retryWrites=true&w=majority

# JWT Token Signing Secret (Minimum 32 random characters)
JWT_SECRET=super_secret_jwt_key_colabz_production_random_token_98374

# JWT Token Expiration
JWT_EXPIRE=7d

# Allowed Frontend Client URL (For CORS & Socket.IO whitelist)
CLIENT_URL=https://colabz.yourdomain.com

# GitHub OAuth 2.0 Credentials (Optional - server side only)
GITHUB_CLIENT_ID=your_github_oauth_client_id
GITHUB_CLIENT_SECRET=your_github_oauth_client_secret
GITHUB_CALLBACK_URL=https://api.yourdomain.com/api/auth/github/callback

# Gemini AI Assistant API Key (Optional)
GEMINI_API_KEY=your_gemini_api_key_here
```

> ⚠️ **CRITICAL SECURITY NOTE**: `JWT_SECRET`, `MONGO_URI`, and `GITHUB_CLIENT_SECRET` are sensitive server credentials. **NEVER** commit `.env` files into Git or expose them in client-side code.

### B. Frontend `.env` (Location: `./client/.env`)

```env
# Backend REST API Base Endpoint
VITE_API_URL=https://api.yourdomain.com/api

# Backend Real-Time WebSocket Endpoint
VITE_SOCKET_URL=https://api.yourdomain.com
```

*Note: For local development, set `VITE_API_URL=http://localhost:5000/api` and `VITE_SOCKET_URL=http://localhost:5000`.*

---

## 7. MongoDB Setup

### Option 1: MongoDB Atlas (Recommended for Cloud / Production)

1. Navigate to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and sign in.
2. Click **Create a Deployment** and select a free **M0** or production cluster.
3. Under **Security > Database Access**:
   - Create a database user (e.g. `colabz_admin`) with a strong password and Read/Write permissions.
4. Under **Security > Network Access**:
   - Add an IP Access Rule. For cloud hosting providers (e.g., Render, Railway, AWS), add `0.0.0.0/0` (Allow access from anywhere) or specify your server's static outbound IP.
5. Under **Database > Connect > Drivers (Node.js)**:
   - Copy the SRV connection string:
     ```text
     mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/colabz?retryWrites=true&w=majority
     ```
6. Replace `<username>` and `<password>` and place the URI in the backend `.env` file under `MONGO_URI`.

### Option 2: Local MongoDB (For Local Server / Docker)

1. Start your local MongoDB service:
   ```bash
   mongod --dbpath /data/db
   ```
2. Set your backend `.env`:
   ```env
   MONGO_URI=mongodb://127.0.0.1:27017/colabz
   ```

---

## 8. GitHub OAuth Setup

If you wish to enable GitHub 1-click authentication:

1. Go to GitHub: **Settings > Developer Settings > OAuth Apps > New OAuth App**.
2. Fill in the application registration details:
   - **Application Name**: `Colabz Workspace`
   - **Homepage URL**: `https://colabz.yourdomain.com` (or `http://localhost:5173`)
   - **Authorization callback URL**: `https://api.yourdomain.com/api/auth/github/callback` (or `http://localhost:5000/api/auth/github/callback`)
3. Click **Register Application**.
4. Copy the **Client ID**.
5. Click **Generate a new client secret** and copy the **Client Secret**.
6. Set `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` in the backend `.env`.

> ⚠️ **Rule**: The GitHub Client Secret must remain exclusively in backend `.env` and must never be placed in frontend code.

---

## 9. File Upload Configuration

Colabz provides full repository file uploading through the web workspace.

### How Uploads Are Handled
1. The frontend creates a `FormData` object with multipart boundaries containing the target file, branch, and directory path.
2. The request is sent to `POST /api/projects/:projectId/repository/upload`.
3. Backend middleware (`uploadMiddleware.js`) intercepts the payload using `Multer` with a 15MB file size limit.
4. The file data, metadata, language type, and path hierarchy are validated and stored in MongoDB under the `RepositoryFile` collection.

### Production Storage Considerations
- Because files are stored directly in MongoDB document records, file storage persists seamlessly across container restarts, ephemeral cloud instances (like Heroku or Render free tiers), and multi-region database clusters without relying on local server disks.
- Allowed file types: code files, scripts, markdown, JSON, configs, and text files up to 15MB.

---

## 10. Local Development

To run the complete application locally:

### Terminal 1: Backend Server
```bash
# In project root
npm run dev
```
*Backend runs on: `http://localhost:5000` (API endpoint: `http://localhost:5000/api`)*

### Terminal 2: Frontend Client
```bash
# In client/ directory
cd client
npm run dev
```
*Frontend runs on: `http://localhost:5173`*

---

## 11. Production Build

### 1. Build the Frontend SPA
Run the production bundle command in the `client/` folder:
```bash
cd client
npm run build
```
This produces optimized production static assets in `client/dist/`.

### 2. Run the Production Backend
Start the Node.js production server from the project root:
```bash
NODE_ENV=production node server.js
```
Or with PM2 process manager:
```bash
pm2 start server.js --name "colabz-backend"
```

---

## 12. Deployment Option A — Frontend (Vercel / Netlify / Cloudflare Pages)

### Deploying to Vercel:
1. Push your code to GitHub.
2. In Vercel, click **Add New > Project** and import the repository.
3. Configure the Project Settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. In **Environment Variables**, add:
   - `VITE_API_URL` = `https://api.yourdomain.com/api`
   - `VITE_SOCKET_URL` = `https://api.yourdomain.com`
5. Create a `client/vercel.json` file for SPA route rewrites if needed:
   ```json
   {
     "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
   }
   ```
6. Click **Deploy**.

---

## 13. Deployment Option B — Backend (Render / Railway / AWS / DigitalOcean)

Because Colabz requires persistent **WebSocket connections for Socket.IO and WebRTC signaling**, deploy the backend to a platform that supports long-lived connections (e.g. Render Web Services, Railway, DigitalOcean App Platform, or an AWS EC2 instance).

### Deploying to Render:
1. Create a **New Web Service** connected to your GitHub repository.
2. Set configuration:
   - **Root Directory**: `./` (project root)
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
3. Add Environment Variables:
   - `NODE_ENV` = `production`
   - `PORT` = `5000` (or leave default assigned by host)
   - `MONGO_URI` = `<your-mongodb-atlas-connection-string>`
   - `JWT_SECRET` = `<secure-random-jwt-secret>`
   - `CLIENT_URL` = `https://colabz.yourdomain.com` (your deployed frontend URL)
4. Click **Create Web Service**.

---

## 14. CORS Configuration

Colabz restricts cross-origin resource sharing to the authorized client domain specified in `CLIENT_URL`.

- When deploying, ensure the backend `.env` variable `CLIENT_URL` matches your exact frontend production domain:
  ```env
  CLIENT_URL=https://colabz.yourdomain.com
  ```
- Do not add trailing slashes to `CLIENT_URL`.
- The backend automatically applies CORS whitelist rules to both Express REST routes and the Socket.IO server engine.

---

## 15. Socket.IO Production Configuration

The frontend Socket.IO client automatically connects to `VITE_SOCKET_URL`:

- **Transports**: Socket.IO uses `['websocket', 'polling']`.
- **Authentication**: JWT tokens from `localStorage` (`colabz_token`) are automatically passed during socket handshake.
- **Hosting requirement**: Ensure that your backend hosting provider does not block or terminate long-lived WebSocket HTTP upgrades (HTTP 101).

---

## 16. WebRTC Deployment & Calling

Colabz utilizes WebRTC for high-definition 1-to-1 audio and video calling.

### Requirements:
1. **HTTPS is Mandatory**: Modern web browsers (Chrome, Firefox, Safari, Edge) strictly block microphone and webcam access on unencrypted HTTP connections (except `localhost`). Both frontend and backend production URLs must use HTTPS / WSS.
2. **STUN Configuration**: The app uses Google's public STUN servers (`stun:stun.l.google.com:19302`) for NAT traversal.
3. **TURN Server (For Enterprise Firewalls)**: For restrictive corporate networks, symmetric NATs, or strict firewalls, configure a TURN server (e.g. Twilio Network Traversal, Xirsys, or Coturn) in `client/src/services/webrtcService.js` to ensure 100% media relay reliability.

---

## 17. Database Production Configuration

For a secure MongoDB production cluster:
1. **Enable Authentication**: Ensure database user has strict readWrite access to the `colabz` database only.
2. **IP Whitelist**: Restrict Atlas access to your backend server's static IP if available.
3. **Automated Backups**: Enable MongoDB Atlas continuous cloud backups.
4. **Connection Pooling**: Mongoose manages connection pooling automatically (default pool size: 10 connections).

---

## 18. Deployment Verification Checklist

Verify all core flows once your production URLs are live:

- [ ] `GET /api/health` returns `{ "success": true, "data": { "database": "connected" } }`
- [ ] Homepage loads with Colabz branding and logo
- [ ] User registration generates JWT and unique `@username`
- [ ] User login authenticates and stores JWT token
- [ ] Logout terminates session, clears storage, and blocks protected routes
- [ ] Dashboard displays workspaces and activity feed
- [ ] Project creation initializes repository, default branch (`main`), and initial commit
- [ ] Repository tree renders files and folders
- [ ] File Upload allows selecting/dragging files, uploads via multipart form, and renders in tree immediately
- [ ] Member search by `@username` sends project invitations
- [ ] Recipient sees pending invitation in `/app/inbox` and accepts it
- [ ] Real-time Socket.IO chat delivers messages instantly between members
- [ ] Audio/Video calling rings recipient, connects WebRTC streams, and toggles mic/camera cleanly
- [ ] Error Boundary displays graceful recovery card in case of unexpected errors

---

## 19. Common Errors and Fixes

| Issue | Root Cause | Solution |
|---|---|---|
| `EADDRINUSE: address already in use :::5000` | Port 5000 is occupied by another process | Terminate the process using port 5000 (`netstat -ano \| findstr :5000`, `taskkill /PID <PID> /F` on Windows or `lsof -i :5000`, `kill -9 <PID>` on Linux). |
| `CORS Error: No 'Access-Control-Allow-Origin'` | Backend `CLIENT_URL` does not match frontend origin | Set `CLIENT_URL` in backend `.env` to match the exact frontend URL (without trailing slash). |
| `MongoServerError: bad auth / Authentication failed` | Invalid MongoDB username or password | Verify database user credentials in MongoDB Atlas; URL-encode special characters in password. |
| `401 Unauthorized on protected routes` | Expired or missing JWT token | Log in again; ensure frontend `VITE_API_URL` is pointing to the correct API domain. |
| `Socket.IO connection error / Polling failed` | WebSocket upgrade blocked or incorrect `VITE_SOCKET_URL` | Set `VITE_SOCKET_URL` in frontend `.env` to backend domain and ensure backend host allows WebSocket traffic. |
| `WebRTC NotAllowedError: Permission denied` | User rejected camera/mic prompt or site is not HTTPS | Access application over HTTPS and grant camera/microphone permissions in browser settings. |
| `File upload 400: Please select a file` | File payload was not attached as `file` field | Ensure form data appends `file` (`formData.append('file', file)`). |

---

## 20. Security Checklist

- [ ] `.env` and `.env.local` are listed in `.gitignore` and never committed to Git.
- [ ] `JWT_SECRET` is set to a cryptographically strong string (>= 32 random characters).
- [ ] `GITHUB_CLIENT_SECRET` is stored strictly on the backend.
- [ ] MongoDB Atlas user does not use root/admin privileges.
- [ ] Helmet security headers are active on Express backend.
- [ ] HTTPS certificates (SSL/TLS) are configured for both frontend and backend.
- [ ] File upload size limit is enforced (15MB max).
- [ ] Unauthenticated API calls are blocked by JWT verification middleware.

---

## 21. Final Deployment Architecture Diagram

```text
                ┌──────────────────────────────────┐
                │          End User Client         │
                │    https://colabz.yourdomain.com │
                └─────────────────┬────────────────┘
                                  │
                       HTTPS / WSS Gateway
                                  │
                ┌─────────────────▼────────────────┐
                │      Node.js Express Server      │
                │     https://api.yourdomain.com   │
                │      (REST API + Socket.IO)      │
                └─────────┬──────────────┬─────────┘
                          │              │
        MongoDB TLS (SRV) │              │ WebRTC Signaling
                          │              │ (SDP / ICE Events)
                ┌─────────▼────────┐     │
                │  MongoDB Atlas   │     ▼
                │ Cloud Database   │  ┌───────────────────────┐
                │   (Encrypted)    │  │ Peer WebRTC Streams   │
                └──────────────────┘  │ (Direct Media Audio/V)│
                                      └───────────────────────┘
```

---

## 22. Deployment Troubleshooting

### If frontend works but API calls fail:
1. Open browser DevTools > **Network** tab.
2. Check the request URL. Ensure it targets `https://api.yourdomain.com/api/...` rather than `http://localhost:5000`.
3. Check the response status. If 404, verify the backend API routing prefixes (`/api/...`). If 500, inspect backend server logs.

### If API works but Socket.IO fails to connect:
1. Verify `VITE_SOCKET_URL` is set to the backend root URL without `/api` or trailing slashes (e.g. `https://api.yourdomain.com`).
2. Check if your hosting provider or load balancer requires sticky sessions or WebSocket protocol passthrough.

### If login works locally but fails in production:
1. Check `JWT_SECRET` environment variable exists on your production backend.
2. Check database connectivity by testing `GET https://api.yourdomain.com/api/health`.

### If file uploads fail in production:
1. Ensure the upload request is sending `multipart/form-data`.
2. Check that the file size is under 15MB.
3. Confirm that the user has an active membership role (`OWNER`, `MAINTAINER`, or `DEVELOPER`) in the project.

### If audio/video calls fail to connect in production:
1. Confirm both users are browsing over **HTTPS**.
2. Verify browser camera and microphone permissions are granted.
3. Check browser console for WebRTC ICE connection status (`iceConnectionState: checking -> connected`). If status stalls at `failed`, configure a TURN server in `webrtcService.js`.

---

*Colabz — Unified Developer Workspace & Collaboration Room.*
