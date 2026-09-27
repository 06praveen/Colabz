import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const NavigationContext = createContext(null);

export function NavigationProvider({ children }) {
  const navigate = useNavigate();
  const location = useLocation();

  // Parse view from current URL path
  const getViewFromPath = (path) => {
    if (path === '/' || path === '') return 'landing';
    if (path.includes('/signup')) return 'signup';
    if (path.includes('/login')) return 'login';
    if (path.includes('/app/dashboard')) return 'dashboard';
    if (path.includes('/app/messages')) return 'messages';
    if (path.includes('/app/notifications')) return 'notifications';
    if (path.includes('/app/activity')) return 'activity';
    if (path.includes('/app/settings')) return 'settings';
    if (path.includes('/app/projects')) {
      const sub = path.split('/app/projects/')[1];
      if (!sub || sub.trim() === '') return 'projects';
      return 'workspace';
    }
    return 'landing';
  };

  // Parse active workspace tab from URL path
  const getTabFromPath = (path) => {
    if (path.includes('/repository')) return 'repository';
    if (path.includes('/tasks')) return 'tasks';
    if (path.includes('/issues')) return 'issues';
    if (path.includes('/members')) return 'members';
    if (path.includes('/chat')) return 'chat';
    if (path.includes('/calls')) return 'calls';
    if (path.includes('/overview')) return 'overview';
    return 'overview';
  };

  // Parse active project ID from URL path
  const getProjectIdFromPath = (path) => {
    if (path.includes('/app/projects/')) {
      const sub = path.split('/app/projects/')[1];
      if (sub) {
        const id = sub.split('/')[0];
        if (id && id.trim() !== '') return id;
      }
    }
    return 'proj_1';
  };

  const [currentView, setCurrentView] = useState(() => getViewFromPath(location.pathname));
  const [activeTab, setActiveTab] = useState(() => getTabFromPath(location.pathname));
  const [activeProjectId, setActiveProjectId] = useState(() => getProjectIdFromPath(location.pathname));

  // Sync state with browser URL (handles back/forward navigation)
  useEffect(() => {
    const newView = getViewFromPath(location.pathname);
    const newTab = getTabFromPath(location.pathname);
    const newProj = getProjectIdFromPath(location.pathname);

    setCurrentView(newView);
    setActiveTab(newTab);
    if (newProj) setActiveProjectId(newProj);
  }, [location.pathname]);

  // Unified global navigation helper
  const navigateTo = (view, options = {}) => {
    const { tab = 'overview', project, subPath } = options;
    const targetProject = project || activeProjectId || 'proj_1';

    if (project) setActiveProjectId(project);
    if (tab) setActiveTab(tab);
    setCurrentView(view);

    let targetPath = '/';
    if (view === 'landing') targetPath = '/';
    else if (view === 'signup') targetPath = '/signup';
    else if (view === 'login') targetPath = '/login';
    else if (view === 'dashboard') targetPath = '/app/dashboard';
    else if (view === 'messages') targetPath = '/app/messages';
    else if (view === 'notifications') targetPath = '/app/notifications';
    else if (view === 'activity') targetPath = '/app/activity';
    else if (view === 'settings') targetPath = '/app/settings';
    else if (view === 'projects') targetPath = '/app/projects';
    else if (view === 'workspace') {
      const validTab = tab || 'overview';
      targetPath = `/app/projects/${targetProject}/${validTab}${subPath ? `/${subPath}` : ''}`;
    }

    navigate(targetPath);
  };

  return (
    <NavigationContext.Provider
      value={{
        currentView,
        activeTab,
        activeProjectId,
        navigateTo,
        setCurrentView,
        setActiveTab,
        setActiveProjectId
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
}
