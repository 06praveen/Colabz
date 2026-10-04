const messageService = require("../services/messageService");
const { getIO } = require("../sockets/ioStore");
const { sendSuccess, sendError } = require("../utils/apiResponse");

/**
 * Get messages in a conversation
 * Route: GET /api/projects/:projectId/conversations/:conversationId/messages
 */
const getMessages = async (req, res, next) => {
  try {
    const project = req.project;
    const user = req.user;
    const { conversationId } = req.params;

    const data = await messageService.getMessages(project._id, conversationId, user, req.query);
    return sendSuccess(res, data);
  } catch (error) {
    if (error.statusCode) {
      return sendError(res, error.message, error.statusCode);
    }
    next(error);
  }
};

/**
 * Send a message (REST fallback)
 * Route: POST /api/projects/:projectId/conversations/:conversationId/messages
 */
const sendMessage = async (req, res, next) => {
  try {
    const project = req.project;
    const user = req.user;
    const { conversationId } = req.params;

    const message = await messageService.sendMessage(project._id, conversationId, user, req.body);
    const io = getIO();
    if (io) {
      io.to(`conversation:${conversationId}`).emit("message:new", {
        message,
        conversationId,
      });
    }
    return sendSuccess(res, { message }, 201, "Message sent successfully");
  } catch (error) {
    if (error.statusCode) {
      return sendError(res, error.message, error.statusCode);
    }
    next(error);
  }
};

/**
 * Edit a message
 * Route: PATCH /api/projects/:projectId/conversations/:conversationId/messages/:messageId
 */
const editMessage = async (req, res, next) => {
  try {
    const project = req.project;
    const user = req.user;
    const { conversationId, messageId } = req.params;
    const { content } = req.body;

    const message = await messageService.editMessage(project._id, conversationId, messageId, user, content);
    const io = getIO();
    if (io) {
      io.to(`conversation:${conversationId}`).emit("message:updated", {
        message,
        conversationId,
      });
    }
    return sendSuccess(res, { message }, 200, "Message updated successfully");
  } catch (error) {
    if (error.statusCode) {
      return sendError(res, error.message, error.statusCode);
    }
    next(error);
  }
};

/**
 * Delete a message
 * Route: DELETE /api/projects/:projectId/conversations/:conversationId/messages/:messageId
 */
const deleteMessage = async (req, res, next) => {
  try {
    const project = req.project;
    const user = req.user;
    const { conversationId, messageId } = req.params;
    const role = (req.membership?.role || "DEVELOPER").toUpperCase();

    const message = await messageService.deleteMessage(project._id, conversationId, messageId, user, role);
    const io = getIO();
    if (io) {
      io.to(`conversation:${conversationId}`).emit("message:deleted", {
        message,
        messageId,
        conversationId,
      });
    }
    return sendSuccess(res, { message }, 200, "Message deleted successfully");
  } catch (error) {
    if (error.statusCode) {
      return sendError(res, error.message, error.statusCode);
    }
    next(error);
  }
};

/**
 * Toggle reaction on a message
 * Route: POST /api/projects/:projectId/conversations/:conversationId/messages/:messageId/reactions
 */
const toggleReaction = async (req, res, next) => {
  try {
    const project = req.project;
    const user = req.user;
    const { conversationId, messageId } = req.params;
    const { emoji } = req.body;

    const message = await messageService.toggleReaction(project._id, conversationId, messageId, user, emoji);
    const io = getIO();
    if (io) {
      io.to(`conversation:${conversationId}`).emit("message:reaction-updated", {
        message,
        conversationId,
      });
    }
    return sendSuccess(res, { message }, 200, "Reaction updated");
  } catch (error) {
    if (error.statusCode) {
      return sendError(res, error.message, error.statusCode);
    }
    next(error);
  }
};

module.exports = {
  getMessages,
  sendMessage,
  createMessage: sendMessage,
  editMessage,
  deleteMessage,
  toggleReaction,
};
