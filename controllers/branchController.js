const branchService = require("../services/branchService");
const { sendSuccess, sendError } = require("../utils/apiResponse");

/**
 * Get all branches for project
 * Route: GET /api/projects/:projectId/branches
 */
const getBranches = async (req, res, next) => {
  try {
    const project = req.project;
    const branches = await branchService.getBranches(project._id);
    return sendSuccess(res, { branches, count: branches.length });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new branch
 * Route: POST /api/projects/:projectId/branches
 */
const createBranch = async (req, res, next) => {
  try {
    const project = req.project;
    const user = req.user;
    const role = (req.membership?.role || "VIEWER").toUpperCase();

    const branch = await branchService.createBranch(project, user, req.body, role);
    return sendSuccess(res, { branch }, 201, "Branch created successfully");
  } catch (error) {
    if (error.statusCode) {
      return sendError(res, error.message, error.statusCode);
    }
    next(error);
  }
};

/**
 * Rename branch
 * Route: PATCH /api/projects/:projectId/branches/:branchId
 */
const renameBranch = async (req, res, next) => {
  try {
    const project = req.project;
    const { branchId } = req.params;
    const { name } = req.body;
    const role = (req.membership?.role || "VIEWER").toUpperCase();

    const branch = await branchService.renameBranch(project._id, branchId, name, role);
    return sendSuccess(res, { branch }, 200, "Branch renamed successfully");
  } catch (error) {
    if (error.statusCode) {
      return sendError(res, error.message, error.statusCode);
    }
    next(error);
  }
};

/**
 * Delete branch
 * Route: DELETE /api/projects/:projectId/branches/:branchId
 */
const deleteBranch = async (req, res, next) => {
  try {
    const project = req.project;
    const { branchId } = req.params;
    const role = (req.membership?.role || "VIEWER").toUpperCase();
    const user = req.user;

    await branchService.deleteBranch(project._id, branchId, role, user);
    return sendSuccess(res, null, 200, "Branch deleted successfully");
  } catch (error) {
    if (error.statusCode) {
      return sendError(res, error.message, error.statusCode);
    }
    next(error);
  }
};

module.exports = {
  getBranches,
  createBranch,
  renameBranch,
  deleteBranch,
};
