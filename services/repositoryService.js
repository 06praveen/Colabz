const mongoose = require("mongoose");
const RepositoryFile = require("../models/RepositoryFile");
const Branch = require("../models/Branch");
const { getOrCreateDefaultBranch } = require("./branchService");
const { normalizePath, getParentPath, getBaseName } = require("../utils/pathUtils");
const { detectLanguage } = require("../utils/languageUtils");
const { createActivity } = require("./activityService");

/**
 * Format file record for frontend consumption
 */
const formatFileNode = (file) => {
  const f = file.toJSON ? file.toJSON() : file;
  const isFolder = f.type === "FOLDER" || f.isFolder;

  return {
    id: f._id ? f._id.toString() : f.id,
    _id: f._id ? f._id.toString() : f.id,
    name: f.name,
    path: f.path,
    isFolder,
    type: isFolder ? "FOLDER" : "FILE",
    content: f.content || "",
    language: f.language || detectLanguage(f.name),
    size: f.size || 0,
    commitMessage: f.lastCommitMessage || f.commitMessage || "updated",
    updatedAt: f.updatedAt
      ? new Date(f.updatedAt).toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
        })
      : "Just now",
    children: [],
  };
};

/**
 * Convert flat list of files into a nested folder tree (matching mock files shape)
 */
const buildNestedTree = (filesList) => {
  const nodesMap = {};
  const rootNodes = [];

  // Initialize all nodes
  filesList.forEach((file) => {
    const formatted = formatFileNode(file);
    nodesMap[formatted.path] = formatted;
  });

  // Build hierarchy
  Object.values(nodesMap).forEach((node) => {
    const parentPath = getParentPath(node.path);
    if (parentPath && nodesMap[parentPath]) {
      nodesMap[parentPath].children.push(node);
    } else {
      rootNodes.push(node);
    }
  });

  return rootNodes;
};

/**
 * Resolve branch from ID or name, with default fallback
 */
const resolveBranch = async (project, branchQuery = null, user = null) => {
  if (branchQuery) {
    if (mongoose.Types.ObjectId.isValid(branchQuery)) {
      const b = await Branch.findOne({ _id: branchQuery, project: project._id });
      if (b) return b;
    }
    const bName = await Branch.findOne({ name: branchQuery, project: project._id });
    if (bName) return bName;
  }
  return await getOrCreateDefaultBranch(project, user);
};

/**
 * Get full file tree for a project & branch
 */
const getRepositoryTree = async (project, user, branchQuery) => {
  const branch = await resolveBranch(project, branchQuery, user);
  const files = await RepositoryFile.find({
    project: project._id,
    branch: branch._id,
  }).sort({ type: -1, name: 1 });

  const tree = buildNestedTree(files);
  const flat = files.map(formatFileNode);

  return {
    branch: {
      id: branch._id.toString(),
      name: branch.name,
      isDefault: branch.isDefault,
    },
    files: tree,
    flatList: flat,
  };
};

/**
 * Get a single file by path
 */
const getFileByPath = async (project, branchQuery, rawPath) => {
  const branch = await resolveBranch(project, branchQuery);
  const normalized = normalizePath(rawPath);

  if (!normalized) return null;

  const file = await RepositoryFile.findOne({
    project: project._id,
    branch: branch._id,
    path: normalized,
  });

  return file ? formatFileNode(file) : null;
};

/**
 * Get a single file by ID
 */
const getFileById = async (projectId, fileId) => {
  if (!mongoose.Types.ObjectId.isValid(fileId)) return null;
  const file = await RepositoryFile.findOne({ _id: fileId, project: projectId });
  return file ? formatFileNode(file) : null;
};

/**
 * Create a new file
 */
const createFile = async (project, user, payload, userRole) => {
  if (userRole === "VIEWER") {
    const error = new Error("Permission denied: Viewers cannot create files");
    error.statusCode = 403;
    throw error;
  }

  const { branch, branchId, branchName, parentPath, fileName, path, content } = payload;
  const branchDoc = await resolveBranch(project, branchId || branchName || branch, user);

  let targetPath = "";
  let baseName = "";

  if (fileName) {
    baseName = fileName.trim();
    const p = normalizePath(parentPath || "");
    targetPath = p ? `${p}/${baseName}` : baseName;
  } else if (path) {
    targetPath = normalizePath(path);
    baseName = getBaseName(targetPath);
  }

  if (!targetPath || !baseName) {
    const error = new Error("File name and path are required");
    error.statusCode = 400;
    throw error;
  }

  // Check duplicate
  const existing = await RepositoryFile.findOne({
    project: project._id,
    branch: branchDoc._id,
    path: targetPath,
  });

  if (existing) {
    const error = new Error(`A file already exists at path "${targetPath}"`);
    error.statusCode = 409;
    throw error;
  }

  // Ensure intermediate folder records exist
  const parent = getParentPath(targetPath);
  if (parent) {
    const parts = parent.split("/");
    let accum = "";
    for (const part of parts) {
      accum = accum ? `${accum}/${part}` : part;
      const folderExists = await RepositoryFile.findOne({
        project: project._id,
        branch: branchDoc._id,
        path: accum,
      });

      if (!folderExists) {
        await RepositoryFile.create({
          project: project._id,
          branch: branchDoc._id,
          name: part,
          path: accum,
          type: "FOLDER",
          lastCommitMessage: `Create ${accum}`,
          createdBy: user._id,
          updatedBy: user._id,
        });
      }
    }
  }

  const fileContent = content !== undefined ? content : "";
  const language = detectLanguage(baseName);

  const newFile = await RepositoryFile.create({
    project: project._id,
    branch: branchDoc._id,
    name: baseName,
    path: targetPath,
    type: "FILE",
    content: fileContent,
    language,
    size: Buffer.byteLength(fileContent, "utf8"),
    lastCommitMessage: `Create ${baseName}`,
    createdBy: user._id,
    updatedBy: user._id,
  });

  await createActivity({
    project: project._id,
    actor: user._id,
    type: "FILE_CREATED",
    entityType: "REPOSITORY",
    entityId: newFile._id,
    title: "File created",
    message: `${user.name || "Developer"} created file "${baseName}"`,
    metadata: { path: targetPath },
  });

  return formatFileNode(newFile);
};

/**
 * Update file contents or rename
 */
const updateFile = async (projectId, user, fileId, updates, userRole) => {
  if (userRole === "VIEWER") {
    const error = new Error("Permission denied: Viewers cannot edit files");
    error.statusCode = 403;
    throw error;
  }

  const query = { project: projectId };
  if (mongoose.Types.ObjectId.isValid(fileId)) {
    query._id = fileId;
  } else {
    query.path = normalizePath(fileId);
  }

  const file = await RepositoryFile.findOne(query);
  if (!file) {
    const error = new Error("File not found");
    error.statusCode = 404;
    throw error;
  }

  if (updates.content !== undefined) {
    file.content = updates.content;
    file.size = Buffer.byteLength(updates.content, "utf8");
  }

  if (updates.path) {
    const newPath = normalizePath(updates.path);
    const existing = await RepositoryFile.findOne({
      project: projectId,
      branch: file.branch,
      path: newPath,
      _id: { $ne: file._id },
    });
    if (existing) {
      const error = new Error(`A file already exists at path "${newPath}"`);
      error.statusCode = 409;
      throw error;
    }
    file.path = newPath;
    file.name = getBaseName(newPath);
    file.language = detectLanguage(file.name);
  }

  file.updatedBy = user._id;
  await file.save();

  await createActivity({
    project: projectId,
    actor: user._id,
    type: "FILE_UPDATED",
    entityType: "REPOSITORY",
    entityId: file._id,
    title: "File updated",
    message: `${user.name || "Developer"} updated file "${file.name}"`,
    metadata: { path: file.path },
  });

  return formatFileNode(file);
};

/**
 * Delete a file
 */
const deleteFile = async (projectId, user, fileId, userRole) => {
  if (userRole === "VIEWER") {
    const error = new Error("Permission denied: Viewers cannot delete files");
    error.statusCode = 403;
    throw error;
  }

  const query = { project: projectId };
  if (mongoose.Types.ObjectId.isValid(fileId)) {
    query._id = fileId;
  } else {
    query.path = normalizePath(fileId);
  }

  const file = await RepositoryFile.findOne(query);
  if (!file) {
    const error = new Error("File not found");
    error.statusCode = 404;
    throw error;
  }

  const fileName = file.name;
  const filePath = file.path;

  await RepositoryFile.deleteOne({ _id: file._id });

  await createActivity({
    project: projectId,
    actor: user._id,
    type: "FILE_DELETED",
    entityType: "REPOSITORY",
    entityId: file._id,
    title: "File deleted",
    message: `${user.name || "Developer"} deleted file "${fileName}"`,
    metadata: { path: filePath },
  });

  return true;
};

/**
 * Create a folder
 */
const createFolder = async (project, user, payload, userRole) => {
  if (userRole === "VIEWER") {
    const error = new Error("Permission denied: Viewers cannot create folders");
    error.statusCode = 403;
    throw error;
  }

  const { branch, branchId, branchName, parentPath, folderName, path } = payload;
  const branchDoc = await resolveBranch(project, branchId || branchName || branch, user);

  let targetPath = "";
  let baseName = "";

  if (folderName) {
    baseName = folderName.trim();
    const p = normalizePath(parentPath || "");
    targetPath = p ? `${p}/${baseName}` : baseName;
  } else if (path) {
    targetPath = normalizePath(path);
    baseName = getBaseName(targetPath);
  }

  if (!targetPath || !baseName) {
    const error = new Error("Folder name and path are required");
    error.statusCode = 400;
    throw error;
  }

  const existing = await RepositoryFile.findOne({
    project: project._id,
    branch: branchDoc._id,
    path: targetPath,
  });

  if (existing) {
    const error = new Error(`Folder already exists at path "${targetPath}"`);
    error.statusCode = 409;
    throw error;
  }

  const newFolder = await RepositoryFile.create({
    project: project._id,
    branch: branchDoc._id,
    name: baseName,
    path: targetPath,
    type: "FOLDER",
    lastCommitMessage: `Create folder ${baseName}`,
    createdBy: user._id,
    updatedBy: user._id,
  });

  return formatFileNode(newFolder);
};

/**
 * Delete a folder and all child files/subfolders
 */
const deleteFolder = async (projectId, user, payload, userRole) => {
  if (userRole === "VIEWER") {
    const error = new Error("Permission denied: Viewers cannot delete folders");
    error.statusCode = 403;
    throw error;
  }

  const { branchId, path: rawPath } = payload;
  const normalized = normalizePath(rawPath);

  if (!normalized) {
    const error = new Error("Folder path is required");
    error.statusCode = 400;
    throw error;
  }

  const query = {
    project: projectId,
    $or: [{ path: normalized }, { path: new RegExp(`^${normalized}/`) }],
  };

  if (branchId && mongoose.Types.ObjectId.isValid(branchId)) {
    query.branch = branchId;
  }

  const result = await RepositoryFile.deleteMany(query);
  return { deletedCount: result.deletedCount };
};

/**
 * Upload a file into repository
 */
const uploadFile = async (project, user, payload, userRole) => {
  if (userRole === "VIEWER") {
    const error = new Error("Permission denied: Viewers cannot upload files");
    error.statusCode = 403;
    throw error;
  }

  const { branch, branchId, branchName, parentPath, fileName, content } = payload;
  const branchDoc = await resolveBranch(project, branchId || branchName || branch, user);

  const baseName = (fileName || "uploaded_file.txt").trim();
  const p = normalizePath(parentPath || "");
  const targetPath = p ? `${p}/${baseName}` : baseName;

  if (!targetPath || !baseName) {
    const error = new Error("File name is required");
    error.statusCode = 400;
    throw error;
  }

  // Ensure intermediate folder records exist
  const parent = getParentPath(targetPath);
  if (parent) {
    const parts = parent.split("/");
    let accum = "";
    for (const part of parts) {
      accum = accum ? `${accum}/${part}` : part;
      const folderExists = await RepositoryFile.findOne({
        project: project._id,
        branch: branchDoc._id,
        path: accum,
      });

      if (!folderExists) {
        await RepositoryFile.create({
          project: project._id,
          branch: branchDoc._id,
          name: part,
          path: accum,
          type: "FOLDER",
          lastCommitMessage: `Create ${accum}`,
          createdBy: user._id,
          updatedBy: user._id,
        });
      }
    }
  }

  const fileContent = content !== undefined ? content : "";
  const language = detectLanguage(baseName);
  const fileSize = Buffer.byteLength(fileContent, "utf8");

  let file = await RepositoryFile.findOne({
    project: project._id,
    branch: branchDoc._id,
    path: targetPath,
  });

  if (file) {
    file.content = fileContent;
    file.size = fileSize;
    file.language = language;
    file.lastCommitMessage = `Upload ${baseName}`;
    file.updatedBy = user._id;
    await file.save();

    await createActivity({
      project: project._id,
      actor: user._id,
      type: "FILE_UPDATED",
      entityType: "REPOSITORY",
      entityId: file._id,
      title: "File uploaded (overwrite)",
      message: `${user.name || "Developer"} uploaded and updated "${baseName}"`,
      metadata: { path: targetPath },
    });
  } else {
    file = await RepositoryFile.create({
      project: project._id,
      branch: branchDoc._id,
      name: baseName,
      path: targetPath,
      type: "FILE",
      content: fileContent,
      language,
      size: fileSize,
      lastCommitMessage: `Upload ${baseName}`,
      createdBy: user._id,
      updatedBy: user._id,
    });

    await createActivity({
      project: project._id,
      actor: user._id,
      type: "FILE_CREATED",
      entityType: "REPOSITORY",
      entityId: file._id,
      title: "File uploaded",
      message: `${user.name || "Developer"} uploaded file "${baseName}"`,
      metadata: { path: targetPath },
    });
  }

  return formatFileNode(file);
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

