const express = require("express");
const {
  getCommits,
  getCommitById,
  createCommit,
} = require("../controllers/commitController");
const protect = require("../middleware/authMiddleware");
const { requireProjectMember } = require("../middleware/membershipMiddleware");

const router = express.Router({ mergeParams: true });

// All routes require authentication and project membership
router.use(protect);
router.use(requireProjectMember);

router.get("/", getCommits);
router.get("/:commitId", getCommitById);
router.post("/", createCommit);

module.exports = router;
