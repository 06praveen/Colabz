import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { notificationService } from '../services/notificationService';
import { activityService } from '../services/activityService';
import { projectService } from '../services/projectService';
import { getSocket } from '../services/socket';
import { useToast } from './ToastContext';
import { useAuth } from './AuthContext';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [activity, setActivity] = useState([]);
  const [preferences, setPreferences] = useState({
    assignment: true,
    mention: true,
    issue: true,
    task: true,
    repository: true,
    member: true,
    chat: true,
    call: true,
    system: true,
  });
  const [mutedProjects, setMutedProjects] = useState({});
  const [filter, setFilter] = useState('all'); // all | unread | assignment | mention | issue | task | repository | member | chat | call | system
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const { addToast } = useToast();
  const { user, isAuthenticated } = useAuth();

  const loadInitialData = useCallback(async () => {
    if (!isAuthenticated) {
      setNotifications([]);
      setUnreadCount(0);
      setActivity([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const [notifs, unread, projects] = await Promise.all([
        notificationService.getNotifications({ limit: 50 }).catch(() => []),
        notificationService.getUnreadCount().catch(() => 0),
        projectService.getProjects().catch(() => []),
      ]);

      setNotifications(notifs || []);
      setUnreadCount(typeof unread === 'number' ? unread : 0);

      // Load recent activities across user projects
      if (projects && projects.length > 0) {
        const activityPromises = projects.slice(0, 5).map((p) =>
          activityService.getProjectActivity(p.id || p._id, { limit: 10 }).catch(() => [])
        );
        const results = await Promise.all(activityPromises);
        const combined = results.flat().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setActivity(combined);
      } else {
        setActivity([]);
      }
    } catch (err) {
      console.error('Failed to load notifications/activity:', err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Real-time Socket.IO notification listener
  useEffect(() => {
    if (!isAuthenticated) return;

    const socket = getSocket();
    if (!socket) return;

    const handleNewNotification = (newNotif) => {
      if (!newNotif) return;

      const notifId = newNotif.id || newNotif._id;

      setNotifications((prev) => {
        // Prevent duplicate notification in local state
        const exists = prev.some((n) => (n.id || n._id) === notifId);
        if (exists) return prev;
        return [newNotif, ...prev];
      });

      setUnreadCount((prev) => prev + 1);

      // Add toast banner
      addToast({
        title: newNotif.title || 'New Notification',
        message: newNotif.message || '',
        type: 'info',
      });
    };

    socket.on('notification:new', handleNewNotification);

    return () => {
      socket.off('notification:new', handleNewNotification);
    };
  }, [isAuthenticated, addToast]);

  const markAsRead = async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) =>
          (n.id || n._id) === notificationId
            ? { ...n, isRead: true, read: true, readAt: new Date().toISOString() }
            : n
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true, read: true, readAt: new Date().toISOString() }))
      );
      setUnreadCount(0);
      addToast({
        title: 'Notifications updated',
        message: 'All notifications marked as read',
        type: 'success',
      });
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await notificationService.deleteNotification(notificationId);
      const target = notifications.find((n) => (n.id || n._id) === notificationId);
      if (target && !target.isRead && !target.read) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
      setNotifications((prev) => prev.filter((n) => (n.id || n._id) !== notificationId));
      addToast({
        title: 'Notification removed',
        message: 'The notification was deleted',
        type: 'info',
      });
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  };

  const clearNotifications = async () => {
    try {
      await notificationService.clearAllNotifications();
      setNotifications([]);
      setUnreadCount(0);
      addToast({
        title: 'Notifications cleared',
        message: 'All notification items removed',
        type: 'info',
      });
    } catch (err) {
      console.error('Failed to clear notifications:', err);
    }
  };

  const togglePreference = (key) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
    addToast({
      title: 'Preference saved',
      message: `Notification setting for ${key} updated`,
      type: 'success',
    });
  };

  const toggleMuteProject = (projectId) => {
    setMutedProjects((prev) => {
      const isMuted = !prev[projectId];
      addToast({
        title: isMuted ? 'Project muted' : 'Project unmuted',
        message: isMuted
          ? 'Notifications from this project are now muted'
          : 'Project notifications restored',
        type: isMuted ? 'warning' : 'success',
      });
      return { ...prev, [projectId]: isMuted };
    });
  };

  const refreshActivity = async (projectId = null) => {
    try {
      if (projectId) {
        const acts = await activityService.getProjectActivity(projectId);
        setActivity(acts);
      } else {
        const projects = await projectService.getProjects().catch(() => []);
        if (projects && projects.length > 0) {
          const results = await Promise.all(
            projects.slice(0, 5).map((p) =>
              activityService.getProjectActivity(p.id || p._id, { limit: 10 }).catch(() => [])
            )
          );
          setActivity(results.flat().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
        }
      }
    } catch (err) {
      console.error('Failed to refresh activity:', err);
    }
  };

  const value = {
    notifications,
    unreadCount,
    activity,
    preferences,
    mutedProjects,
    filter,
    setFilter,
    searchQuery,
    setSearchQuery,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearNotifications,
    togglePreference,
    toggleMuteProject,
    refreshActivity,
    loadInitialData,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotificationContext() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotificationContext must be used within a NotificationProvider');
  }
  return context;
}
