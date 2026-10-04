const issueService = require("../services/issueService");
const { sendSuccess, sendError } = require("../utils/apiResponse");

/**
 * Create a new issue in project
 * Route: POST /api/projects/:projectId/issues
 */
const createIssue = async (req, res, next) => {
  try {
    const project = req.project;
    const user = req.user;
    const role = (req.membership?.role || "VIEWER").toUpperCase();

    if (role === "VIEWER") {
      return sendError(res, "Permission denied: Viewers cannot create issues", 403);
    }

    const { title } = req.body;
    if (!title || !title.trim()) {
      return sendError(res, "Issue title is required", 400);
    }

    const issue = await issueService.createIssue(project, user, req.body);
    return sendSuccess(res, { issue }, 201, "Issue created successfully");
  } catch (error) {
    if (error.statusCode) {
      return sendError(res, error.message, error.statusCode);
    }
    next(error);
  }
};

/**
 * Get all issues for project
 * Route: GET /api/projects/:projectId/issues
 */
const getIssues = async (req, res, next) => {
  try {
    const project = req.project;
    const issues = await issueService.getIssues(project._id, req.query);
    return sendSuccess(res, { issues, count: issues.length });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single issue by ID
 * Route: GET /api/projects/:projectId/issues/:issueId
 */
const getIssueById = async (req, res, next) => {
  try {
    const project = req.project;
    const { issueId } = req.params;

    const issue = await issueService.getIssueById(project._id, issueId);
    if (!issue) {
      return sendError(res, "Issue not found", 404);
    }

    return sendSuccess(res, { issue });
  } catch (error) {
    next(error);
  }
};

/**
 * Update an issue
 * Route: PATCH /api/projects/:projectId/issues/:issueId
 */
const updateIssue = async (req, res, next) => {
  try {
    const project = req.project;
    const user = req.user;
    const { issueId } = req.params;
    const role = (req.membership?.role || "VIEWER").toUpperCase();

    const issue = await issueService.updateIssue(project._id, user, issueId, req.body, role);
    return sendSuccess(res, { issue }, 200, "Issue updated successfully");
  } catch (error) {
    if (error.statusCode) {
      return sendError(res, error.message, error.statusCode);
    }
    next(error);
  }
};

/**
 * Delete an issue
 * Route: DELETE /api/projects/:projectId/issues/:issueId
 */
const deleteIssue = async (req, res, next) => {
  try {
    const project = req.project;
    const user = req.user;
    const { issueId } = req.params;
    const role = (req.membership?.role || "VIEWER").toUpperCase();

    await issueService.deleteIssue(project._id, user, issueId, role);
    return sendSuccess(res, null, 200, "Issue deleted successfully");
  } catch (error) {
    if (error.statusCode) {
      return sendError(res, error.message, error.statusCode);
    }
    next(error);
  }
};

module.exports = {
  createIssue,
  getIssues,
  getIssueById,
  updateIssue,
  deleteIssue,
};
