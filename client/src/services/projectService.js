import api from './api';

export const projectService = {
  /**
   * Get all projects accessible to the authenticated user
   */
  async getProjects() {
    const response = await api.get('/api/projects');
    return response.data?.data?.projects || [];
  },

  /**
   * Get single project by ID or slug
   */
  async getProject(projectId) {
    const response = await api.get(`/api/projects/${projectId}`);
    return response.data?.data?.project || null;
  },

  /**
   * Create a new project
   */
  async createProject(projectData) {
    const response = await api.post('/api/projects', projectData);
    return response.data?.data?.project;
  },

  /**
   * Update an existing project (owner only)
   */
  async updateProject(projectId, projectData) {
    const response = await api.patch(`/api/projects/${projectId}`, projectData);
    return response.data?.data?.project;
  },

  /**
   * Delete a project (owner only)
   */
  async deleteProject(projectId) {
    const response = await api.delete(`/api/projects/${projectId}`);
    return response.data;
  },
};

export default projectService;
