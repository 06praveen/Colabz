const express = require("express");
const {
  createIssue,
  getIssues,
  getIssueById,
  updateIssue,
  deleteIssue,
} = require("../controllers/issueController");
const {
  createComment,
  getComments,
  updateComment,
  deleteComment,
} = require("../controllers/issueCommentController");
const protect = require("../middleware/authMiddleware");
const { requireProjectMember } = require("../middleware/membershipMiddleware");

const router = express.Router({ mergeParams: true });

// All routes require authentication and active project membership
router.use(protect);
router.use(requireProjectMember);

// Issue CRUD
router.post("/", createIssue);
router.get("/", getIssues);
router.get("/:issueId", getIssueById);
router.patch("/:issueId", updateIssue);
router.delete("/:issueId", deleteIssue);

// Issue Comments
router.post("/:issueId/comments", createComment);
router.get("/:issueId/comments", getComments);
router.patch("/:issueId/comments/:commentId", updateComment);
router.delete("/:issueId/comments/:commentId", deleteComment);

module.exports = router;
