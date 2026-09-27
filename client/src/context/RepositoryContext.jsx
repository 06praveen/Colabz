import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { repositoryService } from '../services/repositoryService';

const RepositoryContext = createContext(null);

export function RepositoryProvider({ projectId = 'proj_1', children }) {
  const [repo, setRepo] = useState(null);
  const [files, setFiles] = useState([]);
  const [branches, setBranches] = useState([]);
  const [commits, setCommits] = useState([]);
  const [currentBranch, setCurrentBranch] = useState('main');
  const [loading, setLoading] = useState(true);

  const loadRepositoryData = useCallback(async () => {
    setLoading(true);
    try {
      const [repoData, filesData, branchesData, commitsData] = await Promise.all([
        repositoryService.getRepository(projectId),
        repositoryService.getFiles(projectId),
        repositoryService.getBranches(projectId),
        repositoryService.getCommits(projectId)
      ]);

      setRepo(repoData);
      setFiles([...filesData]);
      setBranches(branchesData);
      setCommits(commitsData);
      setCurrentBranch(repoData?.defaultBranch || 'main');
    } catch (err) {
      console.error('Failed to load repository:', err);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    loadRepositoryData();
  }, [loadRepositoryData]);

  const selectBranch = (branchName) => {
    setCurrentBranch(branchName);
  };

  const createFile = async (parentPath, fileName, content) => {
    const newFile = await repositoryService.createFile(projectId, parentPath, fileName, content);
    await loadRepositoryData();
    return newFile;
  };

  const createFolder = async (parentPath, folderName) => {
    const newFolder = await repositoryService.createFolder(projectId, parentPath, folderName);
    await loadRepositoryData();
    return newFolder;
  };

  return (
    <RepositoryContext.Provider
      value={{
        projectId,
        repo,
        files,
        branches,
        commits,
        currentBranch,
        loading,
        selectBranch,
        createFile,
        createFolder,
        reload: loadRepositoryData
      }}
    >
      {children}
    </RepositoryContext.Provider>
  );
}

export function useRepository() {
  const context = useContext(RepositoryContext);
  if (!context) {
    throw new Error('useRepository must be used within a RepositoryProvider');
  }
  return context;
}
