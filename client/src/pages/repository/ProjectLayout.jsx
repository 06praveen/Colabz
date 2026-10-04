import React, { useEffect, useState } from 'react';
import { Outlet, useParams, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import ProjectHeader from '../../components/repository/ProjectHeader';
import { useProjects } from '../../context/ProjectContext';
import { RepositoryProvider } from '../../context/RepositoryContext';
import { TaskProvider } from '../../context/TaskContext';
import { IssueProvider } from '../../context/IssueContext';
import { MemberProvider } from '../../context/MemberContext';
import { ChatProvider } from '../../context/ChatContext';
import { CallProvider } from '../../context/CallContext';
import ErrorBoundary from '../../components/ui/ErrorBoundary';

export default function ProjectLayout() {
  const { projectId } = useParams();
  const location = useLocation();
  const { projects, fetchProject } = useProjects();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const loadProject = async () => {
      setLoading(true);
      // Check if project exists in context projects list first
      const found = projects.find(
        (p) => p._id === projectId || p.id === projectId || p.slug === projectId
      );
      if (found) {
        if (isMounted) {
          setProject(found);
          setLoading(false);
        }
        return;
      }

      // If not in context (e.g. direct URL visit or refresh), fetch from API
      try {
        const fetched = await fetchProject(projectId);
        if (isMounted) {
          setProject(fetched);
        }
      } catch (err) {
        console.error('Project not found or unauthorized:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    if (projectId) {
      loadProject();
    }
    return () => {
      isMounted = false;
    };
  }, [projectId, projects, fetchProject]);

  const activeProject = project || {
    id: projectId,
    _id: projectId,
    name: 'Workspace Project',
    visibility: 'private',
    description: 'Collaborative development workspace.',
    technologies: ['React', 'Node.js', 'MongoDB'],
    defaultBranch: 'main',
  };

  return (
    <RepositoryProvider projectId={projectId}>
      <TaskProvider projectId={projectId}>
        <IssueProvider projectId={projectId}>
          <MemberProvider projectId={projectId}>
            <ChatProvider projectId={projectId}>
              <CallProvider projectId={projectId}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', minHeight: '80vh', width: '100%' }}>
                  {/* Sticky Pinned Workspace Header */}
                  <ProjectHeader
                    project={{
                      id: activeProject._id || activeProject.id || projectId,
                      name: activeProject.name,
                      visibility: (activeProject.visibility || 'private').toUpperCase(),
                      description: activeProject.description,
                    }}
                  />

                  {/* Animated Interior Content Pane */}
                  <div style={{ flex: 1, position: 'relative' }}>
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={location.pathname}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                        style={{ width: '100%', height: '100%' }}
                      >
                        <ErrorBoundary>
                          <Outlet context={{ project: activeProject, loading }} />
                        </ErrorBoundary>
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </div>
              </CallProvider>
            </ChatProvider>
          </MemberProvider>
        </IssueProvider>
      </TaskProvider>
    </RepositoryProvider>
  );
}
