import api from './api';

export const activityService = {
  /**
   * Get activity feed for a project
   */
  getProjectActivity: async (projectId, params = {}) => {
    if (!projectId) return [];
    const query = new URLSearchParams();
    if (params.page) query.append('page', params.page);
    if (params.limit) query.append('limit', params.limit);
    if (params.type && params.type !== 'all') query.append('type', params.type);

    const res = await api.get(`/api/projects/${projectId}/activity?${query.toString()}`);
    return res.data?.data?.activities || [];
  },
};

export default activityService;
