const notificationService = require("../services/notificationService");
const { sendSuccess, sendError } = require("../utils/apiResponse");

/**
 * Get notifications for current authenticated user
 * Route: GET /api/notifications
 */
const getNotifications = async (req, res, next) => {
  try {
    const user = req.user;
    const data = await notificationService.getNotifications(user._id, req.query);
    return sendSuccess(res, data);
  } catch (error) {
    next(error);
  }
};

/**
 * Get unread notification count
 * Route: GET /api/notifications/unread-count
 */
const getUnreadCount = async (req, res, next) => {
  try {
    const user = req.user;
    const count = await notificationService.getUnreadCount(user._id);
    return sendSuccess(res, { count });
  } catch (error) {
    next(error);
  }
};

/**
 * Mark single notification as read
 * Route: PATCH /api/notifications/:notificationId/read
 */
const markAsRead = async (req, res, next) => {
  try {
    const user = req.user;
    const { notificationId } = req.params;

    const notification = await notificationService.markAsRead(notificationId, user._id);
    return sendSuccess(res, { notification }, 200, "Notification marked as read");
  } catch (error) {
    if (error.statusCode) {
      return sendError(res, error.message, error.statusCode);
    }
    next(error);
  }
};

/**
 * Mark all notifications as read
 * Route: PATCH /api/notifications/read-all
 */
const markAllAsRead = async (req, res, next) => {
  try {
    const user = req.user;
    const { projectId } = req.query;

    const result = await notificationService.markAllAsRead(user._id, projectId);
    return sendSuccess(res, result, 200, "All notifications marked as read");
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a notification
 * Route: DELETE /api/notifications/:notificationId
 */
const deleteNotification = async (req, res, next) => {
  try {
    const user = req.user;
    const { notificationId } = req.params;

    await notificationService.deleteNotification(notificationId, user._id);
    return sendSuccess(res, null, 200, "Notification deleted");
  } catch (error) {
    if (error.statusCode) {
      return sendError(res, error.message, error.statusCode);
    }
    next(error);
  }
};

/**
 * Clear all notifications
 * Route: DELETE /api/notifications/clear-all
 */
const clearAllNotifications = async (req, res, next) => {
  try {
    const user = req.user;
    const result = await notificationService.clearAllNotifications(user._id);
    return sendSuccess(res, result, 200, "All notifications cleared");
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAllNotifications,
};
