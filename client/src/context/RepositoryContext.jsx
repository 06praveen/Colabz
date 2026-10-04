import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { repositoryService } from '../services/repositoryService';

const RepositoryContext = createContext(null);

export function RepositoryProvider({ projectId, children }) {
  const [repo, setRepo] = useState(null);
  const [files, setFiles] = useState([]);
  const [branches, setBranches] = useState([]);
  const [commits, setCommits] = useState([]);
  const [currentBranch, setCurrentBranch] = useState('main');
  const [loading, setLoading] = useState(true);

  const loadRepositoryData = useCallback(async () => {
    if (!projectId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const [repoData, filesData, branchesData, commitsData] = await Promise.all([
        repositoryService.getRepository(projectId),
        repositoryService.getFiles(projectId),
        repositoryService.getBranches(projectId),
        repositoryService.getCommits(projectId)
      ]);

      setRepo(repoData);
      setFiles(Array.isArray(filesData) ? [...filesData] : []);
      setBranches(Array.isArray(branchesData) ? branchesData : []);
      setCommits(Array.isArray(commitsData) ? commitsData : []);
      setCurrentBranch(repoData?.defaultBranch || 'main');
    } catch (err) {
      console.error('Failed to load repository:', err);
      // On error, set empty state to avoid crash
      setFiles([]);
      setBranches([]);
      setCommits([]);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    loadRepositoryData();
  }, [loadRepositoryData]);

  const selectBranch = useCallback(async (branchName) => {
    setCurrentBranch(branchName);
    // Reload files for the selected branch
    if (projectId) {
      try {
        const filesData = await repositoryService.getFiles(projectId, branchName);
        setFiles(Array.isArray(filesData) ? [...filesData] : []);
      } catch (err) {
        console.error('Failed to load branch files:', err);
      }
    }
  }, [projectId]);

  const createFile = async (parentPath, fileName, content) => {
    try {
      const newFile = await repositoryService.createFile(projectId, parentPath, fileName, content);
      await loadRepositoryData();
      return newFile;
    } catch (err) {
      console.error('Failed to create file:', err);
      throw err;
    }
  };

  const createFolder = async (parentPath, folderName) => {
    try {
      const newFolder = await repositoryService.createFolder(projectId, parentPath, folderName);
      await loadRepositoryData();
      return newFolder;
    } catch (err) {
      console.error('Failed to create folder:', err);
      throw err;
    }
  };

  const uploadFile = async (formData) => {
    try {
      const uploadedFile = await repositoryService.uploadFile(projectId, formData);
      await loadRepositoryData();
      return uploadedFile;
    } catch (err) {
      console.error('Failed to upload file:', err);
      throw err;
    }
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
        uploadFile,
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
