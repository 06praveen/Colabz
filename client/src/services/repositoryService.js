import api from './api';

export const repositoryService = {
  /**
   * Fetch repository file tree for a project
   * GET /api/projects/:projectId/repository/tree
   */
  async getFiles(projectId, branch) {
    const params = {};
    if (branch) params.branch = branch;
    const res = await api.get(`/api/projects/${projectId}/repository/tree`, { params });
    return res.data?.data?.files || [];
  },

  /**
   * Fetch repository metadata (branch info + stats)
   * GET /api/projects/:projectId/repository/tree
   */
  async getRepository(projectId) {
    try {
      const res = await api.get(`/api/projects/${projectId}/repository/tree`);
      const data = res.data?.data || {};
      return {
        projectId,
        defaultBranch: data.branch?.name || 'main',
        branchId: data.branch?.id || null,
      };
    } catch {
      return {
        projectId,
        defaultBranch: 'main',
        branchId: null,
      };
    }
  },

  /**
   * Get file by path
   * GET /api/projects/:projectId/repository/file?path=...
   */
  async getFileByPath(projectId, filePath, branch) {
    if (!filePath || filePath === '/') return null;
    try {
      const params = { path: filePath };
      if (branch) params.branch = branch;
      const res = await api.get(`/api/projects/${projectId}/repository/file`, { params });
      return res.data?.data?.file || null;
    } catch {
      return null;
    }
  },

  /**
   * Get file by ID
   * GET /api/projects/:projectId/repository/files/:fileId
   */
  async getFileById(projectId, fileId) {
    try {
      const res = await api.get(`/api/projects/${projectId}/repository/files/${fileId}`);
      return res.data?.data?.file || null;
    } catch {
      return null;
    }
  },

  /**
   * Get all branches for a project
   * GET /api/projects/:projectId/branches
   */
  async getBranches(projectId) {
    try {
      const res = await api.get(`/api/projects/${projectId}/branches`);
      return res.data?.data?.branches || [];
    } catch {
      return [];
    }
  },

  /**
   * Get commit history for a project
   * GET /api/projects/:projectId/commits
   */
  async getCommits(projectId, branch) {
    try {
      const params = {};
      if (branch) params.branchId = branch;
      const res = await api.get(`/api/projects/${projectId}/commits`, { params });
      return res.data?.data?.commits || [];
    } catch {
      return [];
    }
  },

  /**
   * Get single commit detail by ID
   * GET /api/projects/:projectId/commits/:commitId
   */
  async getCommitById(projectId, commitId) {
    try {
      const res = await api.get(`/api/projects/${projectId}/commits/${commitId}`);
      return res.data?.data?.commit || null;
    } catch {
      return null;
    }
  },

  /**
   * Get commit history for a single file
   * GET /api/projects/:projectId/repository/files/:fileId/history
   */
  async getFileHistory(projectId, fileId) {
    try {
      const res = await api.get(`/api/projects/${projectId}/repository/files/${fileId}/history`);
      return res.data?.data?.commits || [];
    } catch {
      return [];
    }
  },

  /**
   * Create a new file
   * POST /api/projects/:projectId/repository/files
   */
  async createFile(projectId, parentPath, fileName, content = '') {
    const res = await api.post(`/api/projects/${projectId}/repository/files`, {
      parentPath,
      fileName,
      content,
    });
    return res.data?.data?.file || res.data?.data;
  },

  /**
   * Create a new folder
   * POST /api/projects/:projectId/repository/folders
   */
  async createFolder(projectId, parentPath, folderName) {
    const res = await api.post(`/api/projects/${projectId}/repository/folders`, {
      parentPath,
      folderName,
    });
    return res.data?.data?.folder || res.data?.data;
  },

  /**
   * Update a file (content, rename)
   * PATCH /api/projects/:projectId/repository/files/:fileId
   */
  async updateFile(projectId, fileId, updates) {
    const res = await api.patch(`/api/projects/${projectId}/repository/files/${fileId}`, updates);
    return res.data?.data?.file || res.data?.data;
  },

  /**
   * Delete a file
   * DELETE /api/projects/:projectId/repository/files/:fileId
   */
  async deleteFile(projectId, fileId) {
    const res = await api.delete(`/api/projects/${projectId}/repository/files/${fileId}`);
    return res.data;
  },

  /**
   * Delete a folder and all children
   * DELETE /api/projects/:projectId/repository/folders
   */
  async deleteFolder(projectId, folderPath, branchId) {
    const res = await api.delete(`/api/projects/${projectId}/repository/folders`, {
      data: { path: folderPath, branchId },
    });
    return res.data;
  },

  /**
   * Create a new branch
   * POST /api/projects/:projectId/branches
   */
  async createBranch(projectId, name, sourceBranchName) {
    const res = await api.post(`/api/projects/${projectId}/branches`, {
      name,
      sourceBranchName,
    });
    return res.data?.data?.branch || res.data?.data;
  },

  /**
   * Rename a branch
   * PATCH /api/projects/:projectId/branches/:branchId
   */
  async renameBranch(projectId, branchId, name) {
    const res = await api.patch(`/api/projects/${projectId}/branches/${branchId}`, { name });
    return res.data?.data?.branch || res.data?.data;
  },

  /**
   * Delete a branch
   * DELETE /api/projects/:projectId/branches/:branchId
   */
  async deleteBranch(projectId, branchId) {
    const res = await api.delete(`/api/projects/${projectId}/branches/${branchId}`);
    return res.data;
  },

  /**
   * Upload file (multipart/form-data)
   * POST /api/projects/:projectId/repository/upload
   */
  async uploadFile(projectId, formData) {
    const res = await api.post(`/api/projects/${projectId}/repository/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data?.data?.file || res.data?.data;
  },

  /**
   * Create a new commit
   * POST /api/projects/:projectId/commits
   */
  async createCommit(projectId, message, branchName) {
    const res = await api.post(`/api/projects/${projectId}/commits`, {
      message,
      branchName,
    });
    return res.data?.data?.commit || res.data?.data;
  },
};

