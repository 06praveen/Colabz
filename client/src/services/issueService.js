import api from './api';

export const issueService = {
  /**
   * Get all issues for a project
   * @param {string} projectId
   * @param {object} params
   */
  async getIssues(projectId, params = {}) {
    if (!projectId) return [];
    const response = await api.get(`/api/projects/${projectId}/issues`, { params });
    return response.data?.data?.issues || [];
  },

  /**
   * Get single issue by ID or issue number
   * @param {string} projectId
   * @param {string} issueId
   */
  async getIssueById(projectId, issueId) {
    if (!projectId || !issueId) return null;
    const response = await api.get(`/api/projects/${projectId}/issues/${issueId}`);
    return response.data?.data?.issue || null;
  },

  /**
   * Create a new issue
   * @param {string} projectId
   * @param {object} issueData
   */
  async createIssue(projectId, issueData) {
    const response = await api.post(`/api/projects/${projectId}/issues`, issueData);
    return response.data?.data?.issue || response.data?.data;
  },

  /**
   * Update issue
   * @param {string} projectId
   * @param {string} issueId
   * @param {object} updates
   */
  async updateIssue(projectId, issueId, updates) {
    const response = await api.patch(`/api/projects/${projectId}/issues/${issueId}`, updates);
    return response.data?.data?.issue || response.data?.data;
  },

  /**
   * Delete issue
   * @param {string} projectId
   * @param {string} issueId
   */
  async deleteIssue(projectId, issueId) {
    const response = await api.delete(`/api/projects/${projectId}/issues/${issueId}`);
    return response.data?.success || true;
  },

  /**
   * Get comments for an issue
   * @param {string} projectId
   * @param {string} issueId
   */
  async getComments(projectId, issueId) {
    const response = await api.get(`/api/projects/${projectId}/issues/${issueId}/comments`);
    return response.data?.data?.comments || [];
  },

  /**
   * Add a comment to an issue
   * @param {string} projectId
   * @param {string} issueId
   * @param {string} text
   */
  async addComment(projectId, issueId, text) {
    const response = await api.post(`/api/projects/${projectId}/issues/${issueId}/comments`, {
      text,
    });
    return response.data?.data?.comment || response.data?.data;
  },

  /**
   * Delete comment
   * @param {string} projectId
   * @param {string} issueId
   * @param {string} commentId
   */
  async deleteComment(projectId, issueId, commentId) {
    const response = await api.delete(
      `/api/projects/${projectId}/issues/${issueId}/comments/${commentId}`
    );
    return response.data?.success || true;
  },
};

export default issueService;
