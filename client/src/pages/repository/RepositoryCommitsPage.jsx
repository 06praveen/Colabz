import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useRepository } from '../../context/RepositoryContext';
import RepositoryTabs from '../../components/repository/RepositoryTabs';
import CommitList from '../../components/repository/CommitList';
import CommitDetail from '../../components/repository/CommitDetail';
import { repositoryService } from '../../services/repositoryService';

export default function RepositoryCommitsPage() {
  const { projectId, commitId } = useParams();
  const { commits, branches } = useRepository();
  const [selectedCommit, setSelectedCommit] = useState(null);

  const activeProjectId = projectId || 'proj_1';

  useEffect(() => {
    async function loadCommit() {
      if (commitId) {
        const detail = await repositoryService.getCommitById(activeProjectId, commitId);
        setSelectedCommit(detail);
      } else {
        setSelectedCommit(null);
      }
    }
    loadCommit();
  }, [activeProjectId, commitId]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <RepositoryTabs commitsCount={commits.length} branchesCount={branches.length} />

      {selectedCommit ? (
        <CommitDetail commit={selectedCommit} />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
              Commits
            </h2>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: '0.15rem 0 0' }}>
              Commit history across repository branches.
            </p>
          </div>

          <CommitList commits={commits} />
        </div>
      )}
    </div>
  );
}
