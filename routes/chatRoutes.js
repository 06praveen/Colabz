const express = require("express");
const {
  getConversations,
  getConversationById,
  createConversation,
  markAsRead,
} = require("../controllers/conversationController");
const {
  getMessages,
  sendMessage,
  editMessage,
  deleteMessage,
  toggleReaction,
} = require("../controllers/messageController");
const protect = require("../middleware/authMiddleware");
const { requireProjectMember } = require("../middleware/membershipMiddleware");

const router = express.Router({ mergeParams: true });

// All routes require authentication and project membership
router.use(protect);
router.use(requireProjectMember);

// Conversations endpoints
router.get("/", getConversations);
router.post("/", createConversation);
router.get("/:conversationId", getConversationById);
router.post("/:conversationId/read", markAsRead);

// Messages endpoints
router.get("/:conversationId/messages", getMessages);
router.post("/:conversationId/messages", sendMessage);
router.patch("/:conversationId/messages/:messageId", editMessage);
router.delete("/:conversationId/messages/:messageId", deleteMessage);
router.post("/:conversationId/messages/:messageId/reactions", toggleReaction);

module.exports = router;
