const mongoose = require("mongoose");
const Activity = require("../models/Activity");

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
  if (diffMins < 60) return `${diffMins} mins ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
};

/**
 * Format activity for API responses
 */
const formatActivity = (activity) => {
  const a = activity.toJSON ? activity.toJSON() : activity;

  const actorId = a.actor ? (a.actor._id ? a.actor._id.toString() : a.actor.toString()) : null;
  const actorObj =
    a.actor && typeof a.actor === "object" && a.actor.name
      ? {
          id: actorId,
          _id: actorId,
          name: a.actor.name,
          email: a.actor.email,
          avatar: a.actor.avatar,
        }
      : {
          id: actorId,
          _id: actorId,
          name: "Teammate",
        };

  const projectId = a.project
    ? a.project._id
      ? a.project._id.toString()
      : a.project.toString()
    : null;

  const entityId = a.entityId
    ? a.entityId._id
      ? a.entityId._id.toString()
      : a.entityId.toString()
    : null;

  return {
    id: a._id ? a._id.toString() : a.id,
    _id: a._id ? a._id.toString() : a.id,
    projectId,
    actorId,
    actor: actorObj,
    type: a.type,
    entityType: (a.entityType || "PROJECT").toLowerCase(),
    entityId,
    title: a.title || a.message,
    detail: a.message,
    message: a.message,
    metadata: a.metadata || {},
    createdAt: a.createdAt ? new Date(a.createdAt).toISOString() : new Date().toISOString(),
    timeAgo: formatTimeAgo(a.createdAt),
  };
};

/**
 * Create a new activity record
 */
const createActivity = async ({
  project,
  actor,
  type,
  entityType = "PROJECT",
  entityId = null,
  title = "",
  message,
  metadata = {},
}) => {
  if (!project || !actor || !type || !message) {
    return null;
  }

  const activity = await Activity.create({
    project: project._id || project,
    actor: actor._id || actor,
    type,
    entityType: entityType.toUpperCase(),
    entityId: entityId ? (entityId._id || entityId) : null,
    title: title || message,
    message,
    metadata,
  });

  await activity.populate("actor", "name email avatar");
  return formatActivity(activity);
};

/**
 * Get project activity feed (paginated)
 */
const getProjectActivities = async (projectId, query = {}) => {
  const filter = { project: projectId };

  if (query.type && query.type !== "all") {
    filter.type = query.type;
  }

  if (query.entityType) {
    filter.entityType = query.entityType.toUpperCase();
  }

  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 30));
  const skip = (page - 1) * limit;

  const totalCount = await Activity.countDocuments(filter);

  const activities = await Activity.find(filter)
    .populate("actor", "name email avatar")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  return {
    activities: activities.map(formatActivity),
    page,
    limit,
    totalCount,
    hasMore: skip + activities.length < totalCount,
  };
};

module.exports = {
  formatActivity,
  createActivity,
  getProjectActivities,
};
