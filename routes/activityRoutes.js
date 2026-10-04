const express = require("express");
const { getProjectActivities } = require("../controllers/activityController");
const protect = require("../middleware/authMiddleware");
const { requireProjectMember } = require("../middleware/membershipMiddleware");

const router = express.Router({ mergeParams: true });

router.use(protect);
router.use(requireProjectMember);

router.get("/", getProjectActivities);

module.exports = router;
