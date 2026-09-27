import { mockNotifications } from '../mock/notifications';
import { mockActivity } from '../mock/activity';

let notificationsState = [...mockNotifications];
let activityState = [...mockActivity];
let notificationPreferencesState = {
  assignment: true,
  mention: true,
  issue: true,
  task: true,
  repository: true,
  member: true,
  chat: true,
  call: true,
  system: true
};
let mutedProjectsState = {}; // { proj_1: false }

export const mockNotificationService = {
  getNotifications: (userId = 'usr_1', filter = 'all', searchQuery = '') => {
    let result = notificationsState.filter(n => n.recipientId === userId || !n.recipientId);

    if (filter === 'unread') {
      result = result.filter(n => !n.read);
    } else if (filter !== 'all') {
      result = result.filter(n => n.type === filter);
    }

    if (searchQuery && searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        n =>
          n.title.toLowerCase().includes(query) ||
          n.message.toLowerCase().includes(query) ||
          n.type.toLowerCase().includes(query)
      );
    }

    return Promise.resolve(result);
  },

  getUnreadCount: (userId = 'usr_1') => {
    const unread = notificationsState.filter(n => (n.recipientId === userId || !n.recipientId) && !n.read);
    return Promise.resolve(unread.length);
  },

  markAsRead: (notificationId) => {
    notificationsState = notificationsState.map(n =>
      n.id === notificationId ? { ...n, read: true } : n
    );
    return Promise.resolve(notificationsState);
  },

  markAllAsRead: (userId = 'usr_1') => {
    notificationsState = notificationsState.map(n =>
      n.recipientId === userId || !n.recipientId ? { ...n, read: true } : n
    );
    return Promise.resolve(notificationsState);
  },

  deleteNotification: (notificationId) => {
    notificationsState = notificationsState.filter(n => n.id !== notificationId);
    return Promise.resolve(notificationsState);
  },

  clearAllNotifications: () => {
    notificationsState = [];
    return Promise.resolve(notificationsState);
  },

  getActivity: (projectId = null, filter = 'all', searchQuery = '') => {
    let result = [...activityState];

    if (projectId) {
      result = result.filter(a => a.projectId === projectId);
    }

    if (filter !== 'all') {
      if (filter === 'repository') result = result.filter(a => a.entityType === 'repository');
      else if (filter === 'tasks') result = result.filter(a => a.entityType === 'task');
      else if (filter === 'issues') result = result.filter(a => a.entityType === 'issue');
      else if (filter === 'members') result = result.filter(a => a.entityType === 'member');
      else if (filter === 'chat') result = result.filter(a => a.entityType === 'conversation');
      else if (filter === 'calls') result = result.filter(a => a.entityType === 'call');
    }

    if (searchQuery && searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        a =>
          a.title.toLowerCase().includes(query) ||
          a.detail.toLowerCase().includes(query) ||
          a.type.toLowerCase().includes(query)
      );
    }

    return Promise.resolve(result);
  },

  getPreferences: () => {
    return Promise.resolve({ ...notificationPreferencesState });
  },

  updatePreference: (key, value) => {
    notificationPreferencesState = {
      ...notificationPreferencesState,
      [key]: value
    };
    return Promise.resolve({ ...notificationPreferencesState });
  },

  getMutedProjects: () => {
    return Promise.resolve({ ...mutedProjectsState });
  },

  toggleMuteProject: (projectId) => {
    mutedProjectsState = {
      ...mutedProjectsState,
      [projectId]: !mutedProjectsState[projectId]
    };
    return Promise.resolve({ ...mutedProjectsState });
  }
};
