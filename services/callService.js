const mongoose = require("mongoose");
const Call = require("../models/Call");
const ProjectMembership = require("../models/ProjectMembership");
const User = require("../models/User");
const { getIO } = require("../sockets/ioStore");
const { createActivity } = require("./activityService");

/**
 * Format relative / readable time
 */
const formatTimeAgo = (date) => {
  if (!date) return "Just now";
  const now = new Date();
  const d = new Date(date);
  const diffMs = now - d;
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
};

/**
 * Format call document for API and Socket responses
 */
const formatCall = (call) => {
  const c = call.toJSON ? call.toJSON() : call;

  const callerId = c.caller ? (c.caller._id ? c.caller._id.toString() : c.caller.toString()) : null;
  const receiverId = c.receiver ? (c.receiver._id ? c.receiver._id.toString() : c.receiver.toString()) : null;

  const callerObj =
    c.caller && typeof c.caller === "object" && c.caller.name
      ? {
          id: callerId,
          _id: callerId,
          name: c.caller.name,
          email: c.caller.email,
          avatar: c.caller.avatar,
          avatarColor: c.caller.avatarColor || "#00E5A3",
        }
      : { id: callerId, _id: callerId, name: "Caller" };

  const receiverObj =
    c.receiver && typeof c.receiver === "object" && c.receiver.name
      ? {
          id: receiverId,
          _id: receiverId,
          name: c.receiver.name,
          email: c.receiver.email,
          avatar: c.receiver.avatar,
          avatarColor: c.receiver.avatarColor || "#8B5CF6",
        }
      : { id: receiverId, _id: receiverId, name: "Receiver" };

  const typeLower = (c.type || "VIDEO").toLowerCase() === "audio" ? "voice" : "video";
  const statusLower =
    c.status === "ONGOING"
      ? "active"
      : c.status === "COMPLETED" || c.status === "DECLINED" || c.status === "CANCELLED" || c.status === "MISSED"
      ? "ended"
      : c.status.toLowerCase();

  const participantIds = [callerId, receiverId].filter(Boolean);

  return {
    id: c._id ? c._id.toString() : c.id,
    _id: c._id ? c._id.toString() : c.id,
    projectId: c.project ? (c.project._id ? c.project._id.toString() : c.project.toString()) : null,
    project: c.project,
    title: c.title || `${typeLower === "video" ? "Video" : "Voice"} Call`,
    type: typeLower,
    rawType: c.type,
    status: statusLower,
    rawStatus: c.status,
    callerId,
    caller: callerObj,
    receiverId,
    receiver: receiverObj,
    hostId: callerId,
    participantIds,
    startedAt: formatTimeAgo(c.startedAt || c.createdAt),
    answeredAt: c.answeredAt,
    endedAt: c.endedAt ? formatTimeAgo(c.endedAt) : null,
    durationSeconds: c.duration || 0,
    duration: c.duration || 0,
    endReason: c.endReason,
    createdAt: c.createdAt,
    speakingParticipantId: null,
    connectionQuality: "Good",
  };
};

/**
 * Start a new call (POST /api/projects/:projectId/calls)
 */
const createCall = async ({ projectId, callerId, receiverId, type = "VIDEO", title = "" }) => {
  if (!receiverId || !mongoose.Types.ObjectId.isValid(receiverId)) {
    const error = new Error("Valid receiver ID is required");
    error.statusCode = 400;
    throw error;
  }

  const callerIdStr = callerId.toString();
  const receiverIdStr = receiverId.toString();

  if (callerIdStr === receiverIdStr) {
    const error = new Error("You cannot start a call with yourself");
    error.statusCode = 400;
    throw error;
  }

  // Verify receiver is an active member in project
  const receiverMembership = await ProjectMembership.findOne({
    project: projectId,
    user: receiverId,
    status: "ACTIVE",
  });

  if (!receiverMembership) {
    const error = new Error("Receiver is not an active member of this project");
    error.statusCode = 403;
    throw error;
  }

  // Check if receiver is already in an ongoing call
  const activeOngoing = await Call.findOne({
    project: projectId,
    status: "ONGOING",
    $or: [{ caller: receiverId }, { receiver: receiverId }],
  });

  if (activeOngoing) {
    const error = new Error("User is currently busy in another call");
    error.statusCode = 409;
    error.code = "USER_BUSY";
    throw error;
  }

  const normalizedType = (type || "VIDEO").toUpperCase() === "AUDIO" || (type || "").toLowerCase() === "voice"
    ? "AUDIO"
    : "VIDEO";

  const defaultTitle = `${normalizedType === "VIDEO" ? "Video" : "Voice"} Call`;

  const newCall = await Call.create({
    project: projectId,
    caller: callerId,
    receiver: receiverId,
    title: (title || "").trim() || defaultTitle,
    type: normalizedType,
    status: "RINGING",
    startedAt: new Date(),
  });

  await newCall.populate([
    { path: "caller", select: "name email avatar avatarColor" },
    { path: "receiver", select: "name email avatar avatarColor" },
    { path: "project", select: "name description" },
  ]);

  const formatted = formatCall(newCall);

  // Emit real-time call:incoming to receiver private room
  try {
    const io = getIO();
    if (io) {
      io.to(`user:${receiverIdStr}`).emit("call:incoming", {
        callId: formatted.id,
        call: formatted,
        caller: formatted.caller,
        type: formatted.type,
        projectId: formatted.projectId,
        title: formatted.title,
      });
    }
  } catch (err) {
    console.warn("Socket call:incoming emit warning:", err.message);
  }

  return formatted;
};

/**
 * Get call history for project
 */
const getCalls = async (projectId, userId, query = {}) => {
  const filter = {
    project: projectId,
    $or: [{ caller: userId }, { receiver: userId }],
  };

  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 30));
  const skip = (page - 1) * limit;

  const calls = await Call.find(filter)
    .populate("caller", "name email avatar avatarColor")
    .populate("receiver", "name email avatar avatarColor")
    .populate("project", "name description")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  return calls.map(formatCall);
};

/**
 * Get single call by ID
 */
const getCallById = async (callId, projectId = null, userId = null) => {
  if (!mongoose.Types.ObjectId.isValid(callId)) return null;

  const query = { _id: callId };
  if (projectId) query.project = projectId;

  const call = await Call.findOne(query)
    .populate("caller", "name email avatar avatarColor")
    .populate("receiver", "name email avatar avatarColor")
    .populate("project", "name description");

  if (!call) return null;

  return formatCall(call);
};

/**
 * Accept call
 */
const acceptCall = async (callId, userId) => {
  if (!mongoose.Types.ObjectId.isValid(callId)) {
    const error = new Error("Invalid call ID");
    error.statusCode = 400;
    throw error;
  }

  const call = await Call.findById(callId).populate([
    { path: "caller", select: "name email avatar avatarColor" },
    { path: "receiver", select: "name email avatar avatarColor" },
    { path: "project", select: "name description" },
  ]);

  if (!call) {
    const error = new Error("Call not found");
    error.statusCode = 404;
    throw error;
  }

  if (call.receiver._id.toString() !== userId.toString()) {
    const error = new Error("Only the call receiver can accept this call");
    error.statusCode = 403;
    throw error;
  }

  if (call.status !== "RINGING") {
    const error = new Error(`Call cannot be accepted because it is already ${call.status.toLowerCase()}`);
    error.statusCode = 400;
    throw error;
  }

  call.status = "ONGOING";
  call.answeredAt = new Date();
  await call.save();

  const formatted = formatCall(call);

  // Notify caller
  try {
    const io = getIO();
    if (io) {
      io.to(`user:${call.caller._id.toString()}`).emit("call:accepted", {
        callId: formatted.id,
        call: formatted,
      });
    }
  } catch (err) {
    console.warn("Socket call:accepted emit warning:", err.message);
  }

  return formatted;
};

/**
 * Reject call
 */
const rejectCall = async (callId, userId) => {
  if (!mongoose.Types.ObjectId.isValid(callId)) {
    const error = new Error("Invalid call ID");
    error.statusCode = 400;
    throw error;
  }

  const call = await Call.findById(callId).populate("caller receiver project");
  if (!call) {
    const error = new Error("Call not found");
    error.statusCode = 404;
    throw error;
  }

  if (call.receiver._id.toString() !== userId.toString()) {
    const error = new Error("Only the call receiver can reject this call");
    error.statusCode = 403;
    throw error;
  }

  call.status = "DECLINED";
  call.endedAt = new Date();
  call.endReason = "DECLINED";
  await call.save();

  const formatted = formatCall(call);

  // Notify caller
  try {
    const io = getIO();
    if (io) {
      io.to(`user:${call.caller._id.toString()}`).emit("call:rejected", {
        callId: formatted.id,
        call: formatted,
      });
    }
  } catch (err) {
    console.warn("Socket call:rejected emit warning:", err.message);
  }

  return formatted;
};

/**
 * Cancel call before answer
 */
const cancelCall = async (callId, userId) => {
  if (!mongoose.Types.ObjectId.isValid(callId)) {
    const error = new Error("Invalid call ID");
    error.statusCode = 400;
    throw error;
  }

  const call = await Call.findById(callId).populate("caller receiver project");
  if (!call) {
    const error = new Error("Call not found");
    error.statusCode = 404;
    throw error;
  }

  if (call.caller._id.toString() !== userId.toString()) {
    const error = new Error("Only the caller can cancel this call");
    error.statusCode = 403;
    throw error;
  }

  call.status = "CANCELLED";
  call.endedAt = new Date();
  call.endReason = "CANCELLED";
  await call.save();

  const formatted = formatCall(call);

  // Notify receiver
  try {
    const io = getIO();
    if (io) {
      io.to(`user:${call.receiver._id.toString()}`).emit("call:cancelled", {
        callId: formatted.id,
        call: formatted,
      });
    }
  } catch (err) {
    console.warn("Socket call:cancelled emit warning:", err.message);
  }

  return formatted;
};

/**
 * End an ongoing or ringing call
 */
const endCall = async (callId, userId) => {
  if (!mongoose.Types.ObjectId.isValid(callId)) {
    const error = new Error("Invalid call ID");
    error.statusCode = 400;
    throw error;
  }

  const call = await Call.findById(callId).populate("caller receiver project");
  if (!call) {
    const error = new Error("Call not found");
    error.statusCode = 404;
    throw error;
  }

  const callerIdStr = call.caller._id.toString();
  const receiverIdStr = call.receiver._id.toString();
  const userIdStr = userId.toString();

  if (callerIdStr !== userIdStr && receiverIdStr !== userIdStr) {
    const error = new Error("You are not a participant in this call");
    error.statusCode = 403;
    throw error;
  }

  if (call.status === "COMPLETED" || call.status === "DECLINED" || call.status === "CANCELLED" || call.status === "MISSED") {
    return formatCall(call);
  }

  const now = new Date();
  let duration = 0;
  if (call.answeredAt) {
    duration = Math.max(0, Math.round((now - call.answeredAt) / 1000));
  }

  call.status = "COMPLETED";
  call.endedAt = now;
  call.duration = duration;
  call.endReason = "NORMAL";
  await call.save();

  const otherParticipantId = callerIdStr === userIdStr ? receiverIdStr : callerIdStr;
  const formatted = formatCall(call);

  // Notify other participant
  try {
    const io = getIO();
    if (io) {
      io.to(`user:${otherParticipantId}`).emit("call:ended", {
        callId: formatted.id,
        call: formatted,
        endedBy: userIdStr,
      });
    }
  } catch (err) {
    console.warn("Socket call:ended emit warning:", err.message);
  }

  return formatted;
};

module.exports = {
  formatCall,
  createCall,
  getCalls,
  getCallById,
  acceptCall,
  rejectCall,
  cancelCall,
  endCall,
};
