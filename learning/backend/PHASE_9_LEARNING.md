# Colabz Phase 9 — Voice & Video Calling, WebRTC & Socket.IO Signaling (Comprehensive Guide)

---

## 1. What is WebRTC?

**WebRTC (Web Real-Time Communication)** is an open-source standard and browser technology that enables direct peer-to-peer (P2P) audio, video, and data streaming between web browsers and mobile devices without requiring third-party plugins or dedicated media streaming relay servers for standard connections.

---

## 2. Why WebRTC is Used for Audio & Video

Traditional web protocols like HTTP/HTTPS and WebSocket work over TCP (Transmission Control Protocol). TCP guarantees delivery by retransmitting lost packets, which introduces **latency (lag and buffering)**. 

Live conversational audio and video require **ultra-low latency (<200ms)**. WebRTC uses **UDP (User Datagram Protocol)** and **SRTP (Secure Real-time Transport Protocol)** to stream media instantaneously. If a video frame or audio packet drops, the browser skips it rather than stalling the conversation.

---

## 3. WebRTC vs. Socket.IO

Understanding the division of responsibilities is the most important architectural concept in real-time communication systems:

```text
+-------------------------------------------------------------------+
|                        COLABZ CALL SYSTEM                         |
+---------------------------------+---------------------------------+
|      Socket.IO (Signaling)      |         WebRTC (Media)          |
+---------------------------------+---------------------------------+
| • Carries text/JSON metadata    | • Carries live audio & video    |
| • Client-to-Server-to-Client    | • Direct Peer-to-Peer           |
| • Sends Offer, Answer, ICE      | • High-bandwidth media streams  |
| • Manages Call State & Ringing  | • Low-latency UDP/SRTP          |
| • Low bandwidth (<1 KB/s)       | • High bandwidth (500 KB - 3MB) |
+---------------------------------+---------------------------------+
```

---

## 4. What is Signaling?

Browsers cannot connect to each other blindly across the internet because they do not know:
1. The peer's public/private IP addresses and open UDP ports.
2. The supported audio/video codecs, resolutions, and media capabilities.
3. Cryptographic session keys for encrypting media.

**Signaling** is the discovery phase where peers exchange this connection metadata via a shared intermediary server (our Node.js + Socket.IO backend) before the direct WebRTC peer connection can be established.

---

## 5. What is an SDP Offer?

**SDP (Session Description Protocol) Offer** is a standardized text description created by the initiating peer (`caller`) containing:
* What media is being sent (Audio, Video).
* Supported codecs (e.g. Opus, VP8, H.264, VP9).
* Media transfer protocols, bandwidth specifications, and cryptographic fingerprints (DTLS/SRTP).

Generated via:
```js
const offer = await peerConnection.createOffer();
await peerConnection.setLocalDescription(offer);
```

---

## 6. What is an SDP Answer?

When the receiving peer (`callee`) accepts the incoming call and receives the SDP Offer, they generate an **SDP Answer** confirming compatible codecs and encryption keys:

```js
await peerConnection.setRemoteDescription(new RTCSessionDescription(offerSdp));
const answer = await peerConnection.createAnswer();
await peerConnection.setLocalDescription(answer);
```

The Answer is sent back to the caller over Socket.IO, who sets it as their `remoteDescription`.

---

## 7. What are ICE Candidates?

**ICE (Interactive Connectivity Establishment)** candidates represent potential network pathways (IP addresses, port numbers, and transport protocols) through which two peers can reach each other.

As the browser discovers network interfaces (local LAN, Wi-Fi, public NAT IP), it fires:
```js
peerConnection.onicecandidate = (event) => {
  if (event.candidate) {
    socket.emit("webrtc:ice-candidate", { callId, candidate: event.candidate });
  }
};
```
Both peers exchange ICE candidates over Socket.IO and test connectivity until the optimal path is chosen.

---

## 8. What is STUN?

**STUN (Session Traversal Utilities for NAT)** is a lightweight protocol used to discover a device's public IP address and port mapping behind a NAT (Network Address Translation) router or home firewall.

* Google provides public STUN servers for development: `stun:stun.l.google.com:19302`.
* STUN is cost-effective because the STUN server only answers discovery requests; it **never relays audio/video data**.

---

## 9. What is TURN?

**TURN (Traversal Using Relays around NAT)** is a fallback relay server used when symmetric NATs or strict corporate firewalls block direct P2P connections. When STUN fails, both peers stream their encrypted media to the TURN server, which relays it between them.

* **College Project Note:** For development and localhost testing, STUN + P2P WebRTC is sufficient. Production deployments across strict cellular or enterprise firewalls require TURN infrastructure (e.g. Coturn).

---

## 10. What is `RTCPeerConnection`?

`RTCPeerConnection` is the core JavaScript API in browsers representing the active WebRTC connection between two peers. It handles:
* SDP Offer/Answer negotiation.
* ICE candidate gathering and connectivity checks.
* Bandwidth estimation, packet loss recovery, and jitter buffering.
* Encryption/Decryption using DTLS/SRTP.
* Stream multiplexing and track dispatching (`ontrack`).

---

## 11. What is `MediaStream`?

A `MediaStream` represents synchronized streams of audio and video tracks acquired from local hardware (webcam, microphone) or received remotely from a peer:
* `stream.getAudioTracks()` — array of `MediaStreamTrack` for sound.
* `stream.getVideoTracks()` — array of `MediaStreamTrack` for visual frames.

---

## 12. `getUserMedia()`

Acquires access to local cameras and microphones:

```js
const stream = await navigator.mediaDevices.getUserMedia({
  audio: { echoCancellation: true, noiseSuppression: true },
  video: { width: { ideal: 1280 }, height: { ideal: 720 } }
});
```

Must handle error cases gracefully:
* `NotAllowedError` — User denied camera/microphone permissions.
* `NotFoundError` — No physical webcam/mic hardware detected.
* `NotReadableError` — Hardware in use by another program (e.g. Zoom).

---

## 13. Mute & Camera Toggle Mechanisms

To mute audio or disable the camera, **never destroy or renegotiate the WebRTC connection**. Instead, toggle the `enabled` property on the existing media track:

```js
// Mute / Unmute
stream.getAudioTracks().forEach(track => { track.enabled = false; });

// Camera Off / On
stream.getVideoTracks().forEach(track => { track.enabled = false; });
```

When `track.enabled = false`:
* Audio sends silence (no microphone capture).
* Video sends black/empty frames.
* The P2P session remains active with zero reconnection delay.

---

## 14. WebRTC Complete Connection Lifecycle

```text
1. CALLER: POST /api/projects/:projectId/calls (status: RINGING)
2. SERVER: Emits call:incoming to user:<receiverId>
3. RECEIVER: Pops IncomingCallModal -> clicks "Accept"
4. RECEIVER: Emits call:accept -> Server updates status to ONGOING
5. SERVER: Emits call:accepted to user:<callerId>
6. CALLER: getUserMedia() -> creates RTCPeerConnection -> addTrack()
7. CALLER: createOffer() -> setLocalDescription() -> emits webrtc:offer
8. RECEIVER: getUserMedia() -> setRemoteDescription(offer) -> createAnswer() -> emits webrtc:answer
9. CALLER: setRemoteDescription(answer)
10. PEERS: Exchange webrtc:ice-candidate until direct P2P connection is CONNECTED
11. ONTRACK: Remote video/audio stream renders on screen
```

---

## 15. Call State Machine

```text
           [ IDLE ]
              │
     (Initiate Call)
              ▼
        [ OUTGOING ] ──(Receiver Declines)──► [ DECLINED / IDLE ]
              │
    (Receiver Accepts)
              ▼
       [ CONNECTING ]
              │
      (WebRTC Connected)
              ▼
        [ ACTIVE ]
              │
         (End Call)
              ▼
         [ ENDED ] ──► [ IDLE ]
```

---

## 16. Call History Persistence in MongoDB

All call records are stored in MongoDB with indexed query performance:
* `project`: Project workspace identifier.
* `caller`: Authenticated user who initiated the call.
* `receiver`: Target team member.
* `type`: `AUDIO` or `VIDEO`.
* `status`: `RINGING`, `ONGOING`, `COMPLETED`, `DECLINED`, `CANCELLED`, `MISSED`.
* `duration`: Exact elapsed duration in seconds calculated on server (`endedAt - answeredAt`).

---

## 17. Socket Authentication & Private Rooms

All signaling events require JWT socket authentication. Sockets join private user rooms (`user:<userId>`). Signaling messages (`webrtc:offer`, `webrtc:answer`, `webrtc:ice-candidate`) are routed strictly between validated call participants.

---

## 18. Security Considerations

1. **No Caller Impersonation:** Server extracts caller identity directly from `socket.user.id` or `req.user.id`.
2. **Project Boundary Protection:** Calls cannot be initiated between users who are not active members of the same project.
3. **Signaling Tamper Protection:** When a peer emits `webrtc:offer` or `webrtc:ice-candidate`, the backend verifies that the socket user is an authorized participant (`caller` or `receiver`) of `callId` before forwarding.
4. **No Global Broadcasts:** Signaling events are emitted only to the target participant's private user room (`user:<targetUserId>`).

---

## 19. Why Actual Media Should NOT Go Through Socket.IO

1. **Server CPU & Memory Exhaustion:** Transmitting video over WebSocket forces the Node.js server to serialize, buffer, and rebroadcast megabytes of binary frames per second, crashing the event loop.
2. **TCP Latency / Head-of-Line Blocking:** WebSocket uses TCP. If one packet drops, all subsequent frames are stalled waiting for retransmission.
3. **P2P Efficiency:** WebRTC connects devices directly over UDP without consuming server bandwidth or adding server latency.

---

## 20. Top 25 Interview & Viva Questions

### Q1: What is WebRTC?
**Answer:** An open-source framework enabling real-time, peer-to-peer audio, video, and arbitrary data communication directly between browsers without plugins or intermediary media servers.

### Q2: What is the difference between WebRTC and Socket.IO?
**Answer:** WebRTC handles the actual real-time audio/video transmission peer-to-peer over UDP/SRTP. Socket.IO is used exclusively as the signaling channel to exchange connection metadata (SDP offers, answers, ICE candidates) before WebRTC connects.

### Q3: What is Signaling in WebRTC?
**Answer:** The process of discovering peers, agreeing on media codecs, and exchanging network connection details (IPs/ports) via a shared signaling server prior to establishing a direct P2P link.

### Q4: What is SDP (Session Description Protocol)?
**Answer:** A text-based format describing multimedia communication parameters, including codecs (Opus, VP8), protocols, cryptographic fingerprints, and media types.

### Q5: What is an SDP Offer?
**Answer:** The initial session description generated by the calling peer (`createOffer`) containing their proposed media configuration.

### Q6: What is an SDP Answer?
**Answer:** The response session description generated by the receiving peer (`createAnswer`) confirming compatible media parameters.

### Q7: What are ICE Candidates?
**Answer:** Network connectivity options (local IP, public NAT IP, port, protocol) discovered by the browser and exchanged between peers to find the best communication route.

### Q8: What is a STUN Server?
**Answer:** A server that inspects incoming UDP packets to tell a browser its public IP address and port mapping when behind a NAT router.

### Q9: What is a TURN Server and when is it required?
**Answer:** A relay server used when symmetric NATs or strict firewalls prevent direct peer-to-peer connections. Both peers stream their encrypted media to the TURN server, which relays packets between them.

### Q10: Does Socket.IO carry video in this application?
**Answer:** No. Socket.IO carries only lightweight signaling JSON messages (<1 KB). All audio and video streams flow directly between peers via WebRTC.

### Q11: What is `getUserMedia()`?
**Answer:** A Web API method on `navigator.mediaDevices` that prompts the user for permission to capture audio from microphones and video from webcams.

### Q12: How does mute work without dropping the call?
**Answer:** By setting `track.enabled = false` on the audio `MediaStreamTrack`. This pauses microphone capture and transmits silence while keeping the WebRTC peer connection intact.

### Q13: How does camera toggle (on/off) work?
**Answer:** By setting `track.enabled = false` on the video `MediaStreamTrack`, which sends black frames without tearing down the peer connection.

### Q14: How is call duration calculated accurately?
**Answer:** The backend calculates `duration = Math.round((endedAt - answeredAt) / 1000)` on the server when the call status changes to `COMPLETED`, ensuring client clock tampering cannot forge history.

### Q15: Why is `muted={true}` set on local `<video>` elements?
**Answer:** To prevent local audio playback through the user's own speakers, which would cause an acoustic feedback echo loop.

### Q16: What happens when a peer closes their browser tab unexpectedly?
**Answer:** The RTCPeerConnection enters a `disconnected` / `failed` state on the remaining peer, and the socket disconnect event alerts the server to mark the call completed and notify the other party.

### Q17: What is peer-to-peer (P2P) communication?
**Answer:** Direct communication between two client devices without routing data through an intermediary application server.

### Q18: What is the purpose of `pc.pendingCandidates` queue?
**Answer:** To store ICE candidates received from the signaling server before `setRemoteDescription()` has been called, preventing candidate drop errors.

### Q19: Why must all media tracks be stopped on call end?
**Answer:** Calling `track.stop()` releases hardware camera and microphone locks, turning off the physical recording indicators (green/orange camera LEDs) in the user's operating system.

### Q20: What permissions and context are required for `getUserMedia`?
**Answer:** A secure context (HTTPS) or `localhost`, plus explicit user browser permission.

### Q21: What are compound indexes in MongoDB and why are they used for calls?
**Answer:** Indexes spanning multiple fields (e.g. `{ project: 1, createdAt: -1 }`). They allow sorting and filtering call history for a project in a single index scan.

### Q22: What is the difference between a DECLINED call and a MISSED call?
**Answer:** A `DECLINED` call occurs when the receiver explicitly clicks "Decline", whereas a `MISSED` call occurs when the call rings until timeout without user interaction.

### Q23: Why should signaling events be restricted to private socket rooms (`user:<userId>`)?
**Answer:** To prevent eavesdropping and unauthorized manipulation of WebRTC session descriptions by other users in the project or public socket rooms.

### Q24: Can WebRTC establish a connection without a signaling server?
**Answer:** No. Even though media is P2P, peers have no way to discover each other's IP addresses, ports, and encryption keys without an initial signaling channel.

### Q25: What codecs are typically negotiated in WebRTC?
**Answer:** **Opus** for high-quality adaptive audio, and **VP8**, **VP9**, or **H.264** for video.

---

## 21. Practical Exercises

1. **Start a 1-to-1 Video Call:** Select a project teammate from the modal, initiate the call, and verify status `RINGING` is created in MongoDB.
2. **Verify Incoming Modal:** Observe `IncomingCallModal` pop up on the receiver's browser session with caller details and ring animation.
3. **Accept Call & Establish Media:** Click "Accept" on the receiver and verify local and remote video streams appear on both browser windows.
4. **Test Microphone Mute:** Toggle mute and verify the microphone icon changes to `MicOff` without interrupting the video stream.
5. **Test Camera Toggle:** Turn camera off and observe the avatar placeholder rendered in place of the live video stream.
6. **Inspect Socket.IO Signaling Events:** Check browser network/console logs for `webrtc:offer`, `webrtc:answer`, and `webrtc:ice-candidate` JSON payloads.
7. **Test End Call & Cleanup:** Click "End Call" and verify hardware indicators turn off and status updates to `COMPLETED` with duration recorded.
8. **Test Call Decline Flow:** Initiate a call and decline it on the receiver side; verify caller receives `call:rejected` and record status is `DECLINED`.
9. **Test Call Cancel Flow:** Initiate a call and click "Cancel Call" before answer; verify receiver modal dismisses and status is `CANCELLED`.
10. **Test Security Authorization:** Attempt to send signaling messages using a random or foreign call ID and verify the backend blocks it with `UNAUTHORIZED_CALL_PARTICIPANT`.
