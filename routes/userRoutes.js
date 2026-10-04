const express = require("express");
const {
  searchUsers,
  getPublicUserProfile,
  getMyProfile,
  updateMyProfile,
  getUserByIdOrUsername,
} = require("../controllers/userController");
const { protect, optionalAuth } = require("../middleware/authMiddleware");

const router = express.Router();

// Search users by username or name (Public/Optional Auth)
router.get("/search", optionalAuth, searchUsers);

// Public User Profile & Repositories by username
router.get("/profile/:username", optionalAuth, getPublicUserProfile);

// Current user profile endpoints (Protected)
router.get("/me", protect, getMyProfile);
router.patch("/me", protect, updateMyProfile);

// Public/Member lookup by ID or Username
router.get("/:identifier", optionalAuth, getUserByIdOrUsername);

module.exports = router;
