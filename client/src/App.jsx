import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { NotificationProvider } from './context/NotificationContext';
import { NavigationProvider } from './context/NavigationContext';
import { ProjectProvider } from './context/ProjectContext';

import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Signup from './pages/Signup';
import AuthenticatedLayout from './layouts/AuthenticatedLayout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import PublicRoute from './components/auth/PublicRoute';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import Messages from './pages/Messages';
import Notifications from './pages/notifications/Notifications';
import Activity from './pages/activity/Activity';
import Inbox from './pages/Inbox';
import Settings from './pages/Settings';

import ProjectLayout from './pages/repository/ProjectLayout';
import ProjectOverview from './pages/repository/ProjectOverview';
import RepositoryPage from './pages/repository/RepositoryPage';
import RepositoryCommitsPage from './pages/repository/RepositoryCommitsPage';
import RepositoryBranchesPage from './pages/repository/RepositoryBranchesPage';
import Tasks from './pages/tasks/Tasks';
import TaskDetail from './pages/tasks/TaskDetail';
import Issues from './pages/issues/Issues';
import IssueDetail from './pages/issues/IssueDetail';
import Members from './pages/members/Members';
import MemberDetail from './pages/members/MemberDetail';
import Chat from './pages/chat/Chat';
import Calls from './pages/calls/Calls';
import CallRoom from './pages/calls/CallRoom';

import ErrorBoundary from './components/ui/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ToastProvider>
          <NotificationProvider>
            <ProjectProvider>
              <BrowserRouter>
                <NavigationProvider>
                <Routes>
                  {/* Landing Page */}
                  <Route path="/" element={<LandingPage />} />

                  {/* Public Auth Routes */}
                  <Route
                    path="/login"
                    element={
                      <PublicRoute>
                        <Login />
                      </PublicRoute>
                    }
                  />
                  <Route
                    path="/auth/login"
                    element={
                      <PublicRoute>
                        <Login />
                      </PublicRoute>
                    }
                  />
                  <Route
                    path="/signup"
                    element={
                      <PublicRoute>
                        <Signup />
                      </PublicRoute>
                    }
                  />
                  <Route
                    path="/auth/signup"
                    element={
                      <PublicRoute>
                        <Signup />
                      </PublicRoute>
                    }
                  />

                  {/* Protected Application Shell & Project Routes */}
                  <Route
                    path="/app"
                    element={
                      <ProtectedRoute>
                        <AuthenticatedLayout />
                      </ProtectedRoute>
                    }
                  >
                    <Route index element={<Navigate to="/app/dashboard" replace />} />
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="projects" element={<Projects />} />
                    <Route path="messages" element={<Messages />} />
                    <Route path="notifications" element={<Notifications />} />
                    <Route path="inbox" element={<Inbox />} />
                    <Route path="activity" element={<Activity />} />
                    <Route path="settings" element={<Settings />} />

                    {/* Workspace Routes — ProjectLayout provides scoped providers */}
                    <Route path="projects/:projectId" element={<ProjectLayout />}>
                      <Route index element={<Navigate to="repository" replace />} />
                      <Route path="overview" element={<ProjectOverview />} />
                      <Route path="repository" element={<RepositoryPage />} />
                      <Route path="repository/tree/*" element={<RepositoryPage />} />
                      <Route path="repository/commits" element={<RepositoryCommitsPage />} />
                      <Route path="repository/commits/:commitId" element={<RepositoryCommitsPage />} />
                      <Route path="repository/branches" element={<RepositoryBranchesPage />} />

                      <Route path="tasks" element={<Tasks />} />
                      <Route path="tasks/:taskId" element={<TaskDetail />} />
                      <Route path="issues" element={<Issues />} />
                      <Route path="issues/:issueId" element={<IssueDetail />} />

                      <Route path="members" element={<Members />} />
                      <Route path="members/:memberId" element={<MemberDetail />} />

                      <Route path="chat" element={<Chat />} />
                      <Route path="chat/:conversationId" element={<Chat />} />

                      <Route path="calls" element={<Calls />} />
                      <Route path="calls/:callId" element={<CallRoom />} />
                    </Route>
                  </Route>

                  {/* Fallback */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </NavigationProvider>
            </BrowserRouter>
          </ProjectProvider>
        </NotificationProvider>
      </ToastProvider>
    </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
