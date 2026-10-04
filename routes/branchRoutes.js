const express = require("express");
const {
  getBranches,
  createBranch,
  renameBranch,
  deleteBranch,
} = require("../controllers/branchController");
const { protect, optionalAuth } = require("../middleware/authMiddleware");
const {
  requireProjectMember,
  requireProjectMemberOrPublicReadOnly,
} = require("../middleware/membershipMiddleware");

const router = express.Router({ mergeParams: true });

router.get("/", optionalAuth, requireProjectMemberOrPublicReadOnly, getBranches);
router.post("/", protect, requireProjectMember, createBranch);
router.patch("/:branchId", protect, requireProjectMember, renameBranch);
router.delete("/:branchId", protect, requireProjectMember, deleteBranch);

module.exports = router;
