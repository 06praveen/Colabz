const mongoose = require("mongoose");
const Notification = require("../models/Notification");
const { getIO } = require("../sockets/ioStore");

/**
 * Format relative time
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
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
};

/**
 * Format group date (e.g. "Today", "Yesterday", "Earlier")
 */
const getGroupDate = (date) => {
  if (!date) return "Today";
  const now = new Date();
  const d = new Date(date);
  const diffDays = Math.floor((now - d) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  return "Earlier";
};

/**
 * Format notification document for API and Socket.IO responses
 */
const formatNotification = (notification) => {
  const n = notification.toJSON ? notification.toJSON() : notification;

  const actorId = n.actor ? (n.actor._id ? n.actor._id.toString() : n.actor.toString()) : null;
  const actorObj =
    n.actor && typeof n.actor === "object" && n.actor.name
      ? {
          id: actorId,
          _id: actorId,
          name: n.actor.name,
          email: n.actor.email,
          avatar: n.actor.avatar,
        }
      : {
          id: actorId,
          _id: actorId,
          name: "Teammate",
        };

  const recipientId = n.recipient
    ? n.recipient._id
      ? n.recipient._id.toString()
      : n.recipient.toString()
    : null;

  const projectId = n.project
    ? n.project._id
      ? n.project._id.toString()
      : n.project.toString()
    : null;

  const entityId = n.entityId
    ? n.entityId._id
      ? n.entityId._id.toString()
      : n.entityId.toString()
    : null;

  return {
    id: n._id ? n._id.toString() : n.id,
    _id: n._id ? n._id.toString() : n.id,
    type: n.type,
    title: n.title,
    message: n.message,
    actorId,
    actor: actorObj,
    recipientId,
    projectId,
    project: n.project && typeof n.project === "object" ? n.project : { id: projectId },
    entityType: (n.entityType || "SYSTEM").toLowerCase(),
    entityId,
    metadata: n.metadata || {},
    isRead: Boolean(n.isRead),
    read: Boolean(n.isRead),
    readAt: n.readAt,
    createdAt: n.createdAt ? new Date(n.createdAt).toISOString() : new Date().toISOString(),
    timeAgo: formatTimeAgo(n.createdAt),
    groupDate: getGroupDate(n.createdAt),
  };
};

/**
 * Create a new notification, save to MongoDB, and emit real-time Socket.IO event
 */
const createNotification = async ({
  recipient,
  actor,
  project = null,
  type,
  title,
  message,
  entityType = "SYSTEM",
  entityId = null,
  metadata = {},
}) => {
  const recipientIdStr = recipient ? (recipient._id ? recipient._id.toString() : recipient.toString()) : null;
  const actorIdStr = actor ? (actor._id ? actor._id.toString() : actor.toString()) : null;

  // Do not notify a user about their own action
  if (!recipientIdStr || (actorIdStr && recipientIdStr === actorIdStr)) {
    return null;
  }

  const notification = await Notification.create({
    recipient: recipient._id || recipient,
    actor: actor._id || actor,
    project: project ? (project._id || project) : null,
    type,
    title,
    message,
    entityType: entityType.toUpperCase(),
    entityId: entityId ? (entityId._id || entityId) : null,
    metadata,
  });

  await notification.populate([
    { path: "actor", select: "name email avatar" },
    { path: "project", select: "name description" },
  ]);

  const formatted = formatNotification(notification);

  // Emit real-time Socket.IO event to recipient's private user room
  try {
    const io = getIO();
    if (io) {
      io.to(`user:${recipientIdStr}`).emit("notification:new", formatted);
    }
  } catch (err) {
    console.warn("Socket notification broadcast error:", err.message);
  }

  return formatted;
};

/**
 * Get notifications for authenticated user
 */
const getNotifications = async (userId, query = {}) => {
  const filter = { recipient: userId };

  if (query.unreadOnly === "true" || query.filter === "unread") {
    filter.isRead = false;
  }

  if (query.projectId && mongoose.Types.ObjectId.isValid(query.projectId)) {
    filter.project = query.projectId;
  }

  if (query.type && query.type !== "all" && query.type !== "unread") {
    const typeUpper = query.type.toUpperCase();
    filter.$or = [
      { type: query.type },
      { type: typeUpper },
      { entityType: query.type.toUpperCase() },
    ];
  }

  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 30));
  const skip = (page - 1) * limit;

  const totalCount = await Notification.countDocuments(filter);

  const notifications = await Notification.find(filter)
    .populate("actor", "name email avatar")
    .populate("project", "name description")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  return {
    notifications: notifications.map(formatNotification),
    page,
    limit,
    totalCount,
    hasMore: skip + notifications.length < totalCount,
  };
};

/**
 * Get unread notification count
 */
const getUnreadCount = async (userId) => {
  const count = await Notification.countDocuments({
    recipient: userId,
    isRead: false,
  });
  return count;
};

/**
 * Mark single notification as read
 */
const markAsRead = async (notificationId, userId) => {
  if (!mongoose.Types.ObjectId.isValid(notificationId)) {
    const error = new Error("Invalid notification ID");
    error.statusCode = 400;
    throw error;
  }

  const notification = await Notification.findOneAndUpdate(
    { _id: notificationId, recipient: userId },
    { isRead: true, readAt: new Date() },
    { new: true }
  ).populate("actor", "name email avatar");

  if (!notification) {
    const error = new Error("Notification not found");
    error.statusCode = 404;
    throw error;
  }

  return formatNotification(notification);
};

/**
 * Mark all notifications as read for a user
 */
const markAllAsRead = async (userId, projectId = null) => {
  const filter = { recipient: userId, isRead: false };
  if (projectId && mongoose.Types.ObjectId.isValid(projectId)) {
    filter.project = projectId;
  }

  const result = await Notification.updateMany(filter, {
    isRead: true,
    readAt: new Date(),
  });

  return { updatedCount: result.modifiedCount };
};

/**
 * Delete a notification
 */
const deleteNotification = async (notificationId, userId) => {
  if (!mongoose.Types.ObjectId.isValid(notificationId)) {
    const error = new Error("Invalid notification ID");
    error.statusCode = 400;
    throw error;
  }

  const result = await Notification.deleteOne({
    _id: notificationId,
    recipient: userId,
  });

  if (result.deletedCount === 0) {
    const error = new Error("Notification not found");
    error.statusCode = 404;
    throw error;
  }

  return true;
};

/**
 * Clear all notifications for user
 */
const clearAllNotifications = async (userId) => {
  const result = await Notification.deleteMany({ recipient: userId });
  return { deletedCount: result.deletedCount };
};

module.exports = {
  formatNotification,
  createNotification,
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAllNotifications,
};
