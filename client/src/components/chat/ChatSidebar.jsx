import React from 'react';
import { useChat } from '../../context/ChatContext';
import { useMembers } from '../../context/MemberContext';
import Avatar from '../ui/Avatar';
import MemberStatus from '../members/MemberStatus';
import { Hash, MessageSquare, Plus, Search, Lock } from 'lucide-react';

export default function ChatSidebar({ onOpenCreateModal }) {
  const {
    channels,
    directMessages,
    activeConversationId,
    selectConversation,
    sidebarSearchQuery,
    setSidebarSearchQuery
  } = useChat();

  const { members } = useMembers();

  const getMemberForDM = (recipientId) => {
    if (!recipientId) return null;
    return members.find(
      (m) =>
        m.id === recipientId ||
        m._id === recipientId ||
        m.userId === recipientId ||
        m.user?._id === recipientId ||
        m.username === recipientId
    );
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: 'var(--bg-elevated)',
        borderRight: '1px solid var(--border-default)',
        overflow: 'hidden'
      }}
    >
      {/* Sidebar Header & Search */}
      <div style={{ padding: '0.85rem 1rem', borderBottom: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
            Conversations
          </span>
          <button
            type="button"
            onClick={onOpenCreateModal}
            className="clb-btn clb-btn-ghost"
            style={{ padding: '0.25rem 0.45rem', fontSize: '0.775rem' }}
            title="Create new conversation or channel"
          >
            <Plus size={15} />
          </button>
        </div>

        {/* Search Input */}
        <div style={{ position: 'relative' }}>
          <Search
            size={14}
            color="var(--text-muted)"
            style={{ position: 'absolute', left: '0.65rem', top: '50%', transform: 'translateY(-50%)' }}
          />
          <input
            type="text"
            className="clb-input"
            placeholder="Search conversations..."
            value={sidebarSearchQuery}
            onChange={(e) => setSidebarSearchQuery(e.target.value)}
            style={{ paddingLeft: '2.1rem', fontSize: '0.8125rem', height: '32px' }}
          />
        </div>
      </div>

      {/* Conversations Scroll Container */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0.5rem 0.65rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* CHANNELS SECTION */}
        <div>
          <div
            style={{
              fontSize: '0.7rem',
              fontWeight: 600,
              fontFamily: 'var(--font-mono)',
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              padding: '0.35rem 0.5rem',
              marginBottom: '0.2rem'
            }}
          >
            Channels
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
            {channels.map((channel) => {
              const isActive = channel.id === activeConversationId;
              return (
                <button
                  key={channel.id}
                  type="button"
                  onClick={() => selectConversation(channel.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.45rem 0.6rem',
                    borderRadius: 'var(--radius-sm)',
                    border: 'none',
                    backgroundColor: isActive ? 'rgba(0, 229, 163, 0.12)' : 'transparent',
                    color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                    fontWeight: isActive ? 600 : 400,
                    cursor: 'pointer',
                    transition: 'all 0.12s ease',
                    textAlign: 'left',
                    width: '100%'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.04)';
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', minWidth: 0, overflow: 'hidden' }}>
                    <Hash size={15} color={isActive ? 'var(--accent-primary)' : 'var(--text-muted)'} style={{ flexShrink: 0 }} />
                    <span style={{ fontSize: '0.8125rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {channel.name}
                    </span>
                  </div>

                  {channel.unreadCount > 0 && (
                    <span
                      style={{
                        fontSize: '0.675rem',
                        fontWeight: 700,
                        fontFamily: 'var(--font-mono)',
                        backgroundColor: 'var(--accent-primary)',
                        color: '#000000',
                        padding: '0.05rem 0.4rem',
                        borderRadius: 'var(--radius-pill)'
                      }}
                    >
                      {channel.unreadCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* DIRECT MESSAGES SECTION */}
        <div>
          <div
            style={{
              fontSize: '0.7rem',
              fontWeight: 600,
              fontFamily: 'var(--font-mono)',
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              padding: '0.35rem 0.5rem',
              marginBottom: '0.2rem'
            }}
          >
            Direct Messages
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
            {directMessages.map((dm) => {
              const isActive = dm.id === activeConversationId;
              const member = getMemberForDM(dm.recipientId);
              const displayName = member ? member.name : dm.name;

              return (
                <button
                  key={dm.id}
                  type="button"
                  onClick={() => selectConversation(dm.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.45rem 0.6rem',
                    borderRadius: 'var(--radius-sm)',
                    border: 'none',
                    backgroundColor: isActive ? 'rgba(0, 229, 163, 0.12)' : 'transparent',
                    color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                    fontWeight: isActive ? 600 : 400,
                    cursor: 'pointer',
                    transition: 'all 0.12s ease',
                    textAlign: 'left',
                    width: '100%'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.04)';
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0, overflow: 'hidden' }}>
                    <Avatar name={displayName} src={member?.avatar} size={22} />
                    <span style={{ fontSize: '0.8125rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {displayName}
                    </span>
                  </div>

                  {member && <MemberStatus status={member.status} showLabel={false} />}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
