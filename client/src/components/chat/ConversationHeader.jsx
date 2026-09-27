import React from 'react';
import { useChat } from '../../context/ChatContext';
import { useMembers } from '../../context/MemberContext';
import Avatar from '../ui/Avatar';
import MemberStatus from '../members/MemberStatus';
import { Hash, Search, Sidebar, ArrowLeft, Users } from 'lucide-react';

export default function ConversationHeader({ onOpenSearch }) {
  const {
    activeConversation,
    isDetailsOpen,
    setIsDetailsOpen,
    setActiveMobileView
  } = useChat();

  const { members } = useMembers();

  if (!activeConversation) return null;

  const isChannel = activeConversation.type === 'channel';
  const recipientMember = !isChannel && activeConversation.recipientId
    ? members.find((m) => m.id === activeConversation.recipientId || m.username === activeConversation.recipientId)
    : null;

  const title = isChannel
    ? `#${activeConversation.name}`
    : recipientMember
    ? recipientMember.name
    : activeConversation.name;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.85rem 1.25rem',
        borderBottom: '1px solid var(--border-default)',
        backgroundColor: 'var(--bg-elevated)',
        gap: '0.75rem',
        flexWrap: 'wrap'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {/* Mobile Back Button */}
        <button
          type="button"
          onClick={() => setActiveMobileView('sidebar')}
          className="clb-btn clb-btn-ghost mobile-only-btn"
          style={{ padding: '0.35rem 0.5rem', fontSize: '0.8125rem' }}
          title="Back to conversations"
        >
          <ArrowLeft size={16} />
        </button>

        {isChannel ? (
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'rgba(0, 229, 163, 0.1)',
              color: 'var(--accent-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Hash size={18} />
          </div>
        ) : (
          <Avatar name={title} src={recipientMember?.avatar} size={32} />
        )}

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0, fontFamily: 'var(--font-mono)' }}>
              {title}
            </h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.15rem', fontSize: '0.775rem', color: 'var(--text-muted)' }}>
            {isChannel ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Users size={12} /> {activeConversation.memberIds?.length || members.length} members
              </span>
            ) : (
              <MemberStatus status={recipientMember?.status || 'active'} />
            )}
            {activeConversation.description && (
              <>
                <span>•</span>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '300px' }}>
                  {activeConversation.description}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <button
          type="button"
          onClick={onOpenSearch}
          className="clb-btn clb-btn-ghost"
          style={{ fontSize: '0.8125rem', padding: '0.35rem 0.65rem', gap: '0.4rem' }}
        >
          <Search size={15} />
          <span className="desktop-only-text">Search</span>
        </button>

        <button
          type="button"
          onClick={() => setIsDetailsOpen(!isDetailsOpen)}
          className="clb-btn clb-btn-ghost"
          style={{
            fontSize: '0.8125rem',
            padding: '0.35rem 0.65rem',
            gap: '0.4rem',
            color: isDetailsOpen ? 'var(--accent-primary)' : 'var(--text-muted)'
          }}
          title="Toggle Details Panel"
        >
          <Sidebar size={16} />
          <span className="desktop-only-text">Details</span>
        </button>
      </div>
    </div>
  );
}
