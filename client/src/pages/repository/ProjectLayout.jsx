import React from 'react';
import { Outlet, useParams, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import ProjectHeader from '../../components/repository/ProjectHeader';
import { mockRepositories } from '../../mock/repositories';
import ErrorBoundary from '../../components/ui/ErrorBoundary';

export default function ProjectLayout() {
  const { projectId } = useParams();
  const location = useLocation();
  const activeId = projectId || 'proj_1';
  const project = mockRepositories.find((r) => r.projectId === activeId) || mockRepositories[0];

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', minHeight: '80vh', width: '100%' }}>
      {/* Sticky Pinned Workspace Header */}
      <ProjectHeader project={{ id: project.projectId, name: project.projectName, visibility: project.visibility, description: project.description }} />

      {/* Silky Animated Interior Content Pane */}
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
              <Outlet context={{ project }} />
            </ErrorBoundary>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}


