import React, { useState } from 'react';
import { useIssues } from '../../context/IssueContext';
import IssueListItem from '../../components/issues/IssueListItem';
import IssueFilters from '../../components/issues/IssueFilters';
import CreateIssueModal from '../../components/issues/CreateIssueModal';
import { Plus, CircleDot, CheckCircle2, RefreshCw, AlertCircle } from 'lucide-react';

export default function Issues() {
  const {
    issues,
    loading,
    error,
    activeTab,
    setActiveTab,
    searchQuery,
    filters,
    clearFilters,
    reloadIssues
  } = useIssues();

  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const openCount = issues.filter((i) => String(i.status).toLowerCase() === 'open').length;
  const closedCount = issues.filter((i) => String(i.status).toLowerCase() === 'closed').length;

  // Filter issues locally
  const filteredIssues = issues.filter((i) => {
    // Tab filter: open / closed
    const isOpen = String(i.status).toLowerCase() === 'open';
    if (activeTab === 'open' && !isOpen) return false;
    if (activeTab === 'closed' && isOpen) return false;

    // Priority filter
    if (filters.priority && String(i.priority).toLowerCase() !== String(filters.priority).toLowerCase()) {
      return false;
    }

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = i.title.toLowerCase().includes(q);
      const matchNum = String(i.number).includes(q);
      const matchDesc = i.description?.toLowerCase().includes(q);
      const matchAuthor = i.author?.toLowerCase().includes(q);
      const matchLabel = i.labels?.some((l) => l.toLowerCase().includes(q));

      if (!matchTitle && !matchNum && !matchDesc && !matchAuthor && !matchLabel) {
        return false;
      }
    }
    return true;
  });

  // 1. Loading State
  if (loading) {
    return (
      <div className="clb-card" style={{ padding: '3.5rem 1.5rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
        <RefreshCw size={24} color="var(--accent-primary)" style={{ animation: 'clb-spin 1s linear infinite' }} />
        <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
          Loading project issues...
        </span>
      </div>
    );
  }

  // 2. Error State
  if (error) {
    return (
      <div className="clb-card" style={{ padding: '3rem 1.5rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
        <AlertCircle size={28} color="var(--danger)" />
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
            Something went wrong.
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0.35rem 0 0' }}>{error}</p>
        </div>
        <button onClick={reloadIssues} className="clb-btn clb-btn-secondary">
          Try again
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.2px' }}>
            Issues
          </h2>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: '0.2rem 0 0' }}>
            Report bugs, request enhancements, and track problem reports.
          </p>
        </div>

        <button onClick={() => setIsCreateOpen(true)} className="clb-btn clb-btn-primary">
          <Plus size={15} />
          <span>New Issue</span>
        </button>
      </div>

      {/* Sub-Tabs: Open vs Closed */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.4rem' }}>
        <button
          onClick={() => setActiveTab('open')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.4rem 0.75rem',
            borderRadius: 'var(--radius-sm)',
            border: 'none',
            backgroundColor: activeTab === 'open' ? 'var(--bg-elevated)' : 'transparent',
            color: activeTab === 'open' ? 'var(--text-primary)' : 'var(--text-muted)',
            fontSize: '0.8125rem',
            fontWeight: activeTab === 'open' ? 600 : 400,
            cursor: 'pointer'
          }}
        >
          <CircleDot size={14} color={activeTab === 'open' ? 'var(--accent-primary)' : 'currentColor'} />
          <span>Open</span>
          <span style={{ fontSize: '0.7rem', fontFamily: 'var(--font-mono)', backgroundColor: 'rgba(255, 255, 255, 0.05)', padding: '0.1rem 0.35rem', borderRadius: 'var(--radius-sm)' }}>
            {openCount}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('closed')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.4rem 0.75rem',
            borderRadius: 'var(--radius-sm)',
            border: 'none',
            backgroundColor: activeTab === 'closed' ? 'var(--bg-elevated)' : 'transparent',
            color: activeTab === 'closed' ? 'var(--text-primary)' : 'var(--text-muted)',
            fontSize: '0.8125rem',
            fontWeight: activeTab === 'closed' ? 600 : 400,
            cursor: 'pointer'
          }}
        >
          <CheckCircle2 size={14} color={activeTab === 'closed' ? 'var(--accent-primary)' : 'currentColor'} />
          <span>Closed</span>
          <span style={{ fontSize: '0.7rem', fontFamily: 'var(--font-mono)', backgroundColor: 'rgba(255, 255, 255, 0.05)', padding: '0.1rem 0.35rem', borderRadius: 'var(--radius-sm)' }}>
            {closedCount}
          </span>
        </button>
      </div>

      {/* Search & Filter Controls */}
      <IssueFilters />

      {/* Main Issues List */}
      {filteredIssues.length === 0 ? (
        searchQuery || filters.priority ? (
          /* Filtered No Match State */
          <div className="clb-card" style={{ padding: '3rem 1.5rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.85rem' }}>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0 }}>
              No issues match your filters.
            </p>
            <button onClick={clearFilters} className="clb-btn clb-btn-secondary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.8125rem' }}>
              Clear filters
            </button>
          </div>
        ) : (
          /* Empty State (Requirement #31) */
          <div className="clb-card" style={{ padding: '4rem 1.5rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-default)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)' }}>
              <CircleDot size={28} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                No issues found
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0.35rem 0 0' }}>
                {activeTab === 'open' ? 'Everything looks clear here.' : 'No closed issues in this repository yet.'}
              </p>
            </div>
            <button onClick={() => setIsCreateOpen(true)} className="clb-btn clb-btn-primary" style={{ marginTop: '0.5rem' }}>
              <Plus size={15} />
              Create Issue
            </button>
          </div>
        )
      ) : (
        <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
          {filteredIssues.map((issue) => (
            <IssueListItem key={issue.id || issue.number} issue={issue} />
          ))}
        </div>
      )}

      {/* Create Issue Modal */}
      <CreateIssueModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
    </div>
  );
}
