import api from './api';

export const memberService = {
  /**
   * List all active members of a project
   * @param {string} projectId
   */
  async getMembers(projectId) {
    if (!projectId) return [];
    const response = await api.get(`/api/projects/${projectId}/members`);
    return response.data?.data?.members || [];
  },

  /**
   * Get current authenticated user's membership details in project
   * @param {string} projectId
   */
  async getMyMembership(projectId) {
    if (!projectId) return null;
    const response = await api.get(`/api/projects/${projectId}/members/me`);
    return response.data?.data?.membership || null;
  },

  /**
   * Add a new member directly by userId/username/email
   * @param {string} projectId
   * @param {{ userId?: string, username?: string, email?: string, role: string }} payload
   */
  async addMember(projectId, payload) {
    const response = await api.post(`/api/projects/${projectId}/members`, {
      userId: payload.userId,
      username: payload.username,
      email: payload.email,
      role: (payload.role || 'DEVELOPER').toUpperCase(),
    });
    return response.data?.data?.member || response.data?.data;
  },

  /**
   * Invite a new member by email/username and role
   * @param {string} projectId
   * @param {{ emailOrUsername?: string, username?: string, email?: string, role: string }} payload
   */
  async inviteMember(projectId, { emailOrUsername, username, email, role }) {
    const targetInput = (username || emailOrUsername || email || '').trim();
    const response = await api.post(`/api/projects/${projectId}/invitations`, {
      username: targetInput.startsWith('@') ? targetInput.replace(/^@/, '') : (!targetInput.includes('@') ? targetInput : undefined),
      email: targetInput.includes('@') ? targetInput : undefined,
      emailOrUsername: targetInput,
      role: (role || 'developer').toUpperCase(),
    });
    return response.data?.data?.invitation || response.data?.data;
  },

  /**
   * Update a project member's role (Owner only)
   * @param {string} projectId
   * @param {string} userId
   * @param {string} newRole
   */
  async updateMemberRole(projectId, userId, newRole) {
    const response = await api.patch(`/api/projects/${projectId}/members/${userId}`, {
      role: (newRole || 'DEVELOPER').toUpperCase(),
    });
    return response.data?.data?.member || response.data?.data;
  },

  /**
   * Remove a member from the project
   * @param {string} projectId
   * @param {string} userId
   */
  async removeMember(projectId, userId) {
    const response = await api.delete(`/api/projects/${projectId}/members/${userId}`);
    return response.data?.success || true;
  },

  /**
   * Leave project as current user
   * @param {string} projectId
   */
  async leaveProject(projectId) {
    const response = await api.post(`/api/projects/${projectId}/leave`);
    return response.data?.success || true;
  },

  /**
   * List pending invitations for a project (Owner/Admin only)
   * @param {string} projectId
   */
  async getPendingInvitations(projectId) {
    if (!projectId) return [];
    try {
      const response = await api.get(`/api/projects/${projectId}/invitations`);
      return response.data?.data?.invitations || [];
    } catch (error) {
      // Return empty list gracefully if viewer or forbidden
      if (error.response?.status === 403) return [];
      throw error;
    }
  },

  /**
   * Cancel an invitation
   * @param {string} projectId
   * @param {string} invitationId
   */
  async cancelInvitation(projectId, invitationId) {
    const response = await api.delete(
      `/api/projects/${projectId}/invitations/${invitationId}`
    );
    return response.data?.success || true;
  },

  /**
   * List all pending invitations sent to current user's email
   */
  async getMyPendingInvitations() {
    const response = await api.get('/api/invitations/me');
    return response.data?.data?.invitations || [];
  },

  /**
   * Accept an invitation
   * @param {string} invitationId
   */
  async acceptInvitation(invitationId) {
    const response = await api.post(`/api/invitations/${invitationId}/accept`);
    return response.data?.data;
  },

  /**
   * Decline an invitation
   * @param {string} invitationId
   */
  async declineInvitation(invitationId) {
    const response = await api.post(`/api/invitations/${invitationId}/decline`);
    return response.data?.success || true;
  },

  /**
   * Get team activity placeholder (real data from project logs when available)
   * @param {string} projectId
   */
  async getTeamActivity(projectId) {
    return [];
  },
};

export default memberService;
