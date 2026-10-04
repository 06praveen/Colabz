const express = require("express");
const {
  searchUsers,
  getMyProfile,
  updateMyProfile,
  getUserByIdOrUsername,
} = require("../controllers/userController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

// Search users by username, name, or email (Protected)
router.get("/search", protect, searchUsers);

// Current user profile endpoints (Protected)
router.get("/me", protect, getMyProfile);
router.patch("/me", protect, updateMyProfile);

// Public/Member lookup by ID or Username (Protected)
router.get("/:identifier", protect, getUserByIdOrUsername);

module.exports = router;
