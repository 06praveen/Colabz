const express = require("express");
const {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
} = require("../controllers/taskController");
const protect = require("../middleware/authMiddleware");
const { requireProjectMember } = require("../middleware/membershipMiddleware");

const router = express.Router({ mergeParams: true });

// All routes require authentication and active project membership
router.use(protect);
router.use(requireProjectMember);

router.post("/", createTask);
router.get("/", getTasks);
router.get("/:taskId", getTaskById);
router.patch("/:taskId", updateTask);
router.delete("/:taskId", deleteTask);

module.exports = router;
