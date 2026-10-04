import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import projectService from '../services/projectService';
import { useAuth } from './AuthContext';

const ProjectContext = createContext(null);

export function ProjectProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [projects, setProjects] = useState([]);
  const [currentProject, setCurrentProject] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all projects when user is authenticated
  const fetchProjects = useCallback(async () => {
    if (!isAuthenticated) {
      setProjects([]);
      setCurrentProject(null);
      return [];
    }

    setLoading(true);
    setError(null);
    try {
      const data = await projectService.getProjects();
      setProjects(data);

      // Maintain or select first project as default
      setCurrentProject((prev) => {
        if (!prev && data.length > 0) return data[0];
        if (prev) {
          const updated = data.find((p) => p._id === prev._id || p.id === prev.id || p.slug === prev.slug);
          return updated || (data.length > 0 ? data[0] : null);
        }
        return null;
      });
      return data;
    } catch (err) {
      console.error('Failed to load projects:', err);
      setError(err.response?.data?.message || err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchProjects();
    } else {
      setProjects([]);
      setCurrentProject(null);
    }
  }, [isAuthenticated, fetchProjects]);

  // Fetch single project details
  const fetchProject = useCallback(async (projectId) => {
    try {
      const project = await projectService.getProject(projectId);
      if (project) {
        setCurrentProject(project);
      }
      return project;
    } catch (err) {
      console.error('Failed to fetch project:', err);
      throw err;
    }
  }, []);

  // Create Project
  const createProject = useCallback(async (projectData) => {
    setLoading(true);
    try {
      const newProject = await projectService.createProject(projectData);
      setProjects((prev) => [newProject, ...prev]);
      setCurrentProject(newProject);
      return newProject;
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to create project';
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  // Update Project
  const updateProject = useCallback(async (projectId, projectData) => {
    setLoading(true);
    try {
      const updated = await projectService.updateProject(projectId, projectData);
      setProjects((prev) =>
        prev.map((p) => (p._id === updated._id || p.id === updated.id ? updated : p))
      );
      setCurrentProject((prev) =>
        prev && (prev._id === updated._id || prev.id === updated.id) ? updated : prev
      );
      return updated;
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to update project';
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete Project
  const deleteProject = useCallback(async (projectId) => {
    setLoading(true);
    try {
      await projectService.deleteProject(projectId);
      setProjects((prev) =>
        prev.filter((p) => p._id !== projectId && p.id !== projectId && p.slug !== projectId)
      );
      setCurrentProject((prev) =>
        prev && (prev._id === projectId || prev.id === projectId || prev.slug === projectId)
          ? null
          : prev
      );
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to delete project';
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  // Select current active project
  const selectProject = useCallback((project) => {
    setCurrentProject(project);
  }, []);

  return (
    <ProjectContext.Provider
      value={{
        projects,
        currentProject,
        loading,
        error,
        fetchProjects,
        fetchProject,
        createProject,
        updateProject,
        deleteProject,
        selectProject,
        setCurrentProject,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
}

export function useProjects() {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProjects must be used within a ProjectProvider');
  }
  return context;
}

export const useProject = useProjects;
