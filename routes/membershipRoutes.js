const express = require("express");
const {
  getProjectMembers,
  getMyMembership,
  addProjectMember,
  updateMemberRole,
  removeMember,
  leaveProject,
} = require("../controllers/membershipController");
const protect = require("../middleware/authMiddleware");
const { requireProjectMember } = require("../middleware/membershipMiddleware");

const router = express.Router({ mergeParams: true });

// All routes require authentication and active membership
router.use(protect);
router.use(requireProjectMember);

router.get("/", getProjectMembers);
router.post("/", addProjectMember);
router.get("/me", getMyMembership);
router.patch("/:userId", updateMemberRole);
router.delete("/:userId", removeMember);

module.exports = router;
