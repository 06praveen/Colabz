import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import AppBackground from '../components/app-shell/AppBackground';
import Sidebar from '../components/app-shell/Sidebar';
import Topbar from '../components/app-shell/Topbar';
import CommandPalette from '../components/app-shell/CommandPalette';
import CreateProjectModal from '../components/app-shell/CreateProjectModal';
import HelpModal from '../components/app-shell/HelpModal';
import ErrorBoundary from '../components/ui/ErrorBoundary';
import { MobileBottomBar, MobileDrawer } from '../components/app-shell/MobileNav';
import MiniCallWindow from '../components/calls/MiniCallWindow';
import { useProjects } from '../context/ProjectContext';

export default function AuthenticatedLayout() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  const { currentProject, selectProject, projects } = useProjects();
  const location = useLocation();
  const navigate = useNavigate();

  // Keyboard shortcuts setup (Cmd/Ctrl + K, Esc)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="colabz-app-shell" style={{ position: 'relative', overflow: 'hidden' }}>
      {/* Atmosphere Persistent Background Layer */}
      <AppBackground />

      {/* Desktop Persistent Sidebar */}
      <div className="desktop-only-sidebar">
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          onCreateProject={() => setIsCreateProjectOpen(true)}
        />
      </div>

      {/* Main Column Container */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, zIndex: 10, minHeight: '100vh' }}>
        {/* Topbar */}
        <Topbar
          currentProject={currentProject}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
          onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          onOpenHelpModal={() => setIsHelpOpen(true)}
        />

        {/* Dynamic Nested Route Content Outlet */}
        <main style={{ flex: 1, padding: '1.5rem', display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8, scale: 0.995 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.995 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              style={{ width: '100%', flex: 1 }}
            >
              <ErrorBoundary>
                <Outlet
                  context={{
                    currentProject,
                    setCurrentProject: selectProject,
                    openCreateProject: () => setIsCreateProjectOpen(true),
                    projects,
                  }}
                />
              </ErrorBoundary>
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Persistent Mini-Call Floating Window */}
      <MiniCallWindow />

      {/* Mobile Navigation Navigation Elements */}
      <MobileBottomBar />
      <MobileDrawer
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        onCreateProject={() => setIsCreateProjectOpen(true)}
      />

      {/* Global Command Palette (⌘ K / Ctrl K) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onCreateProject={() => setIsCreateProjectOpen(true)}
      />

      {/* Global Create Project Modal */}
      <CreateProjectModal
        isOpen={isCreateProjectOpen}
        onClose={() => setIsCreateProjectOpen(false)}
        onProjectCreated={(newProj) => {
          selectProject(newProj);
          const pId = newProj._id || newProj.id || newProj.slug;
          navigate(`/app/projects/${pId}/repository`);
        }}
      />

      {/* Global Shortcuts Help Modal */}
      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
    </div>
  );
}
