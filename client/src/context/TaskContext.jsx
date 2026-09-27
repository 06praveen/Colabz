import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { mockTaskService } from '../services/mockTaskService';

const TaskContext = createContext(null);

export function TaskProvider({ projectId = 'proj_1', children }) {
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
    label: ''
  });

  const loadTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await mockTaskService.getTasks(projectId);
      setTasks([...data]);
    } catch (err) {
      console.error('Failed to load tasks:', err);
      setError('Failed to load tasks for this project.');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const createTask = async (taskData) => {
    const newTask = await mockTaskService.createTask(projectId, taskData);
    await loadTasks();
    return newTask;
  };

  const updateTask = async (taskId, updates) => {
    const updated = await mockTaskService.updateTask(projectId, taskId, updates);
    await loadTasks();
    return updated;
  };

  const deleteTask = async (taskId) => {
    await mockTaskService.deleteTask(projectId, taskId);
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
        projectId,
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
        reloadTasks: loadTasks
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
