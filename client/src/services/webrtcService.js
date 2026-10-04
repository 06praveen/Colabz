import webrtcConfig from '../config/webrtc';

export const webrtcService = {
  /**
   * Acquire local audio/video media stream with user-friendly error translations
   */
  async getLocalMedia({ audio = true, video = true }) {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      const err = new Error('Your browser does not support media device capture.');
      err.userFriendly = 'Media capture is not supported in this browser.';
      throw err;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: audio ? { echoCancellation: true, noiseSuppression: true, autoGainControl: true } : false,
        video: video ? { width: { ideal: 1280 }, height: { ideal: 720 }, frameRate: { max: 30 } } : false,
      });
      return stream;
    } catch (error) {
      let friendlyMessage = 'Unable to access your media devices.';
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        friendlyMessage = video
          ? 'Camera and microphone permissions were denied. Please allow access in your browser settings.'
          : 'Microphone permission was denied. Please allow access in your browser settings.';
      } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        friendlyMessage = video
          ? 'No camera or microphone was found on your device.'
          : 'No microphone was found on your device.';
      } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
        friendlyMessage = 'Your camera or microphone is currently being used by another application.';
      } else if (error.name === 'OverconstrainedError') {
        friendlyMessage = 'Your media devices do not satisfy the requested video resolution.';
      } else if (error.name === 'SecurityError') {
        friendlyMessage = 'Media device access requires a secure HTTPS connection or localhost.';
      }

      const enhancedError = new Error(friendlyMessage);
      enhancedError.originalError = error;
      enhancedError.userFriendly = friendlyMessage;
      throw enhancedError;
    }
  },

  /**
   * Initialize a new RTCPeerConnection instance
   */
  createPeerConnection({ onTrack, onIceCandidate, onConnectionStateChange }) {
    const pc = new RTCPeerConnection(webrtcConfig);
    pc.pendingCandidates = [];

    pc.onicecandidate = (event) => {
      if (event.candidate && onIceCandidate) {
        onIceCandidate(event.candidate);
      }
    };

    pc.ontrack = (event) => {
      if (onTrack && event.streams && event.streams[0]) {
        onTrack(event.streams[0]);
      }
    };

    pc.onconnectionstatechange = () => {
      if (onConnectionStateChange) {
        onConnectionStateChange(pc.connectionState);
      }
    };

    pc.oniceconnectionstatechange = () => {
      // Monitor iceConnectionState
    };

    return pc;
  },

  /**
   * Attach local media stream tracks to RTCPeerConnection
   */
  addLocalTracks(pc, stream) {
    if (!pc || !stream) return;
    stream.getTracks().forEach((track) => {
      try {
        pc.addTrack(track, stream);
      } catch (err) {
        console.warn('Track already added or failed:', err.message);
      }
    });
  },

  /**
   * Create SDP Offer
   */
  async createOffer(pc) {
    if (!pc) return null;
    const offer = await pc.createOffer({
      offerToReceiveAudio: true,
      offerToReceiveVideo: true,
    });
    await pc.setLocalDescription(offer);
    return pc.localDescription;
  },

  /**
   * Create SDP Answer in response to a remote Offer
   */
  async createAnswer(pc, remoteOfferSdp) {
    if (!pc || !remoteOfferSdp) return null;
    await pc.setRemoteDescription(new RTCSessionDescription(remoteOfferSdp));

    // Process any ICE candidates received before remote description was ready
    if (pc.pendingCandidates && pc.pendingCandidates.length > 0) {
      for (const cand of pc.pendingCandidates) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(cand));
        } catch (err) {
          console.warn('Pending candidate addition warning:', err.message);
        }
      }
      pc.pendingCandidates = [];
    }

    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    return pc.localDescription;
  },

  /**
   * Set remote Answer on caller's RTCPeerConnection
   */
  async setRemoteAnswer(pc, remoteAnswerSdp) {
    if (!pc || !remoteAnswerSdp) return;
    if (pc.signalingState === 'have-local-offer') {
      await pc.setRemoteDescription(new RTCSessionDescription(remoteAnswerSdp));

      // Process any ICE candidates received before remote answer was ready
      if (pc.pendingCandidates && pc.pendingCandidates.length > 0) {
        for (const cand of pc.pendingCandidates) {
          try {
            await pc.addIceCandidate(new RTCIceCandidate(cand));
          } catch (err) {
            console.warn('Pending candidate addition warning:', err.message);
          }
        }
        pc.pendingCandidates = [];
      }
    }
  },

  /**
   * Add ICE candidate to RTCPeerConnection safely
   */
  async addIceCandidate(pc, candidate) {
    if (!pc || !candidate) return;
    try {
      if (pc.remoteDescription && pc.remoteDescription.type) {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      } else {
        if (!pc.pendingCandidates) pc.pendingCandidates = [];
        pc.pendingCandidates.push(candidate);
      }
    } catch (err) {
      console.warn('Failed to add ICE candidate:', err.message);
    }
  },

  /**
   * Toggle audio track (Mute/Unmute)
   */
  toggleAudioTrack(stream, enabled) {
    if (!stream) return false;
    const audioTracks = stream.getAudioTracks();
    audioTracks.forEach((track) => {
      track.enabled = enabled;
    });
    return enabled;
  },

  /**
   * Toggle video track (Camera On/Off)
   */
  toggleVideoTrack(stream, enabled) {
    if (!stream) return false;
    const videoTracks = stream.getVideoTracks();
    videoTracks.forEach((track) => {
      track.enabled = enabled;
    });
    return enabled;
  },

  /**
   * Stop all tracks on a MediaStream
   */
  stopMediaStream(stream) {
    if (!stream) return;
    stream.getTracks().forEach((track) => {
      try {
        track.stop();
      } catch (err) {
        // ignore
      }
    });
  },

  /**
   * Cleanly close RTCPeerConnection and release media devices
   */
  cleanup(pc, localStream, remoteStream) {
    if (localStream) {
      this.stopMediaStream(localStream);
    }
    if (remoteStream) {
      this.stopMediaStream(remoteStream);
    }
    if (pc) {
      try {
        pc.ontrack = null;
        pc.onicecandidate = null;
        pc.onconnectionstatechange = null;
        pc.oniceconnectionstatechange = null;
        pc.close();
      } catch (err) {
        // ignore
      }
    }
  },
};

export default webrtcService;
