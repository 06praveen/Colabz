const issueCommentService = require("../services/issueCommentService");
const { sendSuccess, sendError } = require("../utils/apiResponse");

/**
 * Add a comment to an issue
 * Route: POST /api/projects/:projectId/issues/:issueId/comments
 */
const createComment = async (req, res, next) => {
  try {
    const project = req.project;
    const user = req.user;
    const { issueId } = req.params;
    const { text, content } = req.body;

    const commentText = text || content;
    if (!commentText || !commentText.trim()) {
      return sendError(res, "Comment text is required", 400);
    }

    const comment = await issueCommentService.createComment(
      project._id,
      user,
      issueId,
      commentText
    );

    return sendSuccess(res, { comment }, 201, "Comment added successfully");
  } catch (error) {
    if (error.statusCode) {
      return sendError(res, error.message, error.statusCode);
    }
    next(error);
  }
};

/**
 * Get all comments for an issue
 * Route: GET /api/projects/:projectId/issues/:issueId/comments
 */
const getComments = async (req, res, next) => {
  try {
    const project = req.project;
    const { issueId } = req.params;

    const comments = await issueCommentService.getComments(project._id, issueId);
    return sendSuccess(res, { comments, count: comments.length });
  } catch (error) {
    next(error);
  }
};

/**
 * Update comment
 * Route: PATCH /api/projects/:projectId/issues/:issueId/comments/:commentId
 */
const updateComment = async (req, res, next) => {
  try {
    const project = req.project;
    const user = req.user;
    const { commentId } = req.params;
    const { text, content } = req.body;
    const role = (req.membership?.role || "VIEWER").toUpperCase();

    const commentText = text || content;
    const comment = await issueCommentService.updateComment(
      project._id,
      user,
      commentId,
      commentText,
      role
    );

    return sendSuccess(res, { comment }, 200, "Comment updated successfully");
  } catch (error) {
    if (error.statusCode) {
      return sendError(res, error.message, error.statusCode);
    }
    next(error);
  }
};

/**
 * Delete comment
 * Route: DELETE /api/projects/:projectId/issues/:issueId/comments/:commentId
 */
const deleteComment = async (req, res, next) => {
  try {
    const project = req.project;
    const user = req.user;
    const { commentId } = req.params;
    const role = (req.membership?.role || "VIEWER").toUpperCase();

    await issueCommentService.deleteComment(project._id, user, commentId, role);
    return sendSuccess(res, null, 200, "Comment deleted successfully");
  } catch (error) {
    if (error.statusCode) {
      return sendError(res, error.message, error.statusCode);
    }
    next(error);
  }
};

module.exports = {
  createComment,
  getComments,
  updateComment,
  deleteComment,
};
