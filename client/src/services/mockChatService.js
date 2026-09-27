import { mockConversations } from '../mock/conversations';
import { mockMessages } from '../mock/messages';

let conversationsStore = [...mockConversations];
let messagesStore = [...mockMessages];

export const mockChatService = {
  async getConversations(projectId) {
    if (!projectId) return conversationsStore;
    return conversationsStore.filter((c) => c.projectId === projectId || !c.projectId);
  },

  async getConversationById(conversationId) {
    return conversationsStore.find((c) => c.id === conversationId) || null;
  },

  async getMessages(conversationId) {
    return messagesStore.filter((m) => m.conversationId === conversationId);
  },

  async sendMessage(conversationId, { senderId, content, replyTo = null, attachments = [] }) {
    const trimmed = (content || '').trim();
    if (!trimmed && attachments.length === 0) {
      throw new Error('Message content or attachment is required.');
    }

    const nowStr = 'Just now';
    const newMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      conversationId,
      senderId: senderId || 'usr_1',
      content: trimmed,
      createdAt: nowStr,
      dateSeparator: null,
      editedAt: null,
      replyTo: replyTo || null,
      reactions: [],
      attachments: attachments || []
    };

    messagesStore.push(newMessage);

    // Update conversation last message preview
    const convIndex = conversationsStore.findIndex((c) => c.id === conversationId);
    if (convIndex !== -1) {
      conversationsStore[convIndex] = {
        ...conversationsStore[convIndex],
        lastMessage: trimmed || (attachments.length > 0 ? `[Attachment: ${attachments[0].name || attachments[0].type}]` : 'Sent a message'),
        lastTime: nowStr
      };
    }

    return newMessage;
  },

  async editMessage(messageId, newContent) {
    const msgIndex = messagesStore.findIndex((m) => m.id === messageId);
    if (msgIndex === -1) throw new Error('Message not found');

    const updated = {
      ...messagesStore[msgIndex],
      content: newContent.trim(),
      editedAt: 'Edited'
    };
    messagesStore[msgIndex] = updated;
    return updated;
  },

  async deleteMessage(messageId) {
    messagesStore = messagesStore.filter((m) => m.id !== messageId);
    return true;
  },

  async toggleReaction(messageId, emoji, userId = 'usr_1') {
    const msgIndex = messagesStore.findIndex((m) => m.id === messageId);
    if (msgIndex === -1) return null;

    const msg = messagesStore[msgIndex];
    let reactions = [...(msg.reactions || [])];

    const existingReactionIndex = reactions.findIndex((r) => r.emoji === emoji);

    if (existingReactionIndex !== -1) {
      const rx = reactions[existingReactionIndex];
      const hasReacted = rx.users.includes(userId);

      if (hasReacted) {
        // Remove reaction user
        const updatedUsers = rx.users.filter((u) => u !== userId);
        if (updatedUsers.length === 0) {
          reactions.splice(existingReactionIndex, 1);
        } else {
          reactions[existingReactionIndex] = {
            ...rx,
            count: updatedUsers.length,
            users: updatedUsers
          };
        }
      } else {
        // Add reaction user
        reactions[existingReactionIndex] = {
          ...rx,
          count: rx.count + 1,
          users: [...rx.users, userId]
        };
      }
    } else {
      // Add new reaction
      reactions.push({
        emoji,
        count: 1,
        users: [userId]
      });
    }

    const updatedMsg = { ...msg, reactions };
    messagesStore[msgIndex] = updatedMsg;
    return updatedMsg;
  },

  async createConversation(projectId, { name, type = 'channel', recipientId = null, memberIds = [] }) {
    const isChannel = type === 'channel';
    const channelName = isChannel ? (name.startsWith('#') ? name.substring(1) : name) : name;

    const newConv = {
      id: `conv_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      projectId: projectId || 'proj_1',
      name: channelName,
      type,
      description: isChannel ? `Channel for #${channelName}` : 'Direct conversation',
      recipientId: recipientId || null,
      unreadCount: 0,
      lastMessage: 'Conversation created',
      lastTime: 'Just now',
      memberIds: memberIds.length > 0 ? memberIds : ['usr_1', 'usr_2', 'usr_3']
    };

    conversationsStore.unshift(newConv);
    return newConv;
  },

  async markAsRead(conversationId) {
    const convIndex = conversationsStore.findIndex((c) => c.id === conversationId);
    if (convIndex !== -1) {
      conversationsStore[convIndex] = {
        ...conversationsStore[convIndex],
        unreadCount: 0
      };
    }
    return true;
  },

  async searchMessages(projectId, query) {
    if (!query || !query.trim()) return [];
    const q = query.toLowerCase().trim();

    return messagesStore.filter((m) => m.content.toLowerCase().includes(q));
  }
};
