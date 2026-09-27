import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { mockChatService } from '../services/mockChatService';

const ChatContext = createContext(null);

export function ChatProvider({ projectId = 'proj_1', children }) {
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState('conv_dev');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [sidebarSearchQuery, setSidebarSearchQuery] = useState('');
  const [messageSearchQuery, setMessageSearchQuery] = useState('');
  const [replyingToMessage, setReplyingToMessage] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(true);
  const [activeMobileView, setActiveMobileView] = useState('sidebar'); // 'sidebar' | 'conversation'

  const currentUserId = 'usr_1'; // Praveen Tiwari

  const loadConversations = useCallback(async () => {
    try {
      const convs = await mockChatService.getConversations(projectId);
      setConversations([...convs]);
    } catch (err) {
      console.error('Failed to load conversations:', err);
      setError('Failed to load project conversations.');
    }
  }, [projectId]);

  const loadMessages = useCallback(async (convId) => {
    if (!convId) return;
    try {
      const msgs = await mockChatService.getMessages(convId);
      setMessages([...msgs]);
      await mockChatService.markAsRead(convId);
    } catch (err) {
      console.error('Failed to load messages:', err);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await loadConversations();
      await loadMessages(activeConversationId);
      setLoading(false);
    };
    init();
  }, [projectId, loadConversations, loadMessages, activeConversationId]);

  const selectConversation = useCallback(async (convId) => {
    setActiveConversationId(convId);
    setActiveMobileView('conversation');
    setReplyingToMessage(null);
    await loadMessages(convId);
    setConversations((prev) =>
      prev.map((c) => (c.id === convId ? { ...c, unreadCount: 0 } : c))
    );
  }, [loadMessages]);

  const sendMessage = async ({ content, replyTo = null, attachments = [] }) => {
    if (!activeConversationId) return null;
    const newMsg = await mockChatService.sendMessage(activeConversationId, {
      senderId: currentUserId,
      content,
      replyTo,
      attachments
    });
    setReplyingToMessage(null);
    await loadMessages(activeConversationId);
    await loadConversations();
    return newMsg;
  };

  const editMessage = async (messageId, newContent) => {
    const updated = await mockChatService.editMessage(messageId, newContent);
    await loadMessages(activeConversationId);
    return updated;
  };

  const deleteMessage = async (messageId) => {
    await mockChatService.deleteMessage(messageId);
    await loadMessages(activeConversationId);
    return true;
  };

  const toggleReaction = async (messageId, emoji) => {
    const updated = await mockChatService.toggleReaction(messageId, emoji, currentUserId);
    await loadMessages(activeConversationId);
    return updated;
  };

  const createConversation = async ({ name, type = 'channel', recipientId = null, memberIds = [] }) => {
    const newConv = await mockChatService.createConversation(projectId, {
      name,
      type,
      recipientId,
      memberIds
    });
    await loadConversations();
    await selectConversation(newConv.id);
    return newConv;
  };

  const activeConversation = useMemo(() => {
    return conversations.find((c) => c.id === activeConversationId) || conversations[0] || null;
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
        createConversation
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
