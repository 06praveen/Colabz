const express = require("express");
const {
  getCommits,
  getCommitById,
  createCommit,
} = require("../controllers/commitController");
const { protect, optionalAuth } = require("../middleware/authMiddleware");
const {
  requireProjectMember,
  requireProjectMemberOrPublicReadOnly,
} = require("../middleware/membershipMiddleware");

const router = express.Router({ mergeParams: true });

router.get("/", optionalAuth, requireProjectMemberOrPublicReadOnly, getCommits);
router.get("/:commitId", optionalAuth, requireProjectMemberOrPublicReadOnly, getCommitById);
router.post("/", protect, requireProjectMember, createCommit);

module.exports = router;
