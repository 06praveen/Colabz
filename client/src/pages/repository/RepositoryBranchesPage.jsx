import React from 'react';
import { useRepository } from '../../context/RepositoryContext';
import RepositoryTabs from '../../components/repository/RepositoryTabs';
import BranchList from '../../components/repository/BranchList';

export default function RepositoryBranchesPage() {
  const { branches, commits, currentBranch, selectBranch } = useRepository();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <RepositoryTabs commitsCount={commits.length} branchesCount={branches.length} />

      <div>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
          Branches
        </h2>
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: '0.15rem 0 0' }}>
          Active repository branches and divergence status.
        </p>
      </div>

      <BranchList branches={branches} currentBranch={currentBranch} onSelectBranch={selectBranch} />
    </div>
  );
}
