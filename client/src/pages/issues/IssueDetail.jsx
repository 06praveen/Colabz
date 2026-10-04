import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useIssues } from '../../context/IssueContext';
import { issueService } from '../../services/issueService';
import IssueStatusBadge from '../../components/issues/IssueStatusBadge';
import TaskPriorityBadge from '../../components/tasks/TaskPriorityBadge';
import IssueComments from '../../components/issues/IssueComments';
import EditIssueModal from '../../components/issues/EditIssueModal';
import DeleteIssueModal from '../../components/issues/DeleteIssueModal';
import { ArrowLeft, Edit, Trash2, CircleDot, CheckCircle2, Clock } from 'lucide-react';

export default function IssueDetail() {
  const { projectId, issueId } = useParams();
  const navigate = useNavigate();
  const { closeIssue, reopenIssue } = useIssues();

  const [issue, setIssue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const activeProjectId = projectId || 'proj_1';

  useEffect(() => {
    async function fetchIssue() {
      setLoading(true);
      try {
        const found = await issueService.getIssueById(activeProjectId, issueId);
        setIssue(found);
      } catch (err) {
        console.error('Failed to fetch issue:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchIssue();
  }, [activeProjectId, issueId]);

  const handleToggleStatus = async () => {
    if (!issue) return;
    const isOpen = String(issue.status).toLowerCase() === 'open';
    const updated = isOpen
      ? await closeIssue(issue.id || issue.number)
      : await reopenIssue(issue.id || issue.number);

    if (updated) setIssue(updated);
  };

  if (loading) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
        Loading issue details...
      </div>
    );
  }

  if (!issue) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'flex-start' }}>
        <button onClick={() => navigate(`/app/projects/${activeProjectId}/issues`)} className="clb-btn clb-btn-ghost">
          <ArrowLeft size={14} /> Back to Issues
        </button>

        <div className="clb-card" style={{ padding: '3rem 1.5rem', width: '100%', textAlign: 'center' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
            Issue not found
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0.35rem 0 0' }}>
            The requested issue number "#{issueId}" does not exist.
          </p>
        </div>
      </div>
    );
  }

  const isOpen = String(issue.status).toLowerCase() === 'open';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Back Button */}
      <button
        onClick={() => navigate(`/app/projects/${activeProjectId}/issues`)}
        className="clb-btn clb-btn-ghost"
        style={{ alignSelf: 'flex-start', padding: '0.35rem 0.6rem', fontSize: '0.8125rem' }}
      >
        <ArrowLeft size={14} />
        Back to Issues
      </button>

      {/* Main Issue Header Card */}
      <div className="clb-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
        {/* Title & Actions */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.85rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <span style={{ fontSize: '1.25rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--text-muted)' }}>
                #{issue.number}
              </span>
              <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0, lineHeight: 1.3 }}>
                {issue.title}
              </h1>
            </div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: '0.35rem 0 0', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span>opened by <strong>{issue.author}</strong></span>
              <span>•</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Clock size={12} /> {issue.createdAt}
              </span>
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
            <button
              onClick={handleToggleStatus}
              className="clb-btn clb-btn-secondary"
              style={{ padding: '0.35rem 0.75rem', fontSize: '0.8125rem' }}
            >
              {isOpen ? <CheckCircle2 size={14} color="var(--success)" /> : <CircleDot size={14} color="var(--accent-primary)" />}
              <span>{isOpen ? 'Close Issue' : 'Reopen Issue'}</span>
            </button>

            <button
              onClick={() => setIsEditOpen(true)}
              className="clb-btn clb-btn-secondary"
              style={{ padding: '0.35rem 0.75rem', fontSize: '0.8125rem' }}
            >
              <Edit size={14} />
              Edit
            </button>

            <button
              onClick={() => setIsDeleteOpen(true)}
              className="clb-btn clb-btn-ghost"
              style={{ padding: '0.35rem 0.65rem', fontSize: '0.8125rem', color: 'var(--danger)' }}
            >
              <Trash2 size={14} />
              Delete
            </button>
          </div>
        </div>

        {/* Status & Priority Badge Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <IssueStatusBadge status={issue.status} />
          <TaskPriorityBadge priority={issue.priority} />
        </div>

        {/* Description */}
        <div>
          <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', marginBottom: '0.45rem' }}>
            Description
          </h3>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
            {issue.description || 'No description provided for this issue.'}
          </div>
        </div>

        {/* Metadata Bar */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem', marginTop: '0.5rem' }}>
          <div>
            <span style={{ fontSize: '0.725rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>ASSIGNEE</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginTop: '0.25rem' }}>
              <div style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: 'rgba(0, 229, 163, 0.15)', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 600 }}>
                {issue.assignee?.initials || 'PR'}
              </div>
              <span style={{ fontSize: '0.825rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                {issue.assignee?.name || 'Unassigned'}
              </span>
            </div>
          </div>

          <div>
            <span style={{ fontSize: '0.725rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>LABELS</span>
            <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
              {issue.labels && issue.labels.length > 0 ? (
                issue.labels.map((lbl) => (
                  <span key={lbl} style={{ fontSize: '0.7rem', fontFamily: 'var(--font-mono)', color: 'var(--accent-purple)', backgroundColor: 'rgba(139, 124, 255, 0.1)', padding: '0.15rem 0.45rem', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(139, 124, 255, 0.2)' }}>
                    {lbl}
                  </span>
                ))
              ) : (
                <span style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>None</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Activity & Comments Thread */}
      <IssueComments issueId={issue.id || issue.number} comments={issue.comments || []} />

      {/* Modals */}
      <EditIssueModal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} issue={issue} />
      <DeleteIssueModal isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} issue={issue} onDeleted={() => navigate(`/app/projects/${activeProjectId}/issues`)} />
    </div>
  );
}
