import api from './api';

export const userService = {
  /**
   * Search users by username, email, or name
   * @param {string} query
   */
  async searchUsers(query) {
    if (!query || !query.trim()) return [];
    try {
      const response = await api.get(`/api/users/search`, {
        params: { q: query.trim() },
      });
      return response.data?.data?.users || [];
    } catch (err) {
      console.warn('Failed to search users:', err);
      return [];
    }
  },

  /**
   * Get current authenticated user profile
   */
  async getMyProfile() {
    const response = await api.get('/api/users/me');
    return response.data?.data?.user || response.data?.data;
  },

  /**
   * Update current user profile (including unique username)
   * @param {{ username?: string, name?: string, bio?: string, skills?: string[], avatar?: string, avatarColor?: string }} data
   */
  async updateMyProfile(data) {
    const response = await api.patch('/api/users/me', data);
    return response.data?.data?.user || response.data?.data;
  },

  /**
   * Get user public details by ID or username
   * @param {string} identifier
   */
  async getUser(identifier) {
    const response = await api.get(`/api/users/${identifier}`);
    return response.data?.data?.user || response.data?.data;
  },
};

export default userService;
