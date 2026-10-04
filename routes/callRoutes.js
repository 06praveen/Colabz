const express = require("express");
const {
  startCall,
  getCalls,
  getCallById,
} = require("../controllers/callController");
const protect = require("../middleware/authMiddleware");
const { requireProjectMember } = require("../middleware/membershipMiddleware");

const router = express.Router({ mergeParams: true });

// All call routes require authenticated project membership
router.use(protect);
router.use(requireProjectMember);

router.post("/", startCall);
router.get("/", getCalls);
router.get("/:callId", getCallById);

module.exports = router;
