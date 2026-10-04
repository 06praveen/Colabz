const mongoose = require("mongoose");
const Issue = require("../models/Issue");
const IssueComment = require("../models/IssueComment");

/**
 * Format comment for API responses
 */
const formatComment = (comment) => {
  const c = comment.toJSON ? comment.toJSON() : comment;
  return {
    id: c._id ? c._id.toString() : c.id,
    _id: c._id ? c._id.toString() : c.id,
    issueId: c.issue ? c.issue.toString() : null,
    author: c.authorName || (typeof c.author === "object" ? c.author.name : "User"),
    initials: c.authorInitials || "US",
    text: c.content || c.text || "",
    time: c.createdAt
      ? new Date(c.createdAt).toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
        })
      : "Recently",
    createdAt: c.createdAt,
    authorId: typeof c.author === "object" ? c.author._id.toString() : c.author?.toString(),
  };
};

/**
 * Create a new comment on an issue
 */
const createComment = async (projectId, user, issueId, content) => {
  if (!content || !content.trim()) {
    const error = new Error("Comment content cannot be empty");
    error.statusCode = 400;
    throw error;
  }

  const query = { project: projectId };
  const cleanNum = Number(String(issueId).replace("#", ""));
  if (!isNaN(cleanNum) && cleanNum > 0) {
    query.$or = [{ number: cleanNum }];
    if (mongoose.Types.ObjectId.isValid(issueId)) {
      query.$or.push({ _id: issueId });
    }
  } else if (mongoose.Types.ObjectId.isValid(issueId)) {
    query._id = issueId;
  } else {
    const error = new Error("Invalid issue ID");
    error.statusCode = 400;
    throw error;
  }

  const issue = await Issue.findOne(query);
  if (!issue) {
    const error = new Error("Issue not found");
    error.statusCode = 404;
    throw error;
  }

  const initials = (user.name || "User")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  const comment = await IssueComment.create({
    issue: issue._id,
    project: projectId,
    author: user._id,
    authorName: user.name || "User",
    authorInitials: initials,
    content: content.trim(),
  });

  try {
    const { createActivity } = require("./activityService");
    const { createNotification } = require("./notificationService");

    await createActivity({
      project: projectId,
      actor: user._id,
      type: "ISSUE_COMMENTED",
      entityType: "ISSUE",
      entityId: issue._id,
      title: `${user.name || "User"} commented on Issue #${issue.number}`,
      message: `${user.name || "User"}: "${content.trim()}"`,
      metadata: { issueNumber: issue.number, title: issue.title },
    });

    // Notify issue reporter if different from commenting user
    if (issue.reporter && issue.reporter.toString() !== user._id.toString()) {
      await createNotification({
        recipient: issue.reporter,
        actor: user._id,
        project: projectId,
        type: "ISSUE_COMMENTED",
        title: `${user.name || "Teammate"} commented on Issue #${issue.number}`,
        message: content.trim(),
        entityType: "ISSUE",
        entityId: issue._id,
        metadata: { issueNumber: issue.number, title: issue.title },
      });
    }

    // Notify issue assignee if different from commenter and reporter
    if (
      issue.assignee &&
      issue.assignee.toString() !== user._id.toString() &&
      issue.assignee.toString() !== (issue.reporter?.toString() || "")
    ) {
      await createNotification({
        recipient: issue.assignee,
        actor: user._id,
        project: projectId,
        type: "ISSUE_COMMENTED",
        title: `${user.name || "Teammate"} commented on Issue #${issue.number}`,
        message: content.trim(),
        entityType: "ISSUE",
        entityId: issue._id,
        metadata: { issueNumber: issue.number, title: issue.title },
      });
    }
  } catch (err) {
    console.warn("Issue comment notification warning:", err.message);
  }

  return formatComment(comment);
};

/**
 * Get comments for an issue
 */
const getComments = async (projectId, issueId) => {
  const query = { project: projectId };
  const cleanNum = Number(String(issueId).replace("#", ""));
  if (!isNaN(cleanNum) && cleanNum > 0) {
    query.$or = [{ number: cleanNum }];
    if (mongoose.Types.ObjectId.isValid(issueId)) {
      query.$or.push({ _id: issueId });
    }
  } else if (mongoose.Types.ObjectId.isValid(issueId)) {
    query._id = issueId;
  } else {
    return [];
  }

  const issue = await Issue.findOne(query);
  if (!issue) return [];

  const comments = await IssueComment.find({ issue: issue._id }).sort({ createdAt: 1 });
  return comments.map(formatComment);
};

/**
 * Update comment
 */
const updateComment = async (projectId, user, commentId, content, userRole) => {
  if (!content || !content.trim()) {
    const error = new Error("Comment content cannot be empty");
    error.statusCode = 400;
    throw error;
  }

  const comment = await IssueComment.findOne({ _id: commentId, project: projectId });
  if (!comment) {
    const error = new Error("Comment not found");
    error.statusCode = 404;
    throw error;
  }

  const isAuthor = comment.author.toString() === user._id.toString();
  const isPrivileged = userRole === "OWNER" || userRole === "ADMIN";

  if (!isAuthor && !isPrivileged) {
    const error = new Error("Permission denied: you cannot edit this comment");
    error.statusCode = 403;
    throw error;
  }

  comment.content = content.trim();
  await comment.save();
  return formatComment(comment);
};

/**
 * Delete comment
 */
const deleteComment = async (projectId, user, commentId, userRole) => {
  const comment = await IssueComment.findOne({ _id: commentId, project: projectId });
  if (!comment) {
    const error = new Error("Comment not found");
    error.statusCode = 404;
    throw error;
  }

  const isAuthor = comment.author.toString() === user._id.toString();
  const isPrivileged = userRole === "OWNER" || userRole === "ADMIN";

  if (!isAuthor && !isPrivileged) {
    const error = new Error("Permission denied: you cannot delete this comment");
    error.statusCode = 403;
    throw error;
  }

  await IssueComment.deleteOne({ _id: comment._id });
  return true;
};

module.exports = {
  createComment,
  getComments,
  updateComment,
  deleteComment,
};
