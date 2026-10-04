import api from './api';

export const callService = {
  /**
   * Start a call via REST API
   */
  startCall: async (projectId, { receiverId, type = 'VIDEO', title = '' }) => {
    const res = await api.post(`/projects/${projectId}/calls`, {
      receiverId,
      type,
      title,
    });
    return res.data?.data?.call;
  },

  /**
   * Get call history for project
   */
  getCalls: async (projectId, params = {}) => {
    if (!projectId) return [];
    const query = new URLSearchParams();
    if (params.page) query.append('page', params.page);
    if (params.limit) query.append('limit', params.limit);

    const res = await api.get(`/projects/${projectId}/calls?${query.toString()}`);
    return res.data?.data?.calls || [];
  },

  /**
   * Get single call by ID
   */
  getCall: async (projectId, callId) => {
    const res = await api.get(`/projects/${projectId}/calls/${callId}`);
    return res.data?.data?.call;
  },
};

export default callService;
