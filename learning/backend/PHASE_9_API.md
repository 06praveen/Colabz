# Colabz Phase 9 — Calling & WebRTC API Documentation

---

## 1. REST Endpoints

### 1.1 Start a 1-to-1 Call
* **Method:** `POST`
* **URL:** `/api/projects/:projectId/calls`
* **Authentication:** Required (`Authorization: Bearer <JWT>`)
* **Required Permission:** Active Project Member (`OWNER`, `ADMIN`, `DEVELOPER`, `DESIGNER`, `VIEWER`)
* **URL Parameters:**
  * `projectId` (ObjectId or Project Slug)
* **Request Body:**
```json
{
  "receiverId": "6ac1441a77c9bedcf0d2cc10",
  "type": "VIDEO",
  "title": "Development Sync"
}
```
* **Validation & Business Rules:**
  * Caller must be authenticated (`req.user.id`).
  * Receiver must be an active project member.
  * Caller cannot call themselves.
  * Receiver cannot be already in an ongoing call (returns `409 Conflict` if busy).
* **Success Response (`201 Created`):**
```json
{
  "success": true,
  "message": "Call initiated successfully",
  "data": {
    "call": {
      "id": "6ac1441a77c9bedcf0d2cc16",
      "projectId": "6ac1441a77c9bedcf0d2cc05",
      "title": "Development Sync",
      "type": "video",
      "rawType": "VIDEO",
      "status": "ringing",
      "rawStatus": "RINGING",
      "callerId": "6ac1441a77c9bedcf0d2cc01",
      "caller": {
        "id": "6ac1441a77c9bedcf0d2cc01",
        "name": "Praveen Caller",
        "email": "praveen@example.com",
        "avatar": null,
        "avatarColor": "#00E5A3"
      },
      "receiverId": "6ac1441a77c9bedcf0d2cc10",
      "receiver": {
        "id": "6ac1441a77c9bedcf0d2cc10",
        "name": "Aayush Receiver",
        "email": "aayush@example.com",
        "avatar": null,
        "avatarColor": "#8B5CF6"
      },
      "startedAt": "Just now",
      "durationSeconds": 0
    }
  }
}
```
* **Error Responses:**
  * `400 Bad Request`: Receiver ID missing or attempting to call self.
  * `401 Unauthorized`: Missing or invalid JWT.
  * `403 Forbidden`: Caller or receiver is not an active member of this project.
  * `409 Conflict`: Receiver is currently busy in another ongoing call.

---

### 1.2 Get Project Call History
* **Method:** `GET`
* **URL:** `/api/projects/:projectId/calls`
* **Authentication:** Required (`Authorization: Bearer <JWT>`)
* **Required Permission:** Active Project Member
* **Query Parameters:**
  * `page` (optional, number, default: 1)
  * `limit` (optional, number, default: 30, max: 100)
* **Success Response (`200 OK`):**
```json
{
  "success": true,
  "data": {
    "calls": [
      {
        "id": "6ac1441a77c9bedcf0d2cc16",
        "projectId": "6ac1441a77c9bedcf0d2cc05",
        "title": "Dev Sync Call",
        "type": "video",
        "rawType": "VIDEO",
        "status": "ended",
        "rawStatus": "COMPLETED",
        "callerId": "6ac1441a77c9bedcf0d2cc01",
        "caller": { "name": "Praveen Caller", "email": "praveen@example.com" },
        "receiverId": "6ac1441a77c9bedcf0d2cc10",
        "receiver": { "name": "Aayush Receiver", "email": "aayush@example.com" },
        "startedAt": "10m ago",
        "endedAt": "8m ago",
        "durationSeconds": 120,
        "endReason": "NORMAL"
      }
    ],
    "count": 1
  }
}
```

---

### 1.3 Get Single Call Record
* **Method:** `GET`
* **URL:** `/api/projects/:projectId/calls/:callId`
* **Authentication:** Required (`Authorization: Bearer <JWT>`)
* **Required Permission:** Active Project Member

---

## 2. Socket.IO Real-Time & WebRTC Signaling Events

### 2.1 `call:incoming`
* **Direction:** Server → Receiver
* **Target Room:** `user:<receiverId>`
* **Trigger:** Emitted when caller calls `POST /api/projects/:projectId/calls`.
* **Payload:**
```json
{
  "callId": "6ac1441a77c9bedcf0d2cc16",
  "call": { ... },
  "caller": { "id": "...", "name": "Praveen", "avatar": null },
  "type": "video",
  "projectId": "6ac1441a77c9bedcf0d2cc05",
  "title": "Development Sync"
}
```
* **Expected Behavior:** Receiver UI displays `IncomingCallModal` with Accept and Decline buttons.

---

### 2.2 `call:accept`
* **Direction:** Receiver → Server
* **Validation:** Authenticated user must be the `receiver` and call must be in `RINGING` state.
* **Payload:** `{ "callId": "6ac1441a77c9bedcf0d2cc16" }`
* **Action:** Updates DB status to `ONGOING`, sets `answeredAt = new Date()`, and emits `call:accepted` to caller.

---

### 2.3 `call:accepted`
* **Direction:** Server → Caller
* **Target Room:** `user:<callerId>`
* **Payload:** `{ "callId": "...", "call": { ... } }`
* **Expected Behavior:** Caller initializes `RTCPeerConnection`, acquires media, creates SDP Offer, and emits `webrtc:offer`.

---

### 2.4 `call:reject`
* **Direction:** Receiver → Server
* **Validation:** Authenticated user must be the `receiver`.
* **Payload:** `{ "callId": "..." }`
* **Action:** Updates DB status to `DECLINED`, sets `endedAt = new Date()`, and emits `call:rejected` to caller.

---

### 2.5 `call:rejected`
* **Direction:** Server → Caller
* **Target Room:** `user:<callerId>`
* **Payload:** `{ "callId": "...", "call": { ... } }`
* **Expected Behavior:** Caller UI returns to idle state and displays "Call Declined" toast.

---

### 2.6 `call:cancel`
* **Direction:** Caller → Server
* **Validation:** Authenticated user must be the `caller`.
* **Payload:** `{ "callId": "..." }`
* **Action:** Updates DB status to `CANCELLED`, sets `endedAt = new Date()`, and emits `call:cancelled` to receiver.

---

### 2.7 `call:cancelled`
* **Direction:** Server → Receiver
* **Target Room:** `user:<receiverId>`
* **Payload:** `{ "callId": "...", "call": { ... } }`
* **Expected Behavior:** Receiver's `IncomingCallModal` dismisses.

---

### 2.8 `call:end`
* **Direction:** Caller OR Receiver → Server
* **Validation:** Authenticated user must be a participant in the call.
* **Payload:** `{ "callId": "..." }`
* **Action:** Calculates duration (`endedAt - answeredAt`), updates DB status to `COMPLETED`, and emits `call:ended` to the other peer.

---

### 2.9 `call:ended`
* **Direction:** Server → Other Participant
* **Target Room:** `user:<otherParticipantId>`
* **Payload:** `{ "callId": "...", "call": { ... }, "endedBy": "..." }`
* **Expected Behavior:** Cleans up WebRTC peer connection, stops local hardware media tracks, and updates UI to ended state.

---

### 2.10 `webrtc:offer`
* **Direction:** Caller → Server → Receiver
* **Payload:**
```json
{
  "callId": "6ac1441a77c9bedcf0d2cc16",
  "sdp": {
    "type": "offer",
    "sdp": "v=0\r\no=caller 12345 2 IN IP4 127.0.0.1..."
  }
}
```
* **Validation:** Verifies caller participates in `callId`.
* **Server Action:** Forwards to `user:<receiverId>`.
* **Receiver Action:** Calls `pc.setRemoteDescription(offer)`, creates SDP Answer, and emits `webrtc:answer`.

---

### 2.11 `webrtc:answer`
* **Direction:** Receiver → Server → Caller
* **Payload:**
```json
{
  "callId": "6ac1441a77c9bedcf0d2cc16",
  "sdp": {
    "type": "answer",
    "sdp": "v=0\r\no=receiver 12345 2 IN IP4 127.0.0.1..."
  }
}
```
* **Validation:** Verifies receiver participates in `callId`.
* **Server Action:** Forwards to `user:<callerId>`.
* **Caller Action:** Calls `pc.setRemoteDescription(answer)`.

---

### 2.12 `webrtc:ice-candidate`
* **Direction:** Peer A → Server → Peer B (Bidirectional)
* **Payload:**
```json
{
  "callId": "6ac1441a77c9bedcf0d2cc16",
  "candidate": {
    "candidate": "candidate:1 1 UDP 2122260223 127.0.0.1 50000 typ host",
    "sdpMid": "0",
    "sdpMLineIndex": 0
  }
}
```
* **Validation:** Verifies user participates in `callId`.
* **Server Action:** Forwards candidate to peer's private room.
* **Peer Action:** Calls `pc.addIceCandidate(candidate)`.
