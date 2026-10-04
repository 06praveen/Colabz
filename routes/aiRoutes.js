const express = require("express");
const { handleChat, getAiStatus } = require("../controllers/aiController");
const protect = require("../middleware/authMiddleware");
const rateLimit = require("../middleware/rateLimitMiddleware");

const router = express.Router();

// Rate limiter for AI chat: 30 requests per minute per authenticated user/IP
const aiChatLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: "Too many AI requests. Please wait a minute before asking more questions.",
});

// AI Chat and coding assistant endpoint - requires authentication & rate limiting
router.post("/chat", protect, aiChatLimiter, handleChat);

// AI Health / configuration status check
router.get("/status", getAiStatus);

module.exports = router;
