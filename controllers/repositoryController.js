const repositoryService = require("../services/repositoryService");
const { sendSuccess, sendError } = require("../utils/apiResponse");

/**
 * Get repository file tree
 * Route: GET /api/projects/:projectId/repository/tree
 */
const getRepositoryTree = async (req, res, next) => {
  try {
    const project = req.project;
    const user = req.user;
    const branchQuery = req.query.branch || req.query.branchId;

    const data = await repositoryService.getRepositoryTree(project, user, branchQuery);
    return sendSuccess(res, data);
  } catch (error) {
    next(error);
  }
};

/**
 * Get file by path or wildcard path
 * Route: GET /api/projects/:projectId/repository/files/*
 */
const getFileByPath = async (req, res, next) => {
  try {
    const project = req.project;
    const branchQuery = req.query.branch || req.query.branchId;
    const rawPath = req.params[0] || req.query.path;

    if (!rawPath) {
      return sendError(res, "File path is required", 400);
    }

    const file = await repositoryService.getFileByPath(project, branchQuery, rawPath);
    if (!file) {
      return sendError(res, `File not found at path "${rawPath}"`, 404);
    }

    return sendSuccess(res, { file });
  } catch (error) {
    next(error);
  }
};

/**
 * Get file by ID
 * Route: GET /api/projects/:projectId/repository/files/:fileId
 */
const getFileById = async (req, res, next) => {
  try {
    const project = req.project;
    const { fileId } = req.params;

    const file = await repositoryService.getFileById(project._id, fileId);
    if (!file) {
      return sendError(res, "File not found", 404);
    }

    return sendSuccess(res, { file });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new file in repository
 * Route: POST /api/projects/:projectId/repository/files
 */
const createFile = async (req, res, next) => {
  try {
    const project = req.project;
    const user = req.user;
    const role = (req.membership?.role || "VIEWER").toUpperCase();

    const file = await repositoryService.createFile(project, user, req.body, role);
    return sendSuccess(res, { file }, 201, "File created successfully");
  } catch (error) {
    if (error.statusCode) {
      return sendError(res, error.message, error.statusCode);
    }
    next(error);
  }
};

/**
 * Update file contents or path
 * Route: PATCH /api/projects/:projectId/repository/files/:fileId
 */
const updateFile = async (req, res, next) => {
  try {
    const project = req.project;
    const user = req.user;
    const { fileId } = req.params;
    const role = (req.membership?.role || "VIEWER").toUpperCase();

    const file = await repositoryService.updateFile(project._id, user, fileId, req.body, role);
    return sendSuccess(res, { file }, 200, "File updated successfully");
  } catch (error) {
    if (error.statusCode) {
      return sendError(res, error.message, error.statusCode);
    }
    next(error);
  }
};

/**
 * Delete a file
 * Route: DELETE /api/projects/:projectId/repository/files/:fileId
 */
const deleteFile = async (req, res, next) => {
  try {
    const project = req.project;
    const user = req.user;
    const { fileId } = req.params;
    const role = (req.membership?.role || "VIEWER").toUpperCase();

    await repositoryService.deleteFile(project._id, user, fileId, role);
    return sendSuccess(res, null, 200, "File deleted successfully");
  } catch (error) {
    if (error.statusCode) {
      return sendError(res, error.message, error.statusCode);
    }
    next(error);
  }
};

/**
 * Create a folder
 * Route: POST /api/projects/:projectId/repository/folders
 */
const createFolder = async (req, res, next) => {
  try {
    const project = req.project;
    const user = req.user;
    const role = (req.membership?.role || "VIEWER").toUpperCase();

    const folder = await repositoryService.createFolder(project, user, req.body, role);
    return sendSuccess(res, { folder }, 201, "Folder created successfully");
  } catch (error) {
    if (error.statusCode) {
      return sendError(res, error.message, error.statusCode);
    }
    next(error);
  }
};

/**
 * Delete a folder
 * Route: DELETE /api/projects/:projectId/repository/folders
 */
const deleteFolder = async (req, res, next) => {
  try {
    const project = req.project;
    const user = req.user;
    const role = (req.membership?.role || "VIEWER").toUpperCase();

    const result = await repositoryService.deleteFolder(project._id, user, req.body, role);
    return sendSuccess(res, result, 200, "Folder deleted successfully");
  } catch (error) {
    if (error.statusCode) {
      return sendError(res, error.message, error.statusCode);
    }
    next(error);
  }
};

/**
 * Upload single or multiple files (multipart/form-data)
 * Route: POST /api/projects/:projectId/repository/upload
 */
const uploadFile = async (req, res, next) => {
  try {
    const project = req.project;
    const user = req.user;
    const role = (req.membership?.role || "VIEWER").toUpperCase();

    const filesToUpload = req.files && req.files.length > 0
      ? req.files
      : req.file
      ? [req.file]
      : [];

    if (filesToUpload.length === 0 && !req.body.fileName && !req.body.content) {
      return sendError(res, "Please select at least one file to upload", 400);
    }

    const uploadedFiles = [];

    if (filesToUpload.length > 0) {
      for (const f of filesToUpload) {
        const payload = {
          fileName: f.originalname,
          content: f.buffer.toString("utf8"),
          parentPath: req.body.parentPath || "",
          branch: req.body.branch || req.body.branchId || req.body.branchName,
        };
        const uploaded = await repositoryService.uploadFile(project, user, payload, role);
        uploadedFiles.push(uploaded);
      }
    } else {
      const payload = {
        fileName: req.body.fileName,
        content: req.body.content || "",
        parentPath: req.body.parentPath || "",
        branch: req.body.branch || req.body.branchId || req.body.branchName,
      };
      const uploaded = await repositoryService.uploadFile(project, user, payload, role);
      uploadedFiles.push(uploaded);
    }

    return sendSuccess(
      res,
      {
        file: uploadedFiles[0],
        files: uploadedFiles,
        count: uploadedFiles.length,
      },
      201,
      uploadedFiles.length > 1
        ? `${uploadedFiles.length} files uploaded successfully`
        : "File uploaded successfully"
    );
  } catch (error) {
    if (error.statusCode) {
      return sendError(res, error.message, error.statusCode);
    }
    next(error);
  }
};

module.exports = {
  getRepositoryTree,
  getFileByPath,
  getFileById,
  createFile,
  updateFile,
  deleteFile,
  createFolder,
  deleteFolder,
  uploadFile,
};

