const mongoose = require("mongoose");
const Message = require("../models/Message");
const Conversation = require("../models/Conversation");
const User = require("../models/User");
const { createNotification } = require("./notificationService");

/**
 * Format message for API / Socket response matching frontend Message and MessageList expectations
 */
const formatMessage = (message, currentUserId = null) => {
  const m = message.toJSON ? message.toJSON() : message;
  const currIdStr = currentUserId ? (currentUserId._id ? currentUserId._id.toString() : currentUserId.toString()) : null;

  const senderId = m.sender ? (m.sender._id ? m.sender._id.toString() : m.sender.toString()) : null;
  const senderObj =
    m.sender && typeof m.sender === "object" && m.sender.name
      ? {
          id: senderId,
          _id: senderId,
          name: m.sender.name,
          email: m.sender.email,
          avatar: m.sender.avatar,
        }
      : {
          id: senderId,
          _id: senderId,
          name: "User",
        };

  // Format reactions into [{ emoji, count, users: ['usr_1'] }]
  const formattedReactions = (m.reactions || []).map((rx) => {
    const users = (rx.users || []).map((u) => (u._id ? u._id.toString() : u.toString()));
    return {
      emoji: rx.emoji,
      count: users.length,
      users,
    };
  });

  const createdAtDate = m.createdAt ? new Date(m.createdAt) : new Date();
  const timeStr = createdAtDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  let displayContent = m.content;
  if (m.deleted) {
    displayContent = "This message was deleted";
  }

  let editedLabel = null;
  if (m.edited && !m.deleted) {
    editedLabel = "Edited";
  }

  return {
    id: m._id ? m._id.toString() : m.id,
    _id: m._id ? m._id.toString() : m.id,
    conversationId: m.conversation ? (m.conversation._id ? m.conversation._id.toString() : m.conversation.toString()) : null,
    senderId,
    sender: senderObj,
    content: displayContent,
    messageType: m.messageType || "TEXT",
    replyTo: m.replyTo ? (m.replyTo._id ? m.replyTo._id.toString() : m.replyTo.toString()) : null,
    reactions: formattedReactions,
    edited: Boolean(m.edited),
    editedAt: editedLabel,
    deleted: Boolean(m.deleted),
    readBy: (m.readBy || []).map((u) => (u._id ? u._id.toString() : u.toString())),
    attachments: m.attachments || [],
    createdAt: timeStr,
    timestamp: createdAtDate.toISOString(),
  };
};

/**
 * Verify user has access to conversation
 */
const verifyConversationAccess = async (projectId, conversationId, userId) => {
  if (!mongoose.Types.ObjectId.isValid(conversationId)) {
    const error = new Error("Invalid conversation ID");
    error.statusCode = 400;
    throw error;
  }

  const conv = await Conversation.findOne({
    _id: conversationId,
    project: projectId,
  });

  if (!conv) {
    const error = new Error("Conversation not found in this project");
    error.statusCode = 404;
    throw error;
  }

  const userIdStr = userId ? (userId._id ? userId._id.toString() : userId.toString()) : null;

  if (conv.type === "direct") {
    const isParticipant = (conv.participants || []).some(
      (p) => (p._id ? p._id.toString() : p.toString()) === userIdStr
    );
    if (!isParticipant) {
      const error = new Error("You are not a participant in this direct conversation");
      error.statusCode = 403;
      throw error;
    }
  }

  return conv;
};

/**
 * Get messages for a conversation (paginated, chronological order)
 */
const getMessages = async (projectId, conversationId, currentUserId, query = {}) => {
  const conv = await verifyConversationAccess(projectId, conversationId, currentUserId);

  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 50));
  const skip = (page - 1) * limit;

  const totalCount = await Message.countDocuments({
    conversation: conv._id,
  });

  // Fetch newest messages first, then reverse so returned array is oldest -> newest
  const messages = await Message.find({
    conversation: conv._id,
  })
    .populate("sender", "name email avatar")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  messages.reverse();

  // Mark messages as read by current user in background
  const currIdStr = currentUserId ? (currentUserId._id ? currentUserId._id.toString() : currentUserId.toString()) : null;
  if (currIdStr) {
    await Message.updateMany(
      {
        conversation: conv._id,
        sender: { $ne: currIdStr },
        readBy: { $ne: currIdStr },
      },
      {
        $addToSet: { readBy: currIdStr },
      }
    );
  }

  return {
    messages: messages.map((m) => formatMessage(m, currentUserId)),
    page,
    limit,
    totalCount,
    hasMore: skip + messages.length < totalCount,
  };
};

/**
 * Send a new message
 */
const sendMessage = async (projectId, conversationId, currentUserId, { content, replyTo = null, attachments = [] }) => {
  const trimmed = (content || "").trim();
  if (!trimmed && (!attachments || attachments.length === 0)) {
    const error = new Error("Message content or attachment is required");
    error.statusCode = 400;
    throw error;
  }

  const conv = await verifyConversationAccess(projectId, conversationId, currentUserId);
  const currId = currentUserId._id || currentUserId;

  let replyId = null;
  if (replyTo && mongoose.Types.ObjectId.isValid(replyTo)) {
    const parent = await Message.findOne({ _id: replyTo, conversation: conv._id });
    if (parent) replyId = parent._id;
  }

  const message = await Message.create({
    project: projectId,
    conversation: conv._id,
    sender: currId,
    content: trimmed,
    messageType: "TEXT",
    replyTo: replyId,
    readBy: [currId],
    attachments: attachments || [],
  });

  await message.populate("sender", "name email avatar");

  // Update conversation lastMessage preview
  conv.lastMessage = message._id;
  conv.lastMessageContent = trimmed || "[Attachment]";
  conv.lastMessageAt = new Date();
  await conv.save();

  // Send notifications to other participants in direct/channel chat
  if (conv.participants && Array.isArray(conv.participants)) {
    const senderName = message.sender?.name || "Team Member";
    const snippet = trimmed.length > 50 ? `${trimmed.substring(0, 47)}...` : trimmed;
    const recipientIds = conv.participants
      .map((p) => (p._id ? p._id.toString() : p.toString()))
      .filter((pId) => pId !== currId.toString());

    for (const recId of recipientIds) {
      await createNotification({
        recipient: recId,
        actor: currId,
        project: projectId,
        type: "CHAT_MESSAGE",
        title: `Message from ${senderName}`,
        message: snippet || "Sent an attachment",
        entityType: "MESSAGE",
        entityId: message._id,
        metadata: {
          conversationId: conv._id,
          projectId,
        },
      });
    }
  }

  return formatMessage(message, currentUserId);
};

/**
 * Edit a message
 */
const editMessage = async (projectId, conversationId, messageId, currentUserId, newContent) => {
  const trimmed = (newContent || "").trim();
  if (!trimmed) {
    const error = new Error("Updated message content is required");
    error.statusCode = 400;
    throw error;
  }

  await verifyConversationAccess(projectId, conversationId, currentUserId);

  const message = await Message.findOne({
    _id: messageId,
    conversation: conversationId,
    project: projectId,
  }).populate("sender", "name email avatar");

  if (!message) {
    const error = new Error("Message not found");
    error.statusCode = 404;
    throw error;
  }

  const senderId = message.sender ? (message.sender._id ? message.sender._id.toString() : message.sender.toString()) : null;
  const currIdStr = currentUserId ? (currentUserId._id ? currentUserId._id.toString() : currentUserId.toString()) : null;

  if (senderId !== currIdStr) {
    const error = new Error("Permission denied: You can only edit your own messages");
    error.statusCode = 403;
    throw error;
  }

  if (message.deleted) {
    const error = new Error("Cannot edit a deleted message");
    error.statusCode = 400;
    throw error;
  }

  message.content = trimmed;
  message.edited = true;
  message.editedAt = new Date();
  await message.save();

  return formatMessage(message, currentUserId);
};

/**
 * Delete a message (soft delete)
 */
const deleteMessage = async (projectId, conversationId, messageId, currentUserId, userRole = "DEVELOPER") => {
  await verifyConversationAccess(projectId, conversationId, currentUserId);

  const message = await Message.findOne({
    _id: messageId,
    conversation: conversationId,
    project: projectId,
  }).populate("sender", "name email avatar");

  if (!message) {
    const error = new Error("Message not found");
    error.statusCode = 404;
    throw error;
  }

  const senderId = message.sender ? (message.sender._id ? message.sender._id.toString() : message.sender.toString()) : null;
  const currIdStr = currentUserId ? (currentUserId._id ? currentUserId._id.toString() : currentUserId.toString()) : null;
  const isPrivileged = ["OWNER", "ADMIN"].includes((userRole || "").toUpperCase());

  if (senderId !== currIdStr && !isPrivileged) {
    const error = new Error("Permission denied: You can only delete your own messages");
    error.statusCode = 403;
    throw error;
  }

  message.deleted = true;
  message.deletedAt = new Date();
  message.content = "This message was deleted";
  await message.save();

  return formatMessage(message, currentUserId);
};

/**
 * Toggle a reaction on a message
 */
const toggleReaction = async (projectId, conversationId, messageId, currentUserId, emoji) => {
  if (!emoji || !emoji.trim()) {
    const error = new Error("Emoji is required");
    error.statusCode = 400;
    throw error;
  }

  await verifyConversationAccess(projectId, conversationId, currentUserId);

  const message = await Message.findOne({
    _id: messageId,
    conversation: conversationId,
    project: projectId,
  }).populate("sender", "name email avatar");

  if (!message) {
    const error = new Error("Message not found");
    error.statusCode = 404;
    throw error;
  }

  const currId = currentUserId._id || currentUserId;
  const currIdStr = currId.toString();

  let reactions = message.reactions || [];
  const existingIndex = reactions.findIndex((r) => r.emoji === emoji);

  if (existingIndex !== -1) {
    const rx = reactions[existingIndex];
    const userIndex = (rx.users || []).findIndex(
      (u) => (u._id ? u._id.toString() : u.toString()) === currIdStr
    );

    if (userIndex !== -1) {
      // Remove reaction user
      rx.users.splice(userIndex, 1);
      if (rx.users.length === 0) {
        reactions.splice(existingIndex, 1);
      }
    } else {
      // Add reaction user
      rx.users.push(currId);
    }
  } else {
    // Add new reaction object
    reactions.push({
      emoji: emoji.trim(),
      users: [currId],
    });
  }

  message.reactions = reactions;
  await message.save();

  return formatMessage(message, currentUserId);
};

/**
 * Mark a single message as read
 */
const markMessageAsRead = async (projectId, conversationId, messageId, currentUserId) => {
  const currId = currentUserId._id || currentUserId;

  const message = await Message.findOneAndUpdate(
    {
      _id: messageId,
      conversation: conversationId,
      project: projectId,
    },
    {
      $addToSet: { readBy: currId },
    },
    { new: true }
  ).populate("sender", "name email avatar");

  return message ? formatMessage(message, currentUserId) : null;
};

module.exports = {
  formatMessage,
  verifyConversationAccess,
  getMessages,
  sendMessage,
  editMessage,
  deleteMessage,
  toggleReaction,
  markMessageAsRead,
};
