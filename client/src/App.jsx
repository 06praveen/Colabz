import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { NotificationProvider } from './context/NotificationContext';
import { NavigationProvider } from './context/NavigationContext';
import { RepositoryProvider } from './context/RepositoryContext';
import { TaskProvider } from './context/TaskContext';
import { IssueProvider } from './context/IssueContext';
import { MemberProvider } from './context/MemberContext';
import { ChatProvider } from './context/ChatContext';
import { CallProvider } from './context/CallContext';

import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Signup from './pages/Signup';
import AuthenticatedLayout from './layouts/AuthenticatedLayout';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import Messages from './pages/Messages';
import Notifications from './pages/notifications/Notifications';
import Activity from './pages/activity/Activity';
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

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <NotificationProvider>
          <BrowserRouter>
            <NavigationProvider>
              <RepositoryProvider projectId="proj_1">
                <TaskProvider projectId="proj_1">
                  <IssueProvider projectId="proj_1">
                    <MemberProvider projectId="proj_1">
                      <ChatProvider projectId="proj_1">
                        <CallProvider projectId="proj_1">
                          <Routes>
                            {/* Phase 2 Landing Page */}
                            <Route path="/" element={<LandingPage />} />
                            
                            {/* Phase 3 Auth Routes */}
                            <Route path="/login" element={<Login />} />
                            <Route path="/auth/login" element={<Login />} />
                            <Route path="/signup" element={<Signup />} />
                            <Route path="/auth/signup" element={<Signup />} />

                            {/* Phase 4 & Phase 5 Application Shell & Project Routes */}
                            <Route path="/app" element={<AuthenticatedLayout />}>
                              <Route index element={<Navigate to="/app/dashboard" replace />} />
                              <Route path="dashboard" element={<Dashboard />} />
                              <Route path="projects" element={<Projects />} />
                              <Route path="messages" element={<Messages />} />
                              <Route path="notifications" element={<Notifications />} />
                              <Route path="activity" element={<Activity />} />
                              <Route path="settings" element={<Settings />} />

                              {/* Phase 6, Phase 7, Phase 8 & Phase 9 Workspace Routes */}
                              <Route path="projects/:projectId" element={<ProjectLayout />}>
                                <Route index element={<Navigate to="repository" replace />} />
                                <Route path="overview" element={<ProjectOverview />} />
                                <Route path="repository" element={<RepositoryPage />} />
                                <Route path="repository/tree/*" element={<RepositoryPage />} />
                                <Route path="repository/commits" element={<RepositoryCommitsPage />} />
                                <Route path="repository/commits/:commitId" element={<RepositoryCommitsPage />} />
                                <Route path="repository/branches" element={<RepositoryBranchesPage />} />
                                
                                {/* Phase 7 Tasks & Issues Routes */}
                                <Route path="tasks" element={<Tasks />} />
                                <Route path="tasks/:taskId" element={<TaskDetail />} />
                                <Route path="issues" element={<Issues />} />
                                <Route path="issues/:issueId" element={<IssueDetail />} />

                                {/* Phase 8 Members Routes */}
                                <Route path="members" element={<Members />} />
                                <Route path="members/:memberId" element={<MemberDetail />} />

                                {/* Phase 9 Chat Routes */}
                                <Route path="chat" element={<Chat />} />
                                <Route path="chat/:conversationId" element={<Chat />} />

                                {/* Phase 10 Calls Routes */}
                                <Route path="calls" element={<Calls />} />
                                <Route path="calls/:callId" element={<CallRoom />} />
                              </Route>
                            </Route>

                            {/* Fallback */}
                            <Route path="*" element={<Navigate to="/" replace />} />
                          </Routes>
                        </CallProvider>
                      </ChatProvider>
                    </MemberProvider>
                  </IssueProvider>
                </TaskProvider>
              </RepositoryProvider>
            </NavigationProvider>
          </BrowserRouter>
        </NotificationProvider>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;



