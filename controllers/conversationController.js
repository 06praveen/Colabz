const conversationService = require("../services/conversationService");
const { sendSuccess, sendError } = require("../utils/apiResponse");

/**
 * Get all conversations for a project
 * Route: GET /api/projects/:projectId/conversations
 */
const getConversations = async (req, res, next) => {
  try {
    const project = req.project;
    const user = req.user;

    const conversations = await conversationService.getConversations(project._id, user);
    return sendSuccess(res, { conversations, count: conversations.length });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single conversation by ID
 * Route: GET /api/projects/:projectId/conversations/:conversationId
 */
const getConversationById = async (req, res, next) => {
  try {
    const project = req.project;
    const user = req.user;
    const { conversationId } = req.params;

    const conversation = await conversationService.getConversationById(project._id, conversationId, user);
    if (!conversation) {
      return sendError(res, "Conversation not found", 404);
    }

    return sendSuccess(res, { conversation });
  } catch (error) {
    next(error);
  }
};

/**
 * Create or get conversation (direct or channel)
 * Route: POST /api/projects/:projectId/conversations
 */
const createConversation = async (req, res, next) => {
  try {
    const project = req.project;
    const user = req.user;
    const { participantId, recipientId, type = "direct", name, description, memberIds = [] } = req.body;

    let conversation;

    if (type === "channel") {
      conversation = await conversationService.createChannelConversation(project._id, user._id, {
        name,
        description,
        memberIds,
      });
    } else {
      const targetUserId = participantId || recipientId;
      conversation = await conversationService.createOrGetDirectConversation(project._id, user._id, targetUserId);
    }

    return sendSuccess(res, { conversation }, 201, "Conversation created successfully");
  } catch (error) {
    if (error.statusCode) {
      return sendError(res, error.message, error.statusCode);
    }
    next(error);
  }
};

/**
 * Mark all messages in conversation as read
 * Route: POST /api/projects/:projectId/conversations/:conversationId/read
 */
const markAsRead = async (req, res, next) => {
  try {
    const project = req.project;
    const user = req.user;
    const { conversationId } = req.params;

    await conversationService.markConversationAsRead(project._id, conversationId, user);
    return sendSuccess(res, null, 200, "Conversation marked as read");
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getConversations,
  getConversationById,
  createConversation,
  markAsRead,
};
