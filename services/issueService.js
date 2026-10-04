const mongoose = require("mongoose");
const Issue = require("../models/Issue");
const IssueComment = require("../models/IssueComment");
const ProjectMembership = require("../models/ProjectMembership");
const User = require("../models/User");

/**
 * Format issue for API responses
 */
const formatIssue = (issue, comments = []) => {
  const i = issue.toJSON ? issue.toJSON() : issue;
  const a = issue.assignee;
  let assigneeFormatted = issue.assigneeInfo || { name: "Unassigned", initials: "UA", role: "" };

  if (a && typeof a === "object" && a.name) {
    assigneeFormatted = {
      id: a._id ? a._id.toString() : null,
      name: a.name,
      email: a.email,
      initials: a.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .substring(0, 2)
        .toUpperCase(),
      role: a.role || assigneeFormatted.role || "Member",
    };
  }

  const formattedComments = comments.map((c) => ({
    id: c._id ? c._id.toString() : c.id,
    _id: c._id ? c._id.toString() : c.id,
    author: c.authorName || c.author?.name || "User",
    initials: c.authorInitials || "US",
    text: c.content || c.text || "",
    time: c.createdAt
      ? new Date(c.createdAt).toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
        })
      : "Recently",
    createdAt: c.createdAt,
    authorId: c.author?._id ? c.author._id.toString() : c.author?.toString(),
  }));

  return {
    id: i._id ? i._id.toString() : i.id,
    _id: i._id ? i._id.toString() : i.id,
    number: i.number || 1,
    projectId: i.project ? (i.project._id ? i.project._id.toString() : i.project.toString()) : null,
    title: i.title,
    description: i.description || "",
    status: i.status || "Open",
    priority: i.priority || "Medium",
    assignee: assigneeFormatted,
    author: i.author || "Member",
    authorInitials: i.authorInitials || "MB",
    reporter: i.reporter,
    labels: i.labels || ["Bug"],
    createdAt: i.createdAt,
    updatedAt: i.updatedAt,
    comments: formattedComments,
  };
};

/**
 * Create a new issue
 */
const createIssue = async (project, user, issueData) => {
  const { title, description, priority, assignee, labels } = issueData;

  const count = await Issue.countDocuments({ project: project._id });
  const number = count + 1;

  let assigneeId = null;
  let assigneeInfo = { name: "Unassigned", initials: "UA", role: "Developer" };

  if (assignee) {
    let resolvedUser = null;
    if (typeof assignee === "object") {
      if (assignee._id || assignee.id) {
        resolvedUser = await User.findById(assignee._id || assignee.id);
      } else if (assignee.name) {
        resolvedUser = await User.findOne({ name: new RegExp(`^${assignee.name}$`, "i") });
      }
      assigneeInfo = {
        name: assignee.name || resolvedUser?.name || "Member",
        initials: assignee.initials || "MB",
        role: assignee.role || "Developer",
      };
    } else if (mongoose.Types.ObjectId.isValid(assignee)) {
      resolvedUser = await User.findById(assignee);
    }

    if (resolvedUser) {
      const membership = await ProjectMembership.findOne({
        project: project._id,
        user: resolvedUser._id,
        status: "ACTIVE",
      });

      if (!membership && project.owner.toString() !== resolvedUser._id.toString()) {
        const error = new Error("Assignee must be an active member of this project");
        error.statusCode = 400;
        throw error;
      }

      assigneeId = resolvedUser._id;
      assigneeInfo = {
        name: resolvedUser.name,
        initials: resolvedUser.name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .substring(0, 2)
          .toUpperCase(),
        role: membership?.role || "Developer",
      };
    }
  }

  const userInitials = (user.name || "User")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  const issue = await Issue.create({
    project: project._id,
    number,
    title: title.trim(),
    description: (description || "").trim(),
    status: "Open",
    priority: priority || "Medium",
    assignee: assigneeId,
    assigneeInfo,
    reporter: user._id,
    author: user.name || "User",
    authorInitials: userInitials,
    labels: Array.isArray(labels) ? labels : ["Bug"],
  });

  try {
    const { createActivity } = require("./activityService");
    const { createNotification } = require("./notificationService");

    await createActivity({
      project: project._id,
      actor: user._id,
      type: "ISSUE_CREATED",
      entityType: "ISSUE",
      entityId: issue._id,
      title: `${user.name || "User"} opened Issue #${number}`,
      message: `${user.name || "User"} opened Issue #${number}: "${title.trim()}"`,
      metadata: { issueNumber: number, title: issue.title, priority: issue.priority, status: issue.status },
    });

    if (assigneeId && assigneeId.toString() !== user._id.toString()) {
      await createNotification({
        recipient: assigneeId,
        actor: user._id,
        project: project._id,
        type: "ISSUE_ASSIGNED",
        title: `${user.name || "Teammate"} assigned you Issue #${number}`,
        message: issue.title,
        entityType: "ISSUE",
        entityId: issue._id,
        metadata: { issueNumber: number, title: issue.title },
      });
    }
  } catch (err) {
    console.warn("Issue activity warning:", err.message);
  }

  return formatIssue(issue, []);
};

/**
 * Get issues for a project with optional filters
 */
const getIssues = async (projectId, query = {}) => {
  const filter = { project: projectId };

  if (query.status) {
    if (query.status.toLowerCase() === "open") {
      filter.status = new RegExp("^open$", "i");
    } else if (query.status.toLowerCase() === "closed") {
      filter.status = new RegExp("^(closed|resolved)$", "i");
    } else {
      filter.status = new RegExp(`^${query.status.trim()}$`, "i");
    }
  }

  if (query.priority) {
    filter.priority = new RegExp(`^${query.priority.trim()}$`, "i");
  }

  if (query.label) {
    filter.labels = { $in: [new RegExp(query.label.trim(), "i")] };
  }

  if (query.search) {
    filter.$or = [
      { title: new RegExp(query.search.trim(), "i") },
      { description: new RegExp(query.search.trim(), "i") },
    ];
  }

  const issues = await Issue.find(filter)
    .populate("assignee", "name email avatar avatarColor")
    .populate("reporter", "name email avatar")
    .sort({ number: -1, createdAt: -1 });

  // Populate comments for all returned issues
  const issueIds = issues.map((i) => i._id);
  const allComments = await IssueComment.find({ issue: { $in: issueIds } }).sort({ createdAt: 1 });

  const commentsByIssue = {};
  allComments.forEach((c) => {
    const key = c.issue.toString();
    if (!commentsByIssue[key]) commentsByIssue[key] = [];
    commentsByIssue[key].push(c);
  });

  return issues.map((i) => formatIssue(i, commentsByIssue[i._id.toString()] || []));
};

/**
 * Get single issue by ID or issue number
 */
const getIssueById = async (projectId, issueId) => {
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
    return null;
  }

  const issue = await Issue.findOne(query)
    .populate("assignee", "name email avatar avatarColor")
    .populate("reporter", "name email avatar");

  if (!issue) return null;

  const comments = await IssueComment.find({ issue: issue._id }).sort({ createdAt: 1 });
  return formatIssue(issue, comments);
};

/**
 * Update issue
 */
const updateIssue = async (projectId, user, issueId, updates, userRole) => {
  if (userRole === "VIEWER") {
    const error = new Error("Permission denied: Viewers cannot update issues");
    error.statusCode = 403;
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

  if (updates.title) issue.title = updates.title.trim();
  if (updates.description !== undefined) issue.description = updates.description.trim();
  if (updates.status) issue.status = updates.status;
  if (updates.priority) issue.priority = updates.priority;
  if (Array.isArray(updates.labels)) issue.labels = updates.labels;

  if (updates.assignee !== undefined) {
    if (!updates.assignee) {
      issue.assignee = null;
      issue.assigneeInfo = { name: "Unassigned", initials: "UA", role: "" };
    } else {
      let resolvedUser = null;
      if (typeof updates.assignee === "object") {
        if (updates.assignee._id || updates.assignee.id) {
          resolvedUser = await User.findById(updates.assignee._id || updates.assignee.id);
        } else if (updates.assignee.name) {
          resolvedUser = await User.findOne({ name: new RegExp(`^${updates.assignee.name}$`, "i") });
        }
      } else if (mongoose.Types.ObjectId.isValid(updates.assignee)) {
        resolvedUser = await User.findById(updates.assignee);
      }

      if (resolvedUser) {
        const membership = await ProjectMembership.findOne({
          project: projectId,
          user: resolvedUser._id,
          status: "ACTIVE",
        });

        if (!membership) {
          const error = new Error("Assignee must be an active member of this project");
          error.statusCode = 400;
          throw error;
        }

        issue.assignee = resolvedUser._id;
        issue.assigneeInfo = {
          name: resolvedUser.name,
          initials: resolvedUser.name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .substring(0, 2)
            .toUpperCase(),
          role: membership.role || "Developer",
        };
      }
    }
  }

  await issue.save();

  try {
    const { createActivity } = require("./activityService");
    const { createNotification } = require("./notificationService");

    await createActivity({
      project: projectId,
      actor: user._id,
      type: "ISSUE_UPDATED",
      entityType: "ISSUE",
      entityId: issue._id,
      title: `${user.name || "User"} updated Issue #${issue.number}`,
      message: `${user.name || "User"} updated Issue #${issue.number}: "${issue.title}"`,
      metadata: { issueNumber: issue.number, title: issue.title, status: issue.status, priority: issue.priority },
    });

    if (updates.assignee && issue.assignee && issue.assignee.toString() !== user._id.toString()) {
      await createNotification({
        recipient: issue.assignee,
        actor: user._id,
        project: projectId,
        type: "ISSUE_ASSIGNED",
        title: `${user.name || "Teammate"} assigned you Issue #${issue.number}`,
        message: issue.title,
        entityType: "ISSUE",
        entityId: issue._id,
        metadata: { issueNumber: issue.number, title: issue.title },
      });
    }
  } catch (err) {
    console.warn("Issue update activity warning:", err.message);
  }

  const comments = await IssueComment.find({ issue: issue._id }).sort({ createdAt: 1 });
  return formatIssue(issue, comments);
};

/**
 * Add comment to issue
 */
const addComment = async (projectId, user, issueId, text, userRole) => {
  if (userRole === "VIEWER") {
    const error = new Error("Permission denied: Viewers cannot comment on issues");
    error.statusCode = 403;
    throw error;
  }

  const trimmed = (text || "").trim();
  if (!trimmed) {
    const error = new Error("Comment text is required");
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

  const userInitials = (user.name || "User")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  const comment = await IssueComment.create({
    issue: issue._id,
    author: user._id,
    authorName: user.name || "User",
    authorInitials: userInitials,
    content: trimmed,
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
      message: `${user.name || "User"}: "${trimmed}"`,
      metadata: { issueNumber: issue.number, title: issue.title },
    });

    // Notify reporter if not commenter
    if (issue.reporter && issue.reporter.toString() !== user._id.toString()) {
      await createNotification({
        recipient: issue.reporter,
        actor: user._id,
        project: projectId,
        type: "ISSUE_COMMENTED",
        title: `${user.name || "Teammate"} commented on Issue #${issue.number}`,
        message: trimmed,
        entityType: "ISSUE",
        entityId: issue._id,
        metadata: { issueNumber: issue.number, title: issue.title },
      });
    }

    // Notify assignee if not commenter and not reporter
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
        message: trimmed,
        entityType: "ISSUE",
        entityId: issue._id,
        metadata: { issueNumber: issue.number, title: issue.title },
      });
    }
  } catch (err) {
    console.warn("Issue comment activity warning:", err.message);
  }

  const allComments = await IssueComment.find({ issue: issue._id }).sort({ createdAt: 1 });
  return formatIssue(issue, allComments);
};

/**
 * Delete issue
 */
const deleteIssue = async (projectId, user, issueId, userRole) => {
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

  const isReporter = issue.reporter.toString() === user._id.toString();
  const isPrivileged = userRole === "OWNER" || userRole === "ADMIN";

  if (!isReporter && !isPrivileged) {
    const error = new Error("Permission denied: only issue reporter, admin or owner can delete this issue");
    error.statusCode = 403;
    throw error;
  }

  await Promise.all([
    Issue.deleteOne({ _id: issue._id }),
    IssueComment.deleteMany({ issue: issue._id }),
  ]);

  return true;
};

module.exports = {
  createIssue,
  getIssues,
  getIssueById,
  updateIssue,
  addComment,
  deleteIssue,
};
