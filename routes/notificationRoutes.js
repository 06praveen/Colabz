const express = require("express");
const {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAllNotifications,
} = require("../controllers/notificationController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

router.get("/", getNotifications);
router.get("/unread-count", getUnreadCount);
router.patch("/read-all", markAllAsRead);
router.delete("/clear-all", clearAllNotifications);
router.patch("/:notificationId/read", markAsRead);
router.delete("/:notificationId", deleteNotification);

module.exports = router;
