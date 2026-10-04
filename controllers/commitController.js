const commitService = require("../services/commitService");
const { sendSuccess, sendError } = require("../utils/apiResponse");

/**
 * Get all commits for project
 * Route: GET /api/projects/:projectId/commits
 */
const getCommits = async (req, res, next) => {
  try {
    const project = req.project;
    const commits = await commitService.getCommits(project._id, req.query);
    return sendSuccess(res, { commits, count: commits.length });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single commit by ID or hash
 * Route: GET /api/projects/:projectId/commits/:commitId
 */
const getCommitById = async (req, res, next) => {
  try {
    const project = req.project;
    const { commitId } = req.params;

    const commit = await commitService.getCommitById(project._id, commitId);
    if (!commit) {
      return sendError(res, "Commit not found", 404);
    }

    return sendSuccess(res, { commit });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new commit
 * Route: POST /api/projects/:projectId/commits
 */
const createCommit = async (req, res, next) => {
  try {
    const project = req.project;
    const user = req.user;
    const role = (req.membership?.role || "VIEWER").toUpperCase();

    const commit = await commitService.createCommit(project, user, req.body, role);
    return sendSuccess(res, { commit }, 201, "Commit created successfully");
  } catch (error) {
    if (error.statusCode) {
      return sendError(res, error.message, error.statusCode);
    }
    next(error);
  }
};

/**
 * Get commit history for a single file
 * Route: GET /api/projects/:projectId/repository/files/:fileId/history
 */
const getFileHistory = async (req, res, next) => {
  try {
    const project = req.project;
    const { fileId } = req.params;

    const commits = await commitService.getFileHistory(project._id, fileId);
    return sendSuccess(res, { commits, count: commits.length });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCommits,
  getCommitById,
  createCommit,
  getFileHistory,
};
