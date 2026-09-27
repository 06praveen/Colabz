import { mockRepositories } from '../mock/repositories';
import { mockFiles } from '../mock/files';
import { mockCommits } from '../mock/commits';
import { mockBranches } from '../mock/branches';

export const repositoryService = {
  // Fetch Repository Metadata
  async getRepository(projectId) {
    const repo = mockRepositories.find((r) => r.projectId === projectId);
    return repo || mockRepositories[0];
  },

  // Get File Tree for project
  async getFiles(projectId) {
    return mockFiles[projectId] || mockFiles.proj_1;
  },

  // Get File by Path
  async getFileByPath(projectId, pathStr) {
    const files = mockFiles[projectId] || mockFiles.proj_1;
    if (!pathStr || pathStr === '/') return null;

    const findRecursive = (nodes, currentPath) => {
      for (const node of nodes) {
        if (node.path === currentPath) return node;
        if (node.isFolder && node.children) {
          const found = findRecursive(node.children, currentPath);
          if (found) return found;
        }
      }
      return null;
    };

    return findRecursive(files, pathStr);
  },

  // Get Branches List
  async getBranches(projectId) {
    return mockBranches[projectId] || mockBranches.proj_1;
  },

  // Get Commits Log
  async getCommits(projectId) {
    return mockCommits[projectId] || mockCommits.proj_1;
  },

  // Get Single Commit Detail
  async getCommitById(projectId, commitId) {
    const commits = mockCommits[projectId] || mockCommits.proj_1;
    return commits.find((c) => c.id === commitId || c.hash === commitId) || commits[0];
  },

  // Create File (Frontend State Mock)
  async createFile(projectId, parentPath, fileName, content = '') {
    const files = mockFiles[projectId] || mockFiles.proj_1;
    const newPath = parentPath ? `${parentPath}/${fileName}` : fileName;
    const ext = fileName.split('.').pop();

    const newFileNode = {
      id: `f_${Date.now()}`,
      name: fileName,
      path: newPath,
      isFolder: false,
      commitMessage: `create ${fileName}`,
      updatedAt: 'Just now',
      size: `${content.length} B`,
      language: ext,
      content: content || `// ${fileName}\n\nexport default function ${fileName.split('.')[0]}() {\n  return null;\n}`
    };

    if (!parentPath) {
      files.unshift(newFileNode);
    } else {
      const parentFolder = await this.getFileByPath(projectId, parentPath);
      if (parentFolder && parentFolder.isFolder) {
        if (!parentFolder.children) parentFolder.children = [];
        parentFolder.children.unshift(newFileNode);
      } else {
        files.unshift(newFileNode);
      }
    }

    return newFileNode;
  },

  // Create Folder (Frontend State Mock)
  async createFolder(projectId, parentPath, folderName) {
    const files = mockFiles[projectId] || mockFiles.proj_1;
    const newPath = parentPath ? `${parentPath}/${folderName}` : folderName;

    const newFolderNode = {
      id: `f_dir_${Date.now()}`,
      name: folderName,
      path: newPath,
      isFolder: true,
      commitMessage: `create directory ${folderName}`,
      updatedAt: 'Just now',
      children: []
    };

    if (!parentPath) {
      files.unshift(newFolderNode);
    } else {
      const parentFolder = await this.getFileByPath(projectId, parentPath);
      if (parentFolder && parentFolder.isFolder) {
        if (!parentFolder.children) parentFolder.children = [];
        parentFolder.unshift(newFolderNode);
      } else {
        files.unshift(newFolderNode);
      }
    }

    return newFolderNode;
  }
};
