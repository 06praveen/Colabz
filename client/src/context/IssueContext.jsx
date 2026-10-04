import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { issueService } from '../services/issueService';
import { useProjects } from './ProjectContext';

const IssueContext = createContext(null);

export function IssueProvider({ projectId: propProjectId, children }) {
  const { currentProject } = useProjects();
  const effectiveProjectId =
    propProjectId && propProjectId !== 'proj_1'
      ? propProjectId
      : currentProject?._id || currentProject?.id || propProjectId || 'proj_1';

  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('open'); // 'open' or 'closed'
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    priority: '',
    assignee: '',
    label: '',
  });

  const loadIssues = useCallback(async () => {
    if (!effectiveProjectId) {
      setIssues([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await issueService.getIssues(effectiveProjectId);
      setIssues([...(data || [])]);
    } catch (err) {
      console.error('Failed to load issues:', err);
      setError('Failed to load issues for this project.');
    } finally {
      setLoading(false);
    }
  }, [effectiveProjectId]);

  useEffect(() => {
    loadIssues();
  }, [loadIssues]);

  const createIssue = async (issueData) => {
    const newIssue = await issueService.createIssue(effectiveProjectId, issueData);
    await loadIssues();
    return newIssue;
  };

  const updateIssue = async (issueId, updates) => {
    const updated = await issueService.updateIssue(effectiveProjectId, issueId, updates);
    await loadIssues();
    return updated;
  };

  const deleteIssue = async (issueId) => {
    await issueService.deleteIssue(effectiveProjectId, issueId);
    await loadIssues();
    return true;
  };

  const closeIssue = async (issueId) => {
    return updateIssue(issueId, { status: 'Closed' });
  };

  const reopenIssue = async (issueId) => {
    return updateIssue(issueId, { status: 'Open' });
  };

  const addComment = async (issueId, text) => {
    const comm = await issueService.addComment(effectiveProjectId, issueId, text);
    await loadIssues();
    return comm;
  };

  const clearFilters = () => {
    setFilters({ priority: '', assignee: '', label: '' });
    setSearchQuery('');
  };

  return (
    <IssueContext.Provider
      value={{
        projectId: effectiveProjectId,
        issues,
        loading,
        error,
        activeTab,
        setActiveTab,
        searchQuery,
        setSearchQuery,
        filters,
        setFilters,
        clearFilters,
        createIssue,
        updateIssue,
        deleteIssue,
        closeIssue,
        reopenIssue,
        addComment,
        reloadIssues: loadIssues,
      }}
    >
      {children}
    </IssueContext.Provider>
  );
}

export function useIssues() {
  const context = useContext(IssueContext);
  if (!context) {
    throw new Error('useIssues must be used within an IssueProvider');
  }
  return context;
}

export default IssueContext;
