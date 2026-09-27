import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { mockNotificationService } from '../services/mockNotificationService';
import { useToast } from './ToastContext';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [activity, setActivity] = useState([]);
  const [preferences, setPreferences] = useState({});
  const [mutedProjects, setMutedProjects] = useState({});
  const [filter, setFilter] = useState('all'); // all | unread | assignment | mention | issue | task | repository | member | chat | call | system
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const { addToast } = useToast();

  const loadInitialData = useCallback(async () => {
    try {
      const [notifData, actData, prefData, mutedData] = await Promise.all([
        mockNotificationService.getNotifications('usr_1'),
        mockNotificationService.getActivity(),
        mockNotificationService.getPreferences(),
        mockNotificationService.getMutedProjects()
      ]);
      setNotifications(notifData);
      setActivity(actData);
      setPreferences(prefData);
      setMutedProjects(mutedData);
    } catch (err) {
      console.error('Failed to load notifications data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = async (notificationId) => {
    const updated = await mockNotificationService.markAsRead(notificationId);
    setNotifications(updated);
  };

  const markAllAsRead = async () => {
    const updated = await mockNotificationService.markAllAsRead('usr_1');
    setNotifications(updated);
    addToast({
      title: 'Notifications updated',
      message: 'All notifications marked as read',
      type: 'success'
    });
  };

  const deleteNotification = async (notificationId) => {
    const updated = await mockNotificationService.deleteNotification(notificationId);
    setNotifications(updated);
    addToast({
      title: 'Notification removed',
      message: 'The notification was deleted',
      type: 'info'
    });
  };

  const clearNotifications = async () => {
    const updated = await mockNotificationService.clearAllNotifications();
    setNotifications(updated);
    addToast({
      title: 'Notifications cleared',
      message: 'All notification items removed',
      type: 'info'
    });
  };

  const togglePreference = async (key) => {
    const updated = await mockNotificationService.updatePreference(key, !preferences[key]);
    setPreferences(updated);
    addToast({
      title: 'Preference saved',
      message: `Notification setting for ${key} updated`,
      type: 'success'
    });
  };

  const toggleMuteProject = async (projectId) => {
    const updated = await mockNotificationService.toggleMuteProject(projectId);
    setMutedProjects(updated);
    const isMuted = updated[projectId];
    addToast({
      title: isMuted ? 'Project muted' : 'Project unmuted',
      message: isMuted
        ? 'Notifications from this project are now muted'
        : 'Project notifications restored',
      type: isMuted ? 'warning' : 'success'
    });
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
    toggleMuteProject
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
