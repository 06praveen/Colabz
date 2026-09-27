import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useChat } from '../../context/ChatContext';
import ChatSidebar from '../../components/chat/ChatSidebar';
import ConversationHeader from '../../components/chat/ConversationHeader';
import MessageList from '../../components/chat/MessageList';
import MessageComposer from '../../components/chat/MessageComposer';
import ChatDetailsPanel from '../../components/chat/ChatDetailsPanel';
import CreateConversationModal from '../../components/chat/CreateConversationModal';
import MessageSearchModal from '../../components/chat/MessageSearchModal';
import DeleteMessageDialog from '../../components/chat/DeleteMessageDialog';
import Skeleton from '../../components/ui/Skeleton';

export default function Chat() {
  const { conversationId, projectId } = useParams();
  const navigate = useNavigate();
  const {
    messages,
    loading,
    currentUserId,
    selectConversation,
    setReplyingToMessage,
    editMessage,
    toggleReaction,
    activeMobileView
  } = useChat();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState(null);

  const activeProjectId = projectId || 'proj_1';

  useEffect(() => {
    if (conversationId) {
      selectConversation(conversationId);
    }
  }, [conversationId, selectConversation]);

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '70vh', gap: '1rem' }}>
        <Skeleton width="260px" height="100%" />
        <Skeleton width="100%" height="100%" />
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        height: 'calc(100vh - 170px)',
        minHeight: '520px',
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        boxShadow: '0 12px 36px rgba(0, 0, 0, 0.4)'
      }}
    >
      {/* 1. LEFT SIDEBAR (Desktop & Mobile Panel) */}
      <div
        className={`chat-sidebar-panel ${activeMobileView === 'sidebar' ? 'mobile-visible' : 'mobile-hidden'}`}
        style={{ width: '260px', flexShrink: 0 }}
      >
        <ChatSidebar onOpenCreateModal={() => setIsCreateOpen(true)} />
      </div>

      {/* 2. CENTER CONVERSATION & COMPOSER AREA */}
      <div
        className={`chat-main-panel ${activeMobileView === 'conversation' ? 'mobile-visible' : 'mobile-hidden'}`}
        style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, height: '100%' }}
      >
        <ConversationHeader onOpenSearch={() => setIsSearchOpen(true)} />

        <MessageList
          messages={messages}
          currentUserId={currentUserId}
          onReply={(msg) => setReplyingToMessage(msg)}
          onEditSubmit={(id, text) => editMessage(id, text)}
          onDelete={(msg) => setMessageToDelete(msg)}
          onToggleReaction={(id, emoji) => toggleReaction(id, emoji)}
        />

        <MessageComposer />
      </div>

      {/* 3. RIGHT DETAILS PANEL */}
      <div className="chat-details-panel-container">
        <ChatDetailsPanel />
      </div>

      {/* MODALS */}
      <CreateConversationModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
      <MessageSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <DeleteMessageDialog
        isOpen={!!messageToDelete}
        onClose={() => setMessageToDelete(null)}
        message={messageToDelete}
      />
    </div>
  );
}
