import api from './api';

export const chatService = {
  /**
   * Get all conversations for a project
   * GET /api/projects/:projectId/conversations
   */
  async getConversations(projectId) {
    if (!projectId) return [];
    try {
      const res = await api.get(`/api/projects/${projectId}/conversations`);
      return res.data?.data?.conversations || [];
    } catch (err) {
      console.error('Failed to fetch conversations:', err);
      return [];
    }
  },

  /**
   * Get single conversation by ID
   * GET /api/projects/:projectId/conversations/:conversationId
   */
  async getConversationById(projectId, conversationId) {
    if (!projectId || !conversationId) return null;
    try {
      const res = await api.get(`/api/projects/${projectId}/conversations/${conversationId}`);
      return res.data?.data?.conversation || null;
    } catch (err) {
      console.error('Failed to fetch conversation:', err);
      return null;
    }
  },

  /**
   * Create or retrieve conversation
   * POST /api/projects/:projectId/conversations
   */
  async createConversation(projectId, payload) {
    const res = await api.post(`/api/projects/${projectId}/conversations`, payload);
    return res.data?.data?.conversation || res.data?.data;
  },

  /**
   * Mark all messages in conversation as read
   * POST /api/projects/:projectId/conversations/:conversationId/read
   */
  async markAsRead(projectId, conversationId) {
    if (!projectId || !conversationId) return;
    try {
      await api.post(`/api/projects/${projectId}/conversations/${conversationId}/read`);
    } catch {
      // Background operation
    }
  },

  /**
   * Get messages in a conversation
   * GET /api/projects/:projectId/conversations/:conversationId/messages
   */
  async getMessages(projectId, conversationId, query = {}) {
    if (!projectId || !conversationId) return [];
    try {
      const res = await api.get(`/api/projects/${projectId}/conversations/${conversationId}/messages`, {
        params: query,
      });
      return res.data?.data?.messages || [];
    } catch (err) {
      console.error('Failed to fetch messages:', err);
      return [];
    }
  },

  /**
   * Send a message (REST fallback)
   * POST /api/projects/:projectId/conversations/:conversationId/messages
   */
  async sendMessage(projectId, conversationId, { content, replyTo = null, attachments = [] }) {
    const res = await api.post(`/api/projects/${projectId}/conversations/${conversationId}/messages`, {
      content,
      replyTo,
      attachments,
    });
    return res.data?.data?.message || res.data?.data;
  },

  /**
   * Edit a message
   * PATCH /api/projects/:projectId/conversations/:conversationId/messages/:messageId
   */
  async editMessage(projectId, conversationId, messageId, content) {
    const res = await api.patch(
      `/api/projects/${projectId}/conversations/${conversationId}/messages/${messageId}`,
      { content }
    );
    return res.data?.data?.message || res.data?.data;
  },

  /**
   * Delete a message
   * DELETE /api/projects/:projectId/conversations/:conversationId/messages/:messageId
   */
  async deleteMessage(projectId, conversationId, messageId) {
    const res = await api.delete(
      `/api/projects/${projectId}/conversations/${conversationId}/messages/${messageId}`
    );
    return res.data?.data?.message || res.data;
  },

  /**
   * Toggle reaction
   * POST /api/projects/:projectId/conversations/:conversationId/messages/:messageId/reactions
   */
  async toggleReaction(projectId, conversationId, messageId, emoji) {
    const res = await api.post(
      `/api/projects/${projectId}/conversations/${conversationId}/messages/${messageId}/reactions`,
      { emoji }
    );
    return res.data?.data?.message || res.data?.data;
  },
};
