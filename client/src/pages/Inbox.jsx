import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Inbox as InboxIcon,
  Check,
  X,
  FolderGit2,
  Clock,
  Loader2,
  ArrowRight,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';
import Avatar from '../components/ui/Avatar';
import { memberService } from '../services/memberService';
import { useProjects } from '../context/ProjectContext';
import { useToast } from '../context/ToastContext';

export default function Inbox() {
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const { refreshProjects, selectProject } = useProjects();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const loadInbox = useCallback(async () => {
    try {
      setLoading(true);
      const data = await memberService.getMyPendingInvitations();
      setInvitations(data || []);
    } catch (err) {
      console.error('Failed to load invitations:', err);
      addToast({
        title: 'Error',
        message: 'Failed to load project invitations.',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    loadInbox();
  }, [loadInbox]);

  const handleAccept = async (invitation) => {
    const invId = invitation.id || invitation._id;
    setProcessingId(invId);
    try {
      const res = await memberService.acceptInvitation(invId);
      addToast({
        title: 'Invitation Accepted!',
        message: `You are now a member of ${invitation.projectName || invitation.project?.name || 'the project'}.`,
        type: 'success',
      });

      // Refresh local inbox list
      setInvitations((prev) => prev.filter((i) => (i.id || i._id) !== invId));

      // Refresh projects list in ProjectContext
      if (refreshProjects) {
        await refreshProjects();
      }

      const pId = res?.projectId || invitation.projectId || invitation.project?._id || invitation.project?.id;
      if (pId) {
        navigate(`/app/projects/${pId}/overview`);
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to accept invitation.';
      addToast({
        title: 'Accept Failed',
        message: msg,
        type: 'error',
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleDecline = async (invitation) => {
    const invId = invitation.id || invitation._id;
    setProcessingId(invId);
    try {
      await memberService.declineInvitation(invId);
      addToast({
        title: 'Invitation Declined',
        message: `Declined invitation for ${invitation.projectName || invitation.project?.name || 'project'}.`,
        type: 'info',
      });

      setInvitations((prev) => prev.filter((i) => (i.id || i._id) !== invId));
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to decline invitation.';
      addToast({
        title: 'Decline Failed',
        message: msg,
        type: 'error',
      });
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', paddingBottom: '3rem' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.75rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Project Inbox
            </h1>
            {invitations.length > 0 && (
              <span
                style={{
                  fontSize: '0.75rem',
                  fontFamily: 'var(--font-mono)',
                  backgroundColor: 'rgba(0, 229, 163, 0.15)',
                  color: 'var(--accent-primary)',
                  padding: '0.15rem 0.6rem',
                  borderRadius: '999px',
                  border: '1px solid rgba(0, 229, 163, 0.3)',
                  fontWeight: 600,
                }}
              >
                {invitations.length} pending
              </span>
            )}
          </div>
          <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Review and accept pending invitations to collaborate on projects.
          </p>
        </div>

        <button
          onClick={loadInbox}
          className="clb-btn clb-btn-ghost"
          style={{ fontSize: '0.8125rem' }}
          disabled={loading}
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : <InboxIcon size={14} />}
          <span>Refresh</span>
        </button>
      </div>

      {/* Loading state */}
      {loading ? (
        <div
          style={{
            padding: '4rem 2rem',
            textAlign: 'center',
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1rem',
          }}
        >
          <Loader2 size={32} className="animate-spin" color="var(--accent-primary)" />
          <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Loading invitations...</span>
        </div>
      ) : invitations.length === 0 ? (
        <div
          style={{
            padding: '4rem 2rem',
            textAlign: 'center',
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-md)',
          }}
        >
          <InboxIcon size={44} color="var(--text-muted)" style={{ opacity: 0.5, marginBottom: '1rem' }} />
          <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.125rem', color: 'var(--text-primary)' }}>
            Your inbox is clear
          </h3>
          <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-muted)', maxWidth: '440px', marginInline: 'auto' }}>
            You have no pending project invitations. When a team owner invites you by <code>@username</code>, their invitation will appear here.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <AnimatePresence>
            {invitations.map((inv) => {
              const invId = inv.id || inv._id;
              const isProcessing = processingId === invId;
              const projectName = inv.projectName || inv.project?.name || 'Colabz Project';
              const inviterName = inv.inviter?.name || inv.invitedBy || 'A teammate';
              const inviterUsername = inv.inviterUsername || inv.inviter?.username || 'user';

              return (
                <motion.div
                  key={invId}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  style={{
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border-default)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1.25rem 1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '1.25rem',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
                  }}
                >
                  {/* Left info column */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', minWidth: '260px' }}>
                    <Avatar
                      name={inviterName}
                      src={inv.inviter?.avatar}
                      size={44}
                      color={inv.inviter?.avatarColor || 'var(--accent-primary)'}
                    />

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                          {inviterName}
                        </span>
                        <span
                          style={{
                            fontSize: '0.8rem',
                            color: 'var(--accent-primary)',
                            fontFamily: 'var(--font-mono)',
                          }}
                        >
                          @{inviterUsername}
                        </span>
                      </div>

                      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        invited you to join <strong style={{ color: 'var(--text-primary)' }}>{projectName}</strong>
                      </div>

                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.75rem',
                          marginTop: '0.25rem',
                          fontSize: '0.75rem',
                          color: 'var(--text-muted)',
                        }}
                      >
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <Clock size={12} />
                          {inv.invitedAt || 'Recently'}
                        </span>
                        <span>•</span>
                        <span
                          style={{
                            textTransform: 'uppercase',
                            fontSize: '0.7rem',
                            fontWeight: 600,
                            letterSpacing: '0.04em',
                            color: 'var(--text-secondary)',
                            backgroundColor: 'rgba(255, 255, 255, 0.05)',
                            padding: '0.1rem 0.45rem',
                            borderRadius: 'var(--radius-sm)',
                          }}
                        >
                          {inv.role || 'DEVELOPER'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions column */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <button
                      onClick={() => handleDecline(inv)}
                      className="clb-btn clb-btn-ghost"
                      style={{
                        padding: '0.5rem 0.85rem',
                        fontSize: '0.8125rem',
                        color: 'var(--text-muted)',
                      }}
                      disabled={isProcessing}
                    >
                      <X size={15} />
                      <span>Decline</span>
                    </button>

                    <button
                      onClick={() => handleAccept(inv)}
                      className="clb-btn clb-btn-primary"
                      style={{
                        padding: '0.5rem 1.15rem',
                        fontSize: '0.8125rem',
                        fontWeight: 600,
                      }}
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <Loader2 size={15} className="animate-spin" />
                      ) : (
                        <Check size={15} />
                      )}
                      <span>Accept</span>
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
