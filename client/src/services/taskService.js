import api from './api';

export const taskService = {
  /**
   * Get all tasks for a project
   * @param {string} projectId
   * @param {object} params
   */
  async getTasks(projectId, params = {}) {
    if (!projectId) return [];
    const response = await api.get(`/api/projects/${projectId}/tasks`, { params });
    return response.data?.data?.tasks || [];
  },

  /**
   * Get a single task by ID or identifier
   * @param {string} projectId
   * @param {string} taskId
   */
  async getTaskById(projectId, taskId) {
    if (!projectId || !taskId) return null;
    const response = await api.get(`/api/projects/${projectId}/tasks/${taskId}`);
    return response.data?.data?.task || null;
  },

  /**
   * Create a new task
   * @param {string} projectId
   * @param {object} taskData
   */
  async createTask(projectId, taskData) {
    const response = await api.post(`/api/projects/${projectId}/tasks`, taskData);
    return response.data?.data?.task || response.data?.data;
  },

  /**
   * Update task
   * @param {string} projectId
   * @param {string} taskId
   * @param {object} updates
   */
  async updateTask(projectId, taskId, updates) {
    const response = await api.patch(`/api/projects/${projectId}/tasks/${taskId}`, updates);
    return response.data?.data?.task || response.data?.data;
  },

  /**
   * Delete task
   * @param {string} projectId
   * @param {string} taskId
   */
  async deleteTask(projectId, taskId) {
    const response = await api.delete(`/api/projects/${projectId}/tasks/${taskId}`);
    return response.data?.success || true;
  },
};

export default taskService;
