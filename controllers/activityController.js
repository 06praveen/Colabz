const activityService = require("../services/activityService");
const { sendSuccess, sendError } = require("../utils/apiResponse");

/**
 * Get project activity feed
 * Route: GET /api/projects/:projectId/activity
 */
const getProjectActivities = async (req, res, next) => {
  try {
    const project = req.project;
    const data = await activityService.getProjectActivities(project._id, req.query);
    return sendSuccess(res, data);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProjectActivities,
};
