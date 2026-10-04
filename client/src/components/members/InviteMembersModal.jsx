import React, { useState, useEffect, useRef } from 'react';
import Modal from '../ui/Modal';
import Avatar from '../ui/Avatar';
import { useMembers } from '../../context/MemberContext';
import { useToast } from '../../context/ToastContext';
import { userService } from '../../services/userService';
import { Search, Send, AtSign, Loader2, Check } from 'lucide-react';

export default function InviteMembersModal({ isOpen, onClose }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { inviteMember, members, pendingInvitations } = useMembers();
  const { addToast } = useToast();
  const searchTimeoutRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      setSearchResults([]);
      setSelectedUser(null);
      setErrorMsg('');
      setSubmitting(false);
    }
  }, [isOpen]);

  // Debounced search for users by username / name
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    const trimmed = searchQuery.trim();
    if (!trimmed || selectedUser) {
      setSearchResults([]);
      setSearching(false);
      return;
    }

    setSearching(true);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const users = await userService.searchUsers(trimmed);
        // Exclude users already members or with pending invites
        const existingMemberIds = new Set(
          (members || []).map((m) => (m.userId || m.id || m._id)?.toString())
        );
        const existingMemberUsernames = new Set(
          (members || []).map((m) => (m.username || '').toLowerCase())
        );
        const pendingEmails = new Set(
          (pendingInvitations || []).map((p) => (p.email || '').toLowerCase())
        );

        const filtered = (users || []).filter(
          (u) =>
            !existingMemberIds.has(u._id?.toString()) &&
            !existingMemberIds.has(u.id?.toString()) &&
            !existingMemberUsernames.has((u.username || '').toLowerCase()) &&
            !pendingEmails.has((u.email || '').toLowerCase())
        );
        setSearchResults(filtered);
      } catch (err) {
        console.warn('Search failed:', err);
      } finally {
        setSearching(false);
      }
    }, 250);

    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [searchQuery, selectedUser, members, pendingInvitations]);

  const handleSelectUser = (u) => {
    setSelectedUser(u);
    setSearchQuery(`@${u.username || u.name}`);
    setSearchResults([]);
    setErrorMsg('');
  };

  const handleClearSelection = () => {
    setSelectedUser(null);
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    const targetInput = searchQuery.trim().replace(/^@/, '');
    if (!targetInput && !selectedUser) {
      setErrorMsg('Please select or enter a username to send an invitation.');
      return;
    }

    setSubmitting(true);
    try {
      const usernameToInvite = selectedUser?.username || targetInput;

      await inviteMember({
        username: usernameToInvite,
        role: 'DEVELOPER',
      });

      addToast({
        title: 'Invitation Sent',
        message: `Project invitation sent to @${usernameToInvite}.`,
        type: 'success',
      });

      onClose();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to send invitation.';
      setErrorMsg(msg);
      addToast({
        title: 'Invitation Failed',
        message: msg,
        type: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Member">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: 0 }}>
          Search for a collaborator by unique <code>@username</code> to invite them to this project.
        </p>

        {errorMsg && (
          <div
            style={{
              padding: '0.65rem 0.85rem',
              backgroundColor: 'rgba(255, 92, 112, 0.1)',
              border: '1px solid rgba(255, 92, 112, 0.3)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--danger)',
              fontSize: '0.8125rem',
            }}
          >
            {errorMsg}
          </div>
        )}

        {/* Username Search Input with Live Dropdown */}
        <div className="clb-input-group" style={{ position: 'relative' }}>
          <label className="clb-label">Search username *</label>
          <div style={{ position: 'relative' }}>
            <Search
              size={16}
              color="var(--text-muted)"
              style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }}
            />
            <input
              type="text"
              className="clb-input"
              placeholder="Search username (e.g. @aayush, @praveen)..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (selectedUser) setSelectedUser(null);
                if (e.target.value.trim()) setErrorMsg('');
              }}
              style={{ paddingLeft: '2.3rem', paddingRight: searching ? '2.3rem' : '0.85rem' }}
              autoFocus
              required
            />
            {searching && (
              <Loader2
                size={16}
                className="animate-spin"
                color="var(--accent-primary)"
                style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)' }}
              />
            )}
          </div>

          {/* Selected User Preview Chip */}
          {selectedUser && (
            <div
              style={{
                marginTop: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.5rem 0.75rem',
                backgroundColor: 'rgba(0, 229, 163, 0.08)',
                border: '1px solid var(--accent-primary)',
                borderRadius: 'var(--radius-sm)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Avatar name={selectedUser.name} src={selectedUser.avatar} size={26} />
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {selectedUser.name}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', fontFamily: 'var(--font-mono)' }}>
                    @{selectedUser.username}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleClearSelection}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  padding: '2px 6px',
                }}
              >
                Change
              </button>
            </div>
          )}

          {/* Live Search Results Dropdown */}
          {!selectedUser && searchResults.length > 0 && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 4px)',
                left: 0,
                right: 0,
                zIndex: 60,
                backgroundColor: 'var(--bg-elevated)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-md)',
                boxShadow: '0 12px 30px rgba(0,0,0,0.6)',
                maxHeight: '220px',
                overflowY: 'auto',
                padding: '0.35rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.2rem',
              }}
            >
              {searchResults.map((u) => (
                <div
                  key={u._id || u.id}
                  onClick={() => handleSelectUser(u)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.55rem 0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer',
                    transition: 'background 0.15s ease',
                  }}
                  className="clb-hover-card"
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.06)')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <Avatar name={u.name} src={u.avatar} size={28} />
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {u.name}
                      </span>
                      <span style={{ fontSize: '0.725rem', color: 'var(--accent-primary)', fontFamily: 'var(--font-mono)' }}>
                        @{u.username}
                      </span>
                    </div>
                  </div>
                  <span style={{ fontSize: '0.725rem', color: 'var(--accent-primary)', fontWeight: 600 }}>
                    Select
                  </span>
                </div>
              ))}
            </div>
          )}

          {!selectedUser && searchQuery.trim() && !searching && searchResults.length === 0 && (
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem', display: 'block' }}>
              No user found matching &quot;{searchQuery}&quot;. Please verify the username.
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
          <button type="button" onClick={onClose} className="clb-btn clb-btn-ghost" disabled={submitting}>
            Cancel
          </button>
          <button type="submit" className="clb-btn clb-btn-primary" disabled={submitting}>
            {submitting ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
            <span>Send Invitation</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
