const mongoose = require("mongoose");
const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const ProjectMembership = require("../models/ProjectMembership");
const User = require("../models/User");

/**
 * Deterministically generate participant key for 1-on-1 direct conversations
 */
const generateParticipantKey = (userA, userB) => {
  const idA = userA ? (userA._id ? userA._id.toString() : userA.toString()) : "";
  const idB = userB ? (userB._id ? userB._id.toString() : userB.toString()) : "";
  return [idA, idB].sort().join("_");
};

/**
 * Format timestamp into relative/human readable time string
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
  if (diffHours < 24) return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
};

/**
 * Format conversation document for API response matching frontend ChatSidebar & ChatContext expectations
 */
const formatConversation = async (conv, currentUserId) => {
  const c = conv.toJSON ? conv.toJSON() : conv;
  const currIdStr = currentUserId ? (currentUserId._id ? currentUserId._id.toString() : currentUserId.toString()) : null;

  let displayName = c.name;
  let recipientId = null;
  let recipientUser = null;

  if (c.type === "direct") {
    // Find other participant
    const otherParticipant = (c.participants || []).find((p) => {
      const pId = p._id ? p._id.toString() : p.toString();
      return pId !== currIdStr;
    });

    if (otherParticipant) {
      if (typeof otherParticipant === "object" && otherParticipant.name) {
        displayName = otherParticipant.name;
        recipientId = otherParticipant._id.toString();
        recipientUser = otherParticipant;
      } else {
        recipientId = otherParticipant.toString();
        const u = await User.findById(recipientId).select("name email avatar").lean();
        if (u) {
          displayName = u.name;
          recipientUser = u;
        }
      }
    }
  }

  // Calculate unread count for current user
  let unreadCount = 0;
  if (currIdStr) {
    unreadCount = await Message.countDocuments({
      conversation: c._id,
      sender: { $ne: currIdStr },
      readBy: { $ne: currIdStr },
      deleted: false,
    });
  }

  const memberIds = (c.participants || []).map((p) => (p._id ? p._id.toString() : p.toString()));

  return {
    id: c._id ? c._id.toString() : c.id,
    _id: c._id ? c._id.toString() : c.id,
    projectId: c.project ? (c.project._id ? c.project._id.toString() : c.project.toString()) : null,
    name: displayName || "Conversation",
    type: c.type || "direct",
    description: c.description || (c.type === "channel" ? `Channel #${c.name}` : "Direct conversation"),
    recipientId,
    recipientUser,
    unreadCount,
    lastMessage: c.lastMessageContent || "Conversation created",
    lastTime: formatTimeAgo(c.lastMessageAt || c.updatedAt || c.createdAt),
    lastMessageAt: c.lastMessageAt || c.updatedAt,
    memberIds,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
  };
};

/**
 * Ensure default channels exist for a project
 */
const getOrCreateDefaultChannels = async (projectId, userId) => {
  const existingGeneral = await Conversation.findOne({
    project: projectId,
    type: "channel",
    name: "general",
  });

  if (!existingGeneral) {
    await Conversation.create({
      project: projectId,
      type: "channel",
      name: "general",
      description: "General project announcements and coordination.",
      lastMessageContent: "Welcome to the project team workspace!",
      lastMessageAt: new Date(),
      createdBy: userId,
    });
  }

  const existingDev = await Conversation.findOne({
    project: projectId,
    type: "channel",
    name: "development",
  });

  if (!existingDev) {
    await Conversation.create({
      project: projectId,
      type: "channel",
      name: "development",
      description: "Technical implementation, architecture, and code reviews.",
      lastMessageContent: "Development channel initialized.",
      lastMessageAt: new Date(),
      createdBy: userId,
    });
  }
};

/**
 * Get all conversations for a project that current user has access to
 */
const getConversations = async (projectId, currentUserId) => {
  await getOrCreateDefaultChannels(projectId, currentUserId);

  const currId = currentUserId ? (currentUserId._id || currentUserId) : null;

  // Channels are accessible to all project members; direct messages only to participants
  const conversations = await Conversation.find({
    project: projectId,
    $or: [{ type: "channel" }, { participants: currId }],
  })
    .populate("participants", "name email avatar")
    .sort({ lastMessageAt: -1, updatedAt: -1 });

  const formatted = await Promise.all(
    conversations.map((c) => formatConversation(c, currentUserId))
  );

  return formatted;
};

/**
 * Get single conversation by ID
 */
const getConversationById = async (projectId, conversationId, currentUserId) => {
  if (!mongoose.Types.ObjectId.isValid(conversationId)) return null;

  const conv = await Conversation.findOne({
    _id: conversationId,
    project: projectId,
  }).populate("participants", "name email avatar");

  if (!conv) return null;

  return await formatConversation(conv, currentUserId);
};

/**
 * Create or retrieve an existing direct conversation between two project members
 */
const createOrGetDirectConversation = async (projectId, currentUserId, targetUserId) => {
  if (!targetUserId || !mongoose.Types.ObjectId.isValid(targetUserId)) {
    const error = new Error("Valid target user ID is required for direct conversation");
    error.statusCode = 400;
    throw error;
  }

  // Ensure target user is a project member
  const targetMember = await ProjectMembership.findOne({
    project: projectId,
    user: targetUserId,
  });

  if (!targetMember) {
    const error = new Error("Target user is not an active member of this project");
    error.statusCode = 400;
    throw error;
  }

  const participantKey = generateParticipantKey(currentUserId, targetUserId);

  let conv = await Conversation.findOne({
    project: projectId,
    participantKey,
  }).populate("participants", "name email avatar");

  if (!conv) {
    conv = await Conversation.create({
      project: projectId,
      type: "direct",
      participants: [currentUserId, targetUserId],
      participantKey,
      lastMessageContent: "Conversation created",
      lastMessageAt: new Date(),
      createdBy: currentUserId,
    });
    await conv.populate("participants", "name email avatar");
  }

  return await formatConversation(conv, currentUserId);
};

/**
 * Create a new channel conversation
 */
const createChannelConversation = async (projectId, currentUserId, { name, description, memberIds = [] }) => {
  let rawName = (name || "").trim().toLowerCase();
  if (rawName.startsWith("#")) {
    rawName = rawName.substring(1);
  }

  if (!rawName) {
    const error = new Error("Channel name is required");
    error.statusCode = 400;
    throw error;
  }

  const channelNameRegex = /^[a-z0-9_-]{2,30}$/;
  if (!channelNameRegex.test(rawName)) {
    const error = new Error("Channel name must be 2-30 characters (letters, numbers, hyphens, underscores)");
    error.statusCode = 400;
    throw error;
  }

  const existing = await Conversation.findOne({
    project: projectId,
    type: "channel",
    name: rawName,
  });

  if (existing) {
    const error = new Error(`Channel "#${rawName}" already exists in this project`);
    error.statusCode = 409;
    throw error;
  }

  const conv = await Conversation.create({
    project: projectId,
    type: "channel",
    name: rawName,
    description: description || `Channel for #${rawName}`,
    participants: memberIds.filter((id) => mongoose.Types.ObjectId.isValid(id)),
    lastMessageContent: "Channel created",
    lastMessageAt: new Date(),
    createdBy: currentUserId,
  });

  return await formatConversation(conv, currentUserId);
};

/**
 * Mark all messages in a conversation as read by current user
 */
const markConversationAsRead = async (projectId, conversationId, currentUserId) => {
  const currIdStr = currentUserId ? (currentUserId._id ? currentUserId._id.toString() : currentUserId.toString()) : null;
  if (!currIdStr) return false;

  await Message.updateMany(
    {
      project: projectId,
      conversation: conversationId,
      sender: { $ne: currIdStr },
      readBy: { $ne: currIdStr },
    },
    {
      $addToSet: { readBy: currIdStr },
    }
  );

  return true;
};

module.exports = {
  generateParticipantKey,
  formatConversation,
  getOrCreateDefaultChannels,
  getConversations,
  getConversationById,
  createOrGetDirectConversation,
  createChannelConversation,
  markConversationAsRead,
};
