const mongoose = require("mongoose");
const Call = require("../models/Call");
const callService = require("../services/callService");

/**
 * Register call and WebRTC signaling socket handlers
 */
const registerCallSocket = (io, socket) => {
  const user = socket.user;
  if (!user) return;
  const userId = user.id || user._id.toString();

  /**
   * Helper to verify call participation
   */
  const getCallParticipant = async (callId) => {
    if (!callId || !mongoose.Types.ObjectId.isValid(callId)) {
      const err = new Error("Valid call ID is required");
      err.code = "INVALID_CALL";
      throw err;
    }

    const call = await Call.findById(callId);
    if (!call) {
      const err = new Error("Call not found");
      err.code = "CALL_NOT_FOUND";
      throw err;
    }

    const callerId = call.caller.toString();
    const receiverId = call.receiver.toString();

    if (callerId !== userId && receiverId !== userId) {
      const err = new Error("Not authorized for this call session");
      err.code = "UNAUTHORIZED_CALL_PARTICIPANT";
      throw err;
    }

    const targetUserId = callerId === userId ? receiverId : callerId;
    return { call, callerId, receiverId, targetUserId };
  };

  /**
   * Accept call
   * Event: call:accept
   */
  socket.on("call:accept", async (data = {}, callback) => {
    try {
      const { callId } = data;
      const formatted = await callService.acceptCall(callId, userId);
      if (typeof callback === "function") {
        callback({ success: true, data: { call: formatted } });
      }
    } catch (err) {
      if (typeof callback === "function") {
        callback({ success: false, error: err.message });
      }
    }
  });

  /**
   * Reject call
   * Event: call:reject
   */
  socket.on("call:reject", async (data = {}, callback) => {
    try {
      const { callId } = data;
      const formatted = await callService.rejectCall(callId, userId);
      if (typeof callback === "function") {
        callback({ success: true, data: { call: formatted } });
      }
    } catch (err) {
      if (typeof callback === "function") {
        callback({ success: false, error: err.message });
      }
    }
  });

  /**
   * Cancel call before answer
   * Event: call:cancel
   */
  socket.on("call:cancel", async (data = {}, callback) => {
    try {
      const { callId } = data;
      const formatted = await callService.cancelCall(callId, userId);
      if (typeof callback === "function") {
        callback({ success: true, data: { call: formatted } });
      }
    } catch (err) {
      if (typeof callback === "function") {
        callback({ success: false, error: err.message });
      }
    }
  });

  /**
   * End ongoing or ringing call
   * Event: call:end
   */
  socket.on("call:end", async (data = {}, callback) => {
    try {
      const { callId } = data;
      const formatted = await callService.endCall(callId, userId);
      if (typeof callback === "function") {
        callback({ success: true, data: { call: formatted } });
      }
    } catch (err) {
      if (typeof callback === "function") {
        callback({ success: false, error: err.message });
      }
    }
  });

  /**
   * WebRTC Signaling: Offer
   * Event: webrtc:offer
   */
  socket.on("webrtc:offer", async (data = {}, callback) => {
    try {
      const { callId, sdp } = data;
      if (!sdp) throw new Error("SDP offer payload is required");

      const { targetUserId } = await getCallParticipant(callId);

      // Forward offer strictly to the target peer's private user room
      io.to(`user:${targetUserId}`).emit("webrtc:offer", {
        callId,
        sdp,
        fromUserId: userId,
      });

      if (typeof callback === "function") {
        callback({ success: true });
      }
    } catch (err) {
      if (typeof callback === "function") {
        callback({ success: false, error: err.message });
      }
    }
  });

  /**
   * WebRTC Signaling: Answer
   * Event: webrtc:answer
   */
  socket.on("webrtc:answer", async (data = {}, callback) => {
    try {
      const { callId, sdp } = data;
      if (!sdp) throw new Error("SDP answer payload is required");

      const { targetUserId } = await getCallParticipant(callId);

      // Forward answer strictly to the target peer's private user room
      io.to(`user:${targetUserId}`).emit("webrtc:answer", {
        callId,
        sdp,
        fromUserId: userId,
      });

      if (typeof callback === "function") {
        callback({ success: true });
      }
    } catch (err) {
      if (typeof callback === "function") {
        callback({ success: false, error: err.message });
      }
    }
  });

  /**
   * WebRTC Signaling: ICE Candidate
   * Event: webrtc:ice-candidate
   */
  socket.on("webrtc:ice-candidate", async (data = {}, callback) => {
    try {
      const { callId, candidate } = data;
      if (!candidate) throw new Error("ICE candidate payload is required");

      const { targetUserId } = await getCallParticipant(callId);

      // Forward ICE candidate strictly to the target peer's private user room
      io.to(`user:${targetUserId}`).emit("webrtc:ice-candidate", {
        callId,
        candidate,
        fromUserId: userId,
      });

      if (typeof callback === "function") {
        callback({ success: true });
      }
    } catch (err) {
      if (typeof callback === "function") {
        callback({ success: false, error: err.message });
      }
    }
  });
};

module.exports = { registerCallSocket };
