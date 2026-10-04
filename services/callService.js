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
 * Format user object safely
 */
const formatUserObj = (u, fallbackName = "User") => {
  if (!u) return { id: null, _id: null, name: fallbackName };
  const id = u._id ? u._id.toString() : (u.id || u.toString());
  if (typeof u === "object" && u.name) {
    return {
      id,
      _id: id,
      name: u.name,
      username: u.username || "",
      email: u.email,
      avatar: u.avatar || null,
      avatarColor: u.avatarColor || "#00E5A3",
    };
  }
  return { id, _id: id, name: fallbackName };
};

/**
 * Format call document for API and Socket responses
 */
const formatCall = (call) => {
  const c = call.toJSON ? call.toJSON() : call;

  const callerId = c.caller ? (c.caller._id ? c.caller._id.toString() : c.caller.toString()) : null;
  const receiverId = c.receiver ? (c.receiver._id ? c.receiver._id.toString() : c.receiver.toString()) : null;

  const callerObj = formatUserObj(c.caller, "Caller");
  const receiverObj = c.receiver ? formatUserObj(c.receiver, "Receiver") : null;

  const participantsList = Array.isArray(c.participants)
    ? c.participants.map((p) => formatUserObj(p, "Participant"))
    : [];

  const acceptedParticipantsList = Array.isArray(c.acceptedParticipants)
    ? c.acceptedParticipants.map((p) => formatUserObj(p, "Participant"))
    : [];

  const typeLower = (c.type || "VIDEO").toLowerCase() === "audio" ? "voice" : "video";
  const statusLower =
    c.status === "ONGOING"
      ? "active"
      : c.status === "COMPLETED" || c.status === "DECLINED" || c.status === "CANCELLED" || c.status === "MISSED"
      ? "ended"
      : c.status.toLowerCase();

  // All active and invited participant IDs
  const allParticipantIds = new Set();
  if (callerId) allParticipantIds.add(callerId);
  if (receiverId) allParticipantIds.add(receiverId);
  if (Array.isArray(c.participants)) {
    c.participants.forEach((p) => {
      const pid = p._id ? p._id.toString() : p.toString();
      if (pid) allParticipantIds.add(pid);
    });
  }

  const participantIds = Array.from(allParticipantIds);

  const isGroup = Boolean(c.isGroup || (c.participants && c.participants.length > 1));

  return {
    id: c._id ? c._id.toString() : c.id,
    _id: c._id ? c._id.toString() : c.id,
    projectId: c.project ? (c.project._id ? c.project._id.toString() : c.project.toString()) : null,
    project: c.project,
    title: c.title || (isGroup ? `Group ${typeLower === "video" ? "Video" : "Voice"} Call` : `${typeLower === "video" ? "Video" : "Voice"} Call`),
    type: typeLower,
    rawType: c.type,
    isGroup,
    status: statusLower,
    rawStatus: c.status,
    callerId,
    caller: callerObj,
    receiverId,
    receiver: receiverObj,
    participants: participantsList,
    acceptedParticipants: acceptedParticipantsList,
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
 * Supports 1-on-1 calls (receiverId) and Group calls (participantIds, isGroup: true)
 */
const createCall = async (arg1, arg2, arg3) => {
  let params = {};
  if (arg1 && typeof arg1 === "object" && !arg2) {
    params = arg1;
  } else {
    params = {
      projectId: arg1,
      callerId: arg2,
      ...(arg3 || {}),
    };
  }

  const { projectId, callerId, receiverId, participantIds = [], isGroup = false, type = "VIDEO", title = "" } = params;
  const callerIdStr = callerId ? callerId.toString() : "";

  const normalizedType = (type || "VIDEO").toUpperCase() === "AUDIO" || (type || "").toLowerCase() === "voice"
    ? "AUDIO"
    : "VIDEO";

  let targetParticipantIds = [];
  let isGroupCall = isGroup;

  if (Array.isArray(participantIds) && participantIds.length > 0) {
    targetParticipantIds = participantIds.map((id) => id.toString()).filter((id) => id !== callerIdStr);
    if (targetParticipantIds.length > 1) {
      isGroupCall = true;
    }
  }

  if (receiverId) {
    const recStr = receiverId.toString();
    if (recStr !== callerIdStr && !targetParticipantIds.includes(recStr)) {
      targetParticipantIds.push(recStr);
    }
  }

  if (targetParticipantIds.length === 0) {
    const error = new Error("Please select at least one teammate to call");
    error.statusCode = 400;
    throw error;
  }

  // Validate all invited participants are active members in project
  const memberRecords = await ProjectMembership.find({
    project: projectId,
    user: { $in: targetParticipantIds },
    status: "ACTIVE",
  });

  if (memberRecords.length !== targetParticipantIds.length) {
    const error = new Error("One or more selected participants are not active members of this project");
    error.statusCode = 403;
    throw error;
  }

  const defaultTitle = isGroupCall
    ? `Group ${normalizedType === "VIDEO" ? "Video" : "Voice"} Call`
    : `${normalizedType === "VIDEO" ? "Video" : "Voice"} Call`;

  const primaryReceiver = isGroupCall ? null : targetParticipantIds[0];

  const newCall = await Call.create({
    project: projectId,
    caller: callerId,
    receiver: primaryReceiver,
    isGroup: isGroupCall,
    participants: targetParticipantIds,
    acceptedParticipants: [callerId],
    title: (title || "").trim() || defaultTitle,
    type: normalizedType,
    status: "RINGING",
    startedAt: new Date(),
  });

  await newCall.populate([
    { path: "caller", select: "name email avatar avatarColor" },
    { path: "receiver", select: "name email avatar avatarColor" },
    { path: "participants", select: "name email avatar avatarColor" },
    { path: "acceptedParticipants", select: "name email avatar avatarColor" },
    { path: "project", select: "name description" },
  ]);

  const formatted = formatCall(newCall);

  // Emit real-time call:incoming to all invited participants
  try {
    const io = getIO();
    if (io) {
      targetParticipantIds.forEach((pId) => {
        io.to(`user:${pId}`).emit("call:incoming", {
          callId: formatted.id,
          call: formatted,
          caller: formatted.caller,
          type: formatted.type,
          isGroup: formatted.isGroup,
          projectId: formatted.projectId,
          title: formatted.title,
        });
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
    $or: [
      { caller: userId },
      { receiver: userId },
      { participants: userId },
      { acceptedParticipants: userId },
    ],
  };

  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 30));
  const skip = (page - 1) * limit;

  const calls = await Call.find(filter)
    .populate("caller", "name email avatar avatarColor")
    .populate("receiver", "name email avatar avatarColor")
    .populate("participants", "name email avatar avatarColor")
    .populate("acceptedParticipants", "name email avatar avatarColor")
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
    .populate("participants", "name email avatar avatarColor")
    .populate("acceptedParticipants", "name email avatar avatarColor")
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
    { path: "participants", select: "name email avatar avatarColor" },
    { path: "acceptedParticipants", select: "name email avatar avatarColor" },
    { path: "project", select: "name description" },
  ]);

  if (!call) {
    const error = new Error("Call not found");
    error.statusCode = 404;
    throw error;
  }

  const userIdStr = userId.toString();
  const callerIdStr = call.caller ? (call.caller._id ? call.caller._id.toString() : call.caller.toString()) : "";
  const receiverIdStr = call.receiver ? (call.receiver._id ? call.receiver._id.toString() : call.receiver.toString()) : "";
  const participantIds = Array.isArray(call.participants)
    ? call.participants.map((p) => (p._id ? p._id.toString() : p.toString()))
    : [];

  const isAllowed =
    receiverIdStr === userIdStr ||
    participantIds.includes(userIdStr) ||
    callerIdStr === userIdStr;

  if (!isAllowed) {
    const error = new Error("You are not authorized to join this call");
    error.statusCode = 403;
    throw error;
  }

  if (call.status === "COMPLETED" || call.status === "CANCELLED" || call.status === "DECLINED") {
    const error = new Error(`Call cannot be joined because it is ${call.status.toLowerCase()}`);
    error.statusCode = 400;
    throw error;
  }

  call.status = "ONGOING";
  if (!call.answeredAt) {
    call.answeredAt = new Date();
  }

  if (!call.acceptedParticipants.some((p) => (p._id ? p._id.toString() : p.toString()) === userIdStr)) {
    call.acceptedParticipants.push(userId);
  }

  await call.save();

  await call.populate([
    { path: "caller", select: "name email avatar avatarColor" },
    { path: "receiver", select: "name email avatar avatarColor" },
    { path: "participants", select: "name email avatar avatarColor" },
    { path: "acceptedParticipants", select: "name email avatar avatarColor" },
    { path: "project", select: "name description" },
  ]);

  const formatted = formatCall(call);

  // Notify other participants that user accepted/joined
  try {
    const io = getIO();
    if (io) {
      // Notify caller
      if (callerIdStr && callerIdStr !== userIdStr) {
        io.to(`user:${callerIdStr}`).emit("call:accepted", {
          callId: formatted.id,
          call: formatted,
          userId: userIdStr,
        });
      }

      // Notify all active accepted participants
      formatted.participantIds.forEach((pId) => {
        if (pId !== userIdStr) {
          io.to(`user:${pId}`).emit("call:participant-joined", {
            callId: formatted.id,
            call: formatted,
            userId: userIdStr,
          });
        }
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

  const call = await Call.findById(callId).populate("caller receiver participants project");
  if (!call) {
    const error = new Error("Call not found");
    error.statusCode = 404;
    throw error;
  }

  const userIdStr = userId.toString();
  const callerIdStr = call.caller ? (call.caller._id ? call.caller._id.toString() : call.caller.toString()) : "";

  if (!call.isGroup) {
    call.status = "DECLINED";
    call.endedAt = new Date();
    call.endReason = "DECLINED";
    await call.save();
  }

  const formatted = formatCall(call);

  // Notify caller
  try {
    const io = getIO();
    if (io && callerIdStr) {
      io.to(`user:${callerIdStr}`).emit("call:rejected", {
        callId: formatted.id,
        call: formatted,
        rejectedBy: userIdStr,
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

  const call = await Call.findById(callId).populate("caller receiver participants project");
  if (!call) {
    const error = new Error("Call not found");
    error.statusCode = 404;
    throw error;
  }

  const callerIdStr = call.caller ? (call.caller._id ? call.caller._id.toString() : call.caller.toString()) : "";

  if (callerIdStr !== userId.toString()) {
    const error = new Error("Only the caller can cancel this call");
    error.statusCode = 403;
    throw error;
  }

  call.status = "CANCELLED";
  call.endedAt = new Date();
  call.endReason = "CANCELLED";
  await call.save();

  const formatted = formatCall(call);

  // Notify all invited participants
  try {
    const io = getIO();
    if (io) {
      formatted.participantIds.forEach((pId) => {
        if (pId !== callerIdStr) {
          io.to(`user:${pId}`).emit("call:cancelled", {
            callId: formatted.id,
            call: formatted,
          });
        }
      });
    }
  } catch (err) {
    console.warn("Socket call:cancelled emit warning:", err.message);
  }

  return formatted;
};

/**
 * User leaves an active call
 */
const leaveCall = async (callId, userId) => {
  if (!mongoose.Types.ObjectId.isValid(callId)) {
    const error = new Error("Invalid call ID");
    error.statusCode = 400;
    throw error;
  }

  const call = await Call.findById(callId).populate("caller receiver participants acceptedParticipants project");
  if (!call) {
    const error = new Error("Call not found");
    error.statusCode = 404;
    throw error;
  }

  const userIdStr = userId.toString();

  // Remove from acceptedParticipants
  call.acceptedParticipants = (call.acceptedParticipants || []).filter(
    (p) => (p._id ? p._id.toString() : p.toString()) !== userIdStr
  );

  // If 1-on-1 or if fewer than 2 participants remain in a group call, complete the call
  if (!call.isGroup || call.acceptedParticipants.length <= 1) {
    const now = new Date();
    let duration = 0;
    if (call.answeredAt) {
      duration = Math.max(0, Math.round((now - call.answeredAt) / 1000));
    }
    call.status = "COMPLETED";
    call.endedAt = now;
    call.duration = duration;
    call.endReason = "NORMAL";
  }

  await call.save();

  const formatted = formatCall(call);

  // Broadcast participant-left or call:ended
  try {
    const io = getIO();
    if (io) {
      if (call.status === "COMPLETED") {
        formatted.participantIds.forEach((pId) => {
          io.to(`user:${pId}`).emit("call:ended", {
            callId: formatted.id,
            call: formatted,
            endedBy: userIdStr,
          });
        });
      } else {
        formatted.participantIds.forEach((pId) => {
          io.to(`user:${pId}`).emit("call:participant-left", {
            callId: formatted.id,
            call: formatted,
            userId: userIdStr,
          });
        });
      }
    }
  } catch (err) {
    console.warn("Socket call:participant-left emit warning:", err.message);
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

  const call = await Call.findById(callId).populate("caller receiver participants acceptedParticipants project");
  if (!call) {
    const error = new Error("Call not found");
    error.statusCode = 404;
    throw error;
  }

  const userIdStr = userId.toString();
  const callerIdStr = call.caller ? (call.caller._id ? call.caller._id.toString() : call.caller.toString()) : "";
  const receiverIdStr = call.receiver ? (call.receiver._id ? call.receiver._id.toString() : call.receiver.toString()) : "";
  const participantIds = Array.isArray(call.participants)
    ? call.participants.map((p) => (p._id ? p._id.toString() : p.toString()))
    : [];

  const isParticipant =
    callerIdStr === userIdStr ||
    receiverIdStr === userIdStr ||
    participantIds.includes(userIdStr);

  if (!isParticipant) {
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

  const formatted = formatCall(call);

  // Notify all participants
  try {
    const io = getIO();
    if (io) {
      formatted.participantIds.forEach((pId) => {
        io.to(`user:${pId}`).emit("call:ended", {
          callId: formatted.id,
          call: formatted,
          endedBy: userIdStr,
        });
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
  leaveCall,
  endCall,
};
