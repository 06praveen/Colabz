const taskService = require("../services/taskService");
const { sendSuccess, sendError } = require("../utils/apiResponse");

/**
 * Create a new task in project
 * Route: POST /api/projects/:projectId/tasks
 */
const createTask = async (req, res, next) => {
  try {
    const project = req.project;
    const user = req.user;
    const role = (req.membership?.role || "VIEWER").toUpperCase();

    if (role === "VIEWER") {
      return sendError(res, "Permission denied: Viewers cannot create tasks", 403);
    }

    const { title } = req.body;
    if (!title || !title.trim()) {
      return sendError(res, "Task title is required", 400);
    }

    const task = await taskService.createTask(project, user, req.body);
    return sendSuccess(res, { task }, 201, "Task created successfully");
  } catch (error) {
    if (error.statusCode) {
      return sendError(res, error.message, error.statusCode);
    }
    next(error);
  }
};

/**
 * Get all tasks for project
 * Route: GET /api/projects/:projectId/tasks
 */
const getTasks = async (req, res, next) => {
  try {
    const project = req.project;
    const tasks = await taskService.getTasks(project._id, req.query);
    return sendSuccess(res, { tasks, count: tasks.length });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single task by ID
 * Route: GET /api/projects/:projectId/tasks/:taskId
 */
const getTaskById = async (req, res, next) => {
  try {
    const project = req.project;
    const { taskId } = req.params;

    const task = await taskService.getTaskById(project._id, taskId);
    if (!task) {
      return sendError(res, "Task not found", 404);
    }

    return sendSuccess(res, { task });
  } catch (error) {
    next(error);
  }
};

/**
 * Update a task
 * Route: PATCH /api/projects/:projectId/tasks/:taskId
 */
const updateTask = async (req, res, next) => {
  try {
    const project = req.project;
    const user = req.user;
    const { taskId } = req.params;
    const role = (req.membership?.role || "VIEWER").toUpperCase();

    const task = await taskService.updateTask(project._id, user, taskId, req.body, role);
    return sendSuccess(res, { task }, 200, "Task updated successfully");
  } catch (error) {
    if (error.statusCode) {
      return sendError(res, error.message, error.statusCode);
    }
    next(error);
  }
};

/**
 * Delete a task
 * Route: DELETE /api/projects/:projectId/tasks/:taskId
 */
const deleteTask = async (req, res, next) => {
  try {
    const project = req.project;
    const user = req.user;
    const { taskId } = req.params;
    const role = (req.membership?.role || "VIEWER").toUpperCase();

    await taskService.deleteTask(project._id, user, taskId, role);
    return sendSuccess(res, null, 200, "Task deleted successfully");
  } catch (error) {
    if (error.statusCode) {
      return sendError(res, error.message, error.statusCode);
    }
    next(error);
  }
};

module.exports = {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
};
