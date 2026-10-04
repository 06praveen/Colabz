const callService = require("../services/callService");
const { sendSuccess, sendError } = require("../utils/apiResponse");

/**
 * Start a new call
 * Route: POST /api/projects/:projectId/calls
 */
const startCall = async (req, res, next) => {
  try {
    const project = req.project;
    const userId = req.user._id || req.user.id;
    const { receiverId, type, title } = req.body;

    const call = await callService.createCall({
      projectId: project._id,
      callerId: userId,
      receiverId,
      type,
      title,
    });

    return sendSuccess(res, { call }, 201, "Call initiated successfully");
  } catch (error) {
    if (error.statusCode) {
      return sendError(res, error.message, error.statusCode);
    }
    next(error);
  }
};

/**
 * Get call history for project
 * Route: GET /api/projects/:projectId/calls
 */
const getCalls = async (req, res, next) => {
  try {
    const project = req.project;
    const userId = req.user._id || req.user.id;

    const calls = await callService.getCalls(project._id, userId, req.query);
    return sendSuccess(res, { calls, count: calls.length });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single call by ID
 * Route: GET /api/projects/:projectId/calls/:callId
 */
const getCallById = async (req, res, next) => {
  try {
    const project = req.project;
    const userId = req.user._id || req.user.id;
    const { callId } = req.params;

    const call = await callService.getCallById(callId, project._id, userId);
    if (!call) {
      return sendError(res, "Call not found", 404);
    }

    return sendSuccess(res, { call });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  startCall,
  getCalls,
  getCallById,
};
