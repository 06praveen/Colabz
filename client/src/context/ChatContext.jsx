import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useAuth } from './AuthContext';
import { chatService } from '../services/chatService';
import { getSocket, socketService } from '../services/socket';

const ChatContext = createContext(null);

export function ChatProvider({ projectId, children }) {
  const { user } = useAuth();
  const currentUserId = user?._id || user?.id || 'usr_1';

  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [sidebarSearchQuery, setSidebarSearchQuery] = useState('');
  const [messageSearchQuery, setMessageSearchQuery] = useState('');
  const [replyingToMessage, setReplyingToMessage] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(true);
  const [activeMobileView, setActiveMobileView] = useState('sidebar'); // 'sidebar' | 'conversation'

  const activeConvRef = useRef(activeConversationId);
  activeConvRef.current = activeConversationId;

  /**
   * Load all conversations for this project
   */
  const loadConversations = useCallback(async () => {
    if (!projectId) return [];
    try {
      const convs = await chatService.getConversations(projectId);
      setConversations(convs);
      return convs;
    } catch (err) {
      console.error('Failed to load conversations:', err);
      setError('Failed to load project conversations.');
      return [];
    }
  }, [projectId]);

  /**
   * Load messages for a specific conversation
   */
  const loadMessages = useCallback(
    async (convId) => {
      if (!convId || !projectId) return;
      try {
        const msgs = await chatService.getMessages(projectId, convId);
        setMessages(msgs);
        await chatService.markAsRead(projectId, convId);
      } catch (err) {
        console.error('Failed to load messages:', err);
      }
    },
    [projectId]
  );

  /**
   * Initial load of conversations on mount or projectId change
   */
  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      if (!projectId) {
        setLoading(false);
        return;
      }
      setLoading(true);
      const convs = await loadConversations();
      if (!isMounted) return;

      if (convs && convs.length > 0) {
        const defaultConv = convs[0];
        setActiveConversationId(defaultConv.id);
        await loadMessages(defaultConv.id);
      } else {
        setActiveConversationId(null);
        setMessages([]);
      }
      setLoading(false);
    };

    init();

    return () => {
      isMounted = false;
    };
  }, [projectId, loadConversations, loadMessages]);

  /**
   * Select a conversation and join its Socket.IO room
   */
  const selectConversation = useCallback(
    async (convId) => {
      if (!convId) return;

      // Leave old room
      if (activeConvRef.current && activeConvRef.current !== convId) {
        socketService.leaveConversation(activeConvRef.current);
      }

      setActiveConversationId(convId);
      setActiveMobileView('conversation');
      setReplyingToMessage(null);

      // Join new socket room
      socketService.joinConversation(projectId, convId);

      await loadMessages(convId);

      // Clear local unread count
      setConversations((prev) =>
        prev.map((c) => (c.id === convId ? { ...c, unreadCount: 0 } : c))
      );
    },
    [projectId, loadMessages]
  );

  /**
   * Manage Socket.IO event listeners with clean lifecycle to prevent duplicate listeners
   */
  useEffect(() => {
    if (!projectId) return;

    const socket = getSocket();
    if (!socket) return;

    // Join active conversation room if set
    if (activeConversationId) {
      socketService.joinConversation(projectId, activeConversationId);
    }

    const handleNewMessage = (data) => {
      const newMsg = data?.message || data;
      const convId = data?.conversationId || newMsg?.conversationId;

      if (!newMsg) return;

      // If message belongs to currently open conversation, append it
      if (convId === activeConvRef.current) {
        setMessages((prev) => {
          // Prevent duplicate if already added
          if (prev.some((m) => m.id === newMsg.id || (m._id && m._id === newMsg._id))) {
            return prev;
          }
          return [...prev, newMsg];
        });

        // Mark read immediately since user is viewing it
        socketService.markRead({
          projectId,
          conversationId: convId,
          messageId: newMsg.id || newMsg._id,
        });
      }

      // Update conversations preview
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id === convId || c._id === convId) {
            const isViewing = convId === activeConvRef.current;
            return {
              ...c,
              lastMessage: newMsg.content || '[Attachment]',
              lastTime: newMsg.createdAt || 'Just now',
              unreadCount: isViewing ? 0 : (c.unreadCount || 0) + 1,
            };
          }
          return c;
        })
      );
    };

    const handleUpdatedMessage = (data) => {
      const updated = data?.message || data;
      if (!updated) return;

      setMessages((prev) =>
        prev.map((m) => (m.id === updated.id || m._id === updated.id ? { ...m, ...updated } : m))
      );
    };

    const handleDeletedMessage = (data) => {
      const targetId = data?.messageId || data?.message?.id;
      if (!targetId) return;

      setMessages((prev) =>
        prev.map((m) =>
          m.id === targetId || m._id === targetId
            ? { ...m, deleted: true, content: 'This message was deleted' }
            : m
        )
      );
    };

    const handleReactionUpdated = (data) => {
      const updated = data?.message || data;
      if (!updated) return;

      setMessages((prev) =>
        prev.map((m) => (m.id === updated.id || m._id === updated.id ? { ...m, reactions: updated.reactions } : m))
      );
    };

    const handleReadUpdated = (data) => {
      const { messageId, userId } = data || {};
      if (!messageId || !userId) return;

      setMessages((prev) =>
        prev.map((m) => {
          if (m.id === messageId || m._id === messageId) {
            const readBy = Array.isArray(m.readBy) ? m.readBy : [];
            if (!readBy.includes(userId)) {
              return { ...m, readBy: [...readBy, userId] };
            }
          }
          return m;
        })
      );
    };

    // Attach listeners
    socket.on('message:new', handleNewMessage);
    socket.on('message:updated', handleUpdatedMessage);
    socket.on('message:deleted', handleDeletedMessage);
    socket.on('message:reaction-updated', handleReactionUpdated);
    socket.on('message:read-updated', handleReadUpdated);

    // Cleanup listeners on unmount or dependency update
    return () => {
      socket.off('message:new', handleNewMessage);
      socket.off('message:updated', handleUpdatedMessage);
      socket.off('message:deleted', handleDeletedMessage);
      socket.off('message:reaction-updated', handleReactionUpdated);
      socket.off('message:read-updated', handleReadUpdated);
    };
  }, [projectId, activeConversationId]);

  /**
   * Send message (socket primary with REST fallback)
   */
  const sendMessage = async ({ content, replyTo = null, attachments = [] }) => {
    if (!activeConversationId || !projectId) return null;

    const trimmed = (content || '').trim();
    if (!trimmed && (!attachments || attachments.length === 0)) return null;

    setReplyingToMessage(null);

    const socket = getSocket();
    if (socket && socket.connected) {
      socketService.sendMessage({
        projectId,
        conversationId: activeConversationId,
        content: trimmed,
        replyTo,
        attachments,
      });
      return null;
    }

    // Fallback to REST API if socket not connected
    try {
      const newMsg = await chatService.sendMessage(projectId, activeConversationId, {
        content: trimmed,
        replyTo,
        attachments,
      });
      setMessages((prev) => [...prev, newMsg]);
      await loadConversations();
      return newMsg;
    } catch (err) {
      console.error('Failed to send message via REST fallback:', err);
      throw err;
    }
  };

  /**
   * Edit message
   */
  const editMessage = async (messageId, newContent) => {
    if (!activeConversationId || !projectId || !messageId) return null;

    const socket = getSocket();
    if (socket && socket.connected) {
      socketService.editMessage({
        projectId,
        conversationId: activeConversationId,
        messageId,
        content: newContent,
      });
      return null;
    }

    const updated = await chatService.editMessage(projectId, activeConversationId, messageId, newContent);
    setMessages((prev) =>
      prev.map((m) => (m.id === messageId || m._id === messageId ? updated : m))
    );
    return updated;
  };

  /**
   * Delete message (soft delete)
   */
  const deleteMessage = async (messageId) => {
    if (!activeConversationId || !projectId || !messageId) return false;

    const socket = getSocket();
    if (socket && socket.connected) {
      socketService.deleteMessage({
        projectId,
        conversationId: activeConversationId,
        messageId,
      });
      return true;
    }

    await chatService.deleteMessage(projectId, activeConversationId, messageId);
    setMessages((prev) =>
      prev.map((m) =>
        m.id === messageId || m._id === messageId
          ? { ...m, deleted: true, content: 'This message was deleted' }
          : m
      )
    );
    return true;
  };

  /**
   * Toggle reaction
   */
  const toggleReaction = async (messageId, emoji) => {
    if (!activeConversationId || !projectId || !messageId || !emoji) return null;

    const socket = getSocket();
    if (socket && socket.connected) {
      socketService.toggleReaction({
        projectId,
        conversationId: activeConversationId,
        messageId,
        emoji,
      });
      return null;
    }

    const updated = await chatService.toggleReaction(projectId, activeConversationId, messageId, emoji);
    setMessages((prev) =>
      prev.map((m) => (m.id === messageId || m._id === messageId ? updated : m))
    );
    return updated;
  };

  /**
   * Create a new conversation (channel or direct message)
   */
  const createConversation = async ({ name, type = 'channel', recipientId = null, participantId = null, memberIds = [] }) => {
    if (!projectId) return null;

    const newConv = await chatService.createConversation(projectId, {
      name,
      type,
      recipientId: recipientId || participantId,
      participantId: participantId || recipientId,
      memberIds,
    });

    await loadConversations();
    if (newConv?.id) {
      await selectConversation(newConv.id);
    }
    return newConv;
  };

  const activeConversation = useMemo(() => {
    return conversations.find((c) => c.id === activeConversationId || c._id === activeConversationId) || conversations[0] || null;
  }, [conversations, activeConversationId]);

  const filteredConversations = useMemo(() => {
    if (!sidebarSearchQuery.trim()) return conversations;
    const q = sidebarSearchQuery.toLowerCase().trim();
    return conversations.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.lastMessage && c.lastMessage.toLowerCase().includes(q))
    );
  }, [conversations, sidebarSearchQuery]);

  const channels = useMemo(() => {
    return filteredConversations.filter((c) => c.type === 'channel');
  }, [filteredConversations]);

  const directMessages = useMemo(() => {
    return filteredConversations.filter((c) => c.type === 'direct');
  }, [filteredConversations]);

  return (
    <ChatContext.Provider
      value={{
        projectId,
        conversations,
        filteredConversations,
        channels,
        directMessages,
        activeConversationId,
        activeConversation,
        messages,
        loading,
        error,
        currentUserId,
        sidebarSearchQuery,
        setSidebarSearchQuery,
        messageSearchQuery,
        setMessageSearchQuery,
        replyingToMessage,
        setReplyingToMessage,
        isDetailsOpen,
        setIsDetailsOpen,
        activeMobileView,
        setActiveMobileView,
        selectConversation,
        sendMessage,
        editMessage,
        deleteMessage,
        toggleReaction,
        createConversation,
        reload: loadConversations,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}
