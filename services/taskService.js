const mongoose = require("mongoose");
const Task = require("../models/Task");
const ProjectMembership = require("../models/ProjectMembership");
const User = require("../models/User");

/**
 * Format task for consistent API responses
 */
const formatTask = (task) => {
  const t = task.toJSON ? task.toJSON() : task;
  const a = task.assignee;
  let assigneeFormatted = task.assigneeInfo || { name: "Unassigned", initials: "UA", role: "" };

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

  return {
    id: t._id ? t._id.toString() : t.id,
    _id: t._id ? t._id.toString() : t.id,
    identifier: t.identifier || `COL-${t.sequenceNumber || 1}`,
    projectId: t.project ? (t.project._id ? t.project._id.toString() : t.project.toString()) : null,
    title: t.title,
    description: t.description || "",
    status: t.status || "TODO",
    priority: t.priority || "Medium",
    assignee: assigneeFormatted,
    reporter: t.reporter,
    labels: t.labels || [],
    dueDate: t.dueDate || "",
    order: t.order || 0,
    createdAt: t.createdAt,
    updatedAt: t.updatedAt,
    activity: (t.activity || []).map((act) => ({
      id: act._id ? act._id.toString() : act.id,
      user: act.user,
      action: act.action,
      time: act.time || "Recently",
      createdAt: act.createdAt,
    })),
  };
};

/**
 * Create a new task
 */
const createTask = async (project, user, taskData) => {
  const { title, description, status, priority, assignee, labels, dueDate, order } = taskData;

  // Auto-increment sequence number for project
  const count = await Task.countDocuments({ project: project._id });
  const sequenceNumber = count + 1;
  const prefix = (project.name || "COL").replace(/[^a-zA-Z]/g, "").slice(0, 3).toUpperCase() || "COL";
  const identifier = `${prefix}-${sequenceNumber}`;

  let assigneeId = null;
  let assigneeInfo = { name: "Unassigned", initials: "UA", role: "Contributor" };

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
      // Validate assignee membership in project
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
        role: membership?.role || "Contributor",
      };
    }
  }

  const initialActivity = [
    {
      id: `act_${Date.now()}`,
      user: user.name || "Team Member",
      action: "created the task",
      time: "Just now",
      createdAt: new Date(),
    },
  ];

  const task = await Task.create({
    project: project._id,
    identifier,
    sequenceNumber,
    title: title.trim(),
    description: (description || "").trim(),
    status: (status || "TODO").toUpperCase(),
    priority: priority || "Medium",
    assignee: assigneeId,
    assigneeInfo,
    reporter: user._id,
    labels: Array.isArray(labels) ? labels : ["Frontend"],
    dueDate: dueDate || null,
    order: typeof order === "number" ? order : 0,
    activity: initialActivity,
  });

  // Record Project Activity & Notification
  try {
    const { createActivity } = require("./activityService");
    const { createNotification } = require("./notificationService");

    await createActivity({
      project: project._id,
      actor: user._id,
      type: "TASK_CREATED",
      entityType: "TASK",
      entityId: task._id,
      title: `${user.name || "User"} created task ${identifier}`,
      message: `${user.name || "User"} created task "${title}"`,
      metadata: { identifier, title, status: task.status, priority: task.priority },
    });

    if (assigneeId && assigneeId.toString() !== user._id.toString()) {
      await createNotification({
        recipient: assigneeId,
        actor: user._id,
        project: project._id,
        type: "TASK_ASSIGNED",
        title: `${user.name || "Teammate"} assigned you ${identifier}`,
        message: title,
        entityType: "TASK",
        entityId: task._id,
        metadata: { identifier, title },
      });
    }
  } catch (err) {
    console.warn("Task activity/notification warning:", err.message);
  }

  return formatTask(task);
};

/**
 * Get tasks for a project with optional filtering
 */
const getTasks = async (projectId, query = {}) => {
  const filter = { project: projectId };

  if (query.status) {
    filter.status = new RegExp(`^${query.status.trim()}$`, "i");
  }
  if (query.priority) {
    filter.priority = new RegExp(`^${query.priority.trim()}$`, "i");
  }
  if (query.label) {
    filter.labels = { $in: [new RegExp(query.label.trim(), "i")] };
  }
  if (query.assignee && mongoose.Types.ObjectId.isValid(query.assignee)) {
    filter.assignee = query.assignee;
  }
  if (query.search) {
    filter.$or = [
      { title: new RegExp(query.search.trim(), "i") },
      { description: new RegExp(query.search.trim(), "i") },
      { identifier: new RegExp(query.search.trim(), "i") },
    ];
  }

  const tasks = await Task.find(filter)
    .populate("assignee", "name email avatar avatarColor")
    .populate("reporter", "name email avatar")
    .sort({ order: 1, createdAt: -1 });

  return tasks.map(formatTask);
};

/**
 * Get single task by ID or identifier
 */
const getTaskById = async (projectId, taskId) => {
  const query = { project: projectId };

  if (mongoose.Types.ObjectId.isValid(taskId)) {
    query.$or = [{ _id: taskId }, { identifier: taskId }];
  } else {
    query.identifier = taskId;
  }

  const task = await Task.findOne(query)
    .populate("assignee", "name email avatar avatarColor")
    .populate("reporter", "name email avatar");

  return task ? formatTask(task) : null;
};

/**
 * Update task
 */
const updateTask = async (projectId, user, taskId, updates, userRole) => {
  if (userRole === "VIEWER") {
    const error = new Error("Permission denied: Viewers cannot modify tasks");
    error.statusCode = 403;
    throw error;
  }

  const query = { project: projectId };
  if (mongoose.Types.ObjectId.isValid(taskId)) {
    query.$or = [{ _id: taskId }, { identifier: taskId }];
  } else {
    query.identifier = taskId;
  }

  const task = await Task.findOne(query);
  if (!task) {
    const error = new Error("Task not found");
    error.statusCode = 404;
    throw error;
  }

  const actions = [];

  if (updates.status && updates.status.toUpperCase() !== task.status.toUpperCase()) {
    actions.push(`changed status to ${updates.status.toUpperCase()}`);
    task.status = updates.status.toUpperCase();
  }
  if (updates.title) task.title = updates.title.trim();
  if (updates.description !== undefined) task.description = updates.description.trim();
  if (updates.priority) task.priority = updates.priority;
  if (updates.dueDate !== undefined) task.dueDate = updates.dueDate;
  if (updates.order !== undefined) task.order = updates.order;
  if (Array.isArray(updates.labels)) task.labels = updates.labels;

  if (updates.assignee !== undefined) {
    if (!updates.assignee) {
      task.assignee = null;
      task.assigneeInfo = { name: "Unassigned", initials: "UA", role: "" };
      actions.push("unassigned the task");
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

        task.assignee = resolvedUser._id;
        task.assigneeInfo = {
          name: resolvedUser.name,
          initials: resolvedUser.name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .substring(0, 2)
            .toUpperCase(),
          role: membership.role || "Developer",
        };
        actions.push(`assigned to ${resolvedUser.name}`);
      }
    }
  }

  if (actions.length === 0) {
    actions.push("updated task details");
  }

  task.activity.unshift({
    id: `act_${Date.now()}`,
    user: user.name || "Team Member",
    action: actions.join(" and "),
    time: "Just now",
    createdAt: new Date(),
  });

  await task.save();

  try {
    const { createActivity } = require("./activityService");
    const { createNotification } = require("./notificationService");

    const actionText = actions.join(" and ");
    const isCompleted = task.status === "DONE" || task.status === "COMPLETED";

    await createActivity({
      project: projectId,
      actor: user._id,
      type: isCompleted ? "TASK_COMPLETED" : "TASK_UPDATED",
      entityType: "TASK",
      entityId: task._id,
      title: `${user.name || "User"} ${actionText} on ${task.identifier}`,
      message: `${user.name || "User"} ${actionText} on "${task.title}"`,
      metadata: { identifier: task.identifier, status: task.status, priority: task.priority },
    });

    // Notify new assignee if changed
    if (updates.assignee && task.assignee && task.assignee.toString() !== user._id.toString()) {
      await createNotification({
        recipient: task.assignee,
        actor: user._id,
        project: projectId,
        type: "TASK_ASSIGNED",
        title: `${user.name || "Teammate"} assigned you ${task.identifier}`,
        message: task.title,
        entityType: "TASK",
        entityId: task._id,
        metadata: { identifier: task.identifier, title: task.title },
      });
    }

    // Notify reporter on task completion if reporter is different from user
    if (isCompleted && task.reporter && task.reporter.toString() !== user._id.toString()) {
      await createNotification({
        recipient: task.reporter,
        actor: user._id,
        project: projectId,
        type: "TASK_COMPLETED",
        title: `${user.name || "Teammate"} completed task ${task.identifier}`,
        message: task.title,
        entityType: "TASK",
        entityId: task._id,
        metadata: { identifier: task.identifier, title: task.title },
      });
    }
  } catch (err) {
    console.warn("Update task activity warning:", err.message);
  }

  return formatTask(task);
};

/**
 * Delete task
 */
const deleteTask = async (projectId, user, taskId, userRole) => {
  const query = { project: projectId };
  if (mongoose.Types.ObjectId.isValid(taskId)) {
    query.$or = [{ _id: taskId }, { identifier: taskId }];
  } else {
    query.identifier = taskId;
  }

  const task = await Task.findOne(query);
  if (!task) {
    const error = new Error("Task not found");
    error.statusCode = 404;
    throw error;
  }

  const isReporter = task.reporter.toString() === user._id.toString();
  const isPrivileged = userRole === "OWNER" || userRole === "ADMIN";

  if (!isReporter && !isPrivileged) {
    const error = new Error("Permission denied: only task reporter, admin or owner can delete this task");
    error.statusCode = 403;
    throw error;
  }

  await Task.deleteOne({ _id: task._id });
  return true;
};

module.exports = {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
};
