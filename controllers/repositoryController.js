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

    if (role === "VIEWER") {
      return sendError(res, "Permission denied: Viewers cannot upload files", 403);
    }

    // Collect all uploaded files from req.files or req.file
    let filesToUpload = [];
    if (Array.isArray(req.files) && req.files.length > 0) {
      // De-duplicate if client sent same file under multiple field names
      const seen = new Set();
      for (const f of req.files) {
        const key = `${f.originalname}_${f.size}`;
        if (!seen.has(key)) {
          seen.add(key);
          filesToUpload.push(f);
        }
      }
    } else if (req.file) {
      filesToUpload.push(req.file);
    }

    if (filesToUpload.length === 0 && !req.body.fileName && !req.body.content) {
      return sendError(res, "Please select at least one file to upload", 400);
    }

    if (filesToUpload.length > 20) {
      return sendError(res, "Maximum 20 files allowed per upload request", 400);
    }

    const parentPath = req.body.parentPath || "";
    const branchName = req.body.branch || req.body.branchId || req.body.branchName;

    const uploadedFiles = [];

    if (filesToUpload.length > 0) {
      for (const f of filesToUpload) {
        // Sanitize filename and prevent path traversal
        const sanitizedName = (f.originalname || "uploaded_file.txt")
          .replace(/\\/g, "/")
          .split("/")
          .pop()
          .trim();

        if (!sanitizedName || sanitizedName === "." || sanitizedName === "..") {
          continue;
        }

        const payload = {
          fileName: sanitizedName,
          content: f.buffer ? f.buffer.toString("utf8") : "",
          parentPath,
          branch: branchName,
        };
        const uploaded = await repositoryService.uploadFile(project, user, payload, role);
        uploadedFiles.push(uploaded);
      }
    } else if (req.body.fileName) {
      const sanitizedName = req.body.fileName
        .replace(/\\/g, "/")
        .split("/")
        .pop()
        .trim();

      const payload = {
        fileName: sanitizedName,
        content: req.body.content || "",
        parentPath,
        branch: branchName,
      };
      const uploaded = await repositoryService.uploadFile(project, user, payload, role);
      uploadedFiles.push(uploaded);
    }

    if (uploadedFiles.length === 0) {
      return sendError(res, "No valid files were processed for upload", 400);
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
        : `File "${uploadedFiles[0].name}" uploaded successfully`
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

