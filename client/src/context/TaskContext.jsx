import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { taskService } from '../services/taskService';
import { useProjects } from './ProjectContext';

const TaskContext = createContext(null);

export function TaskProvider({ projectId: propProjectId, children }) {
  const { currentProject } = useProjects();
  const effectiveProjectId =
    propProjectId && propProjectId !== 'proj_1'
      ? propProjectId
      : currentProject?._id || currentProject?.id || propProjectId || 'proj_1';

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'board'
  const [sortOption, setSortOption] = useState('updated'); // 'updated', 'priority', 'dueDate', 'created'
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    assignee: '',
    label: '',
  });

  const loadTasks = useCallback(async () => {
    if (!effectiveProjectId) {
      setTasks([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await taskService.getTasks(effectiveProjectId);
      setTasks([...(data || [])]);
    } catch (err) {
      console.error('Failed to load tasks:', err);
      setError('Failed to load tasks for this project.');
    } finally {
      setLoading(false);
    }
  }, [effectiveProjectId]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const createTask = async (taskData) => {
    const newTask = await taskService.createTask(effectiveProjectId, taskData);
    await loadTasks();
    return newTask;
  };

  const updateTask = async (taskId, updates) => {
    const updated = await taskService.updateTask(effectiveProjectId, taskId, updates);
    await loadTasks();
    return updated;
  };

  const deleteTask = async (taskId) => {
    await taskService.deleteTask(effectiveProjectId, taskId);
    await loadTasks();
    return true;
  };

  const clearFilters = () => {
    setFilters({ status: '', priority: '', assignee: '', label: '' });
    setSearchQuery('');
  };

  return (
    <TaskContext.Provider
      value={{
        projectId: effectiveProjectId,
        tasks,
        loading,
        error,
        searchQuery,
        setSearchQuery,
        viewMode,
        setViewMode,
        sortOption,
        setSortOption,
        filters,
        setFilters,
        clearFilters,
        createTask,
        updateTask,
        deleteTask,
        reloadTasks: loadTasks,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
}

export function useTasks() {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
}

export default TaskContext;
