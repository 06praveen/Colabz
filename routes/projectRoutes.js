const express = require("express");
const {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
} = require("../controllers/projectController");
const { leaveProject } = require("../controllers/membershipController");
const membershipRoutes = require("./membershipRoutes");
const { projectInvitationRouter } = require("./invitationRoutes");
const taskRoutes = require("./taskRoutes");
const issueRoutes = require("./issueRoutes");
const repositoryRoutes = require("./repositoryRoutes");
const branchRoutes = require("./branchRoutes");
const commitRoutes = require("./commitRoutes");
const chatRoutes = require("./chatRoutes");
const activityRoutes = require("./activityRoutes");
const callRoutes = require("./callRoutes");
const protect = require("../middleware/authMiddleware");
const { requireProjectMember } = require("../middleware/membershipMiddleware");
const validate = require("../middleware/validateMiddleware");
const {
  createProjectValidator,
  updateProjectValidator,
} = require("../validators/projectValidator");

const router = express.Router();

// Project nested sub-routers
router.use("/:projectId/members", membershipRoutes);
router.use("/:projectId/invitations", projectInvitationRouter);
router.use("/:projectId/tasks", taskRoutes);
router.use("/:projectId/issues", issueRoutes);
router.use("/:projectId/repository", repositoryRoutes);
router.use("/:projectId/branches", branchRoutes);
router.use("/:projectId/commits", commitRoutes);
router.use("/:projectId/conversations", chatRoutes);
router.use("/:projectId/chat", chatRoutes);
router.use("/:projectId/activity", activityRoutes);
router.use("/:projectId/calls", callRoutes);

// Leave project endpoint
router.post("/:projectId/leave", protect, requireProjectMember, leaveProject);

// Core project endpoints
router.post("/", protect, validate(createProjectValidator), createProject);
router.get("/", protect, getProjects);
router.get("/:projectId", protect, getProjectById);
router.patch("/:projectId", protect, validate(updateProjectValidator), updateProject);
router.delete("/:projectId", protect, deleteProject);

module.exports = router;
