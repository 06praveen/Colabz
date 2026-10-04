const express = require("express");
const {
  getBranches,
  createBranch,
  renameBranch,
  deleteBranch,
} = require("../controllers/branchController");
const protect = require("../middleware/authMiddleware");
const { requireProjectMember } = require("../middleware/membershipMiddleware");

const router = express.Router({ mergeParams: true });

// All routes require authentication and project membership
router.use(protect);
router.use(requireProjectMember);

router.get("/", getBranches);
router.post("/", createBranch);
router.patch("/:branchId", renameBranch);
router.delete("/:branchId", deleteBranch);

module.exports = router;
