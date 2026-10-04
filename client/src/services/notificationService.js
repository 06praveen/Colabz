import api from './api';

export const notificationService = {
  /**
   * Get paginated notifications for current user
   */
  getNotifications: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.page) query.append('page', params.page);
    if (params.limit) query.append('limit', params.limit);
    if (params.unreadOnly || params.filter === 'unread') query.append('unreadOnly', 'true');
    if (params.projectId) query.append('projectId', params.projectId);

    const res = await api.get(`/api/notifications?${query.toString()}`);
    return res.data?.data?.notifications || [];
  },

  /**
   * Get unread notification count
   */
  getUnreadCount: async () => {
    const res = await api.get('/api/notifications/unread-count');
    return res.data?.data?.count || 0;
  },

  /**
   * Mark single notification as read
   */
  markAsRead: async (notificationId) => {
    const res = await api.patch(`/api/notifications/${notificationId}/read`);
    return res.data?.data?.notification;
  },

  /**
   * Mark all notifications as read
   */
  markAllAsRead: async () => {
    const res = await api.patch('/api/notifications/read-all');
    return res.data?.data;
  },

  /**
   * Delete single notification
   */
  deleteNotification: async (notificationId) => {
    const res = await api.delete(`/api/notifications/${notificationId}`);
    return res.data?.data;
  },

  /**
   * Clear all notifications
   */
  clearAllNotifications: async () => {
    const res = await api.delete('/api/notifications');
    return res.data?.data;
  },
};

export default notificationService;
