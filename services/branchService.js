const mongoose = require("mongoose");
const Branch = require("../models/Branch");
const RepositoryFile = require("../models/RepositoryFile");
const { detectLanguage } = require("../utils/languageUtils");
const { createActivity } = require("./activityService");

/**
 * Format branch for API response
 */
const formatBranch = (branch) => {
  const b = branch.toJSON ? branch.toJSON() : branch;
  return {
    id: b._id ? b._id.toString() : b.id,
    _id: b._id ? b._id.toString() : b.id,
    projectId: b.project ? (b.project._id ? b.project._id.toString() : b.project.toString()) : null,
    name: b.name,
    isDefault: Boolean(b.isDefault),
    headCommit: b.headCommit ? (b.headCommit._id ? b.headCommit._id.toString() : b.headCommit.toString()) : null,
    createdAt: b.createdAt,
    updatedAt: b.updatedAt,
  };
};

/**
 * Ensure default branch exists for project, and initialize default README.md
 */
const getOrCreateDefaultBranch = async (project, user = null) => {
  let defaultBranch = await Branch.findOne({ project: project._id, isDefault: true });

  if (!defaultBranch) {
    defaultBranch = await Branch.findOne({ project: project._id, name: "main" });
    if (defaultBranch) {
      defaultBranch.isDefault = true;
      await defaultBranch.save();
    }
  }

  if (!defaultBranch) {
    defaultBranch = await Branch.create({
      project: project._id,
      name: "main",
      isDefault: true,
      createdBy: user?._id || project.owner,
    });

    // Check if initial README.md exists, if not, create it
    const existingReadme = await RepositoryFile.findOne({
      project: project._id,
      branch: defaultBranch._id,
      path: "README.md",
    });

    if (!existingReadme) {
      const readmeContent = `# ${project.name}\n\n${project.description || "Welcome to this Colabz project."}\n\n## Technologies\n- ${
        (project.technologies || ["JavaScript", "React", "Node.js"]).join("\n- ")
      }\n\n## Getting Started\n1. Clone or view repository workspace files.\n2. Collaborate in real-time with team members.\n`;

      await RepositoryFile.create({
        project: project._id,
        branch: defaultBranch._id,
        name: "README.md",
        path: "README.md",
        type: "FILE",
        content: readmeContent,
        language: "markdown",
        size: Buffer.byteLength(readmeContent, "utf8"),
        lastCommitMessage: "Initial commit",
        createdBy: user?._id || project.owner,
        updatedBy: user?._id || project.owner,
      });
    }
  }

  return defaultBranch;
};

/**
 * Get all branches for a project
 */
const getBranches = async (projectId) => {
  const branches = await Branch.find({ project: projectId })
    .populate("headCommit")
    .sort({ isDefault: -1, name: 1 });

  return branches.map((branch) => {
    const formatted = formatBranch(branch);
    if (branch.headCommit && typeof branch.headCommit === "object") {
      formatted.lastCommitMessage = branch.headCommit.message || "Initial commit";
    } else {
      formatted.lastCommitMessage = "Initial commit";
    }
    return formatted;
  });
};

/**
 * Create a new branch
 */
const createBranch = async (project, user, { name, sourceBranchId, sourceBranchName }, userRole) => {
  if (userRole === "VIEWER") {
    const error = new Error("Permission denied: Viewers cannot create branches");
    error.statusCode = 403;
    throw error;
  }

  const rawName = (name || "").trim();
  if (!rawName) {
    const error = new Error("Branch name is required");
    error.statusCode = 400;
    throw error;
  }

  // Branch name validation
  const branchRegex = /^(?!.*(?:\/\.|\/\/|\.\.|@\{|\\\\))[^\s\~\^\:\[\]\?\*\\]+$/;
  if (!branchRegex.test(rawName) || rawName.startsWith("/") || rawName.endsWith("/")) {
    const error = new Error(
      "Invalid branch name format. Avoid spaces, leading/trailing slashes, and special characters."
    );
    error.statusCode = 400;
    throw error;
  }

  // Check duplicate branch name
  const existing = await Branch.findOne({ project: project._id, name: rawName });
  if (existing) {
    const error = new Error(`Branch "${rawName}" already exists in this project`);
    error.statusCode = 409;
    throw error;
  }

  // Find source branch
  let sourceBranch = null;
  if (sourceBranchId && mongoose.Types.ObjectId.isValid(sourceBranchId)) {
    sourceBranch = await Branch.findOne({ _id: sourceBranchId, project: project._id });
  } else if (sourceBranchName) {
    sourceBranch = await Branch.findOne({ name: sourceBranchName, project: project._id });
  }

  if (!sourceBranch) {
    sourceBranch = await getOrCreateDefaultBranch(project, user);
  }

  // Create branch record
  const newBranch = await Branch.create({
    project: project._id,
    name: rawName,
    isDefault: false,
    headCommit: sourceBranch.headCommit || null,
    createdBy: user._id,
  });

  // Copy working files from source branch to new branch
  const sourceFiles = await RepositoryFile.find({
    project: project._id,
    branch: sourceBranch._id,
  });

  if (sourceFiles.length > 0) {
    const branchCopies = sourceFiles.map((f) => ({
      project: project._id,
      branch: newBranch._id,
      name: f.name,
      path: f.path,
      type: f.type,
      content: f.content,
      language: f.language,
      size: f.size,
      lastCommitMessage: f.lastCommitMessage,
      createdBy: user._id,
      updatedBy: user._id,
    }));
    await RepositoryFile.insertMany(branchCopies);
  }

  await createActivity({
    project: project._id,
    actor: user._id,
    type: "BRANCH_CREATED",
    entityType: "BRANCH",
    entityId: newBranch._id,
    title: "Branch created",
    message: `${user.name || "Developer"} created branch "${rawName}"`,
    metadata: { branchName: rawName },
  });

  return formatBranch(newBranch);
};

/**
 * Rename branch
 */
const renameBranch = async (projectId, branchId, newName, userRole) => {
  if (userRole === "VIEWER") {
    const error = new Error("Permission denied: Viewers cannot rename branches");
    error.statusCode = 403;
    throw error;
  }

  const rawName = (newName || "").trim();
  if (!rawName) {
    const error = new Error("New branch name is required");
    error.statusCode = 400;
    throw error;
  }

  let branch = null;
  if (mongoose.Types.ObjectId.isValid(branchId)) {
    branch = await Branch.findOne({ _id: branchId, project: projectId });
  } else {
    branch = await Branch.findOne({ name: branchId, project: projectId });
  }

  if (!branch) {
    const error = new Error("Branch not found");
    error.statusCode = 404;
    throw error;
  }

  const existing = await Branch.findOne({ project: projectId, name: rawName, _id: { $ne: branch._id } });
  if (existing) {
    const error = new Error(`Branch name "${rawName}" already exists`);
    error.statusCode = 409;
    throw error;
  }

  branch.name = rawName;
  await branch.save();
  return formatBranch(branch);
};

/**
 * Delete branch
 */
const deleteBranch = async (projectId, branchId, userRole, user = null) => {
  if (userRole === "VIEWER") {
    const error = new Error("Permission denied: Viewers cannot delete branches");
    error.statusCode = 403;
    throw error;
  }

  let branch = null;
  if (mongoose.Types.ObjectId.isValid(branchId)) {
    branch = await Branch.findOne({ _id: branchId, project: projectId });
  } else {
    branch = await Branch.findOne({ name: branchId, project: projectId });
  }

  if (!branch) {
    const error = new Error("Branch not found");
    error.statusCode = 404;
    throw error;
  }

  if (branch.isDefault || branch.name === "main") {
    const error = new Error("The default branch cannot be deleted.");
    error.statusCode = 400;
    throw error;
  }

  const branchName = branch.name;

  await Promise.all([
    Branch.deleteOne({ _id: branch._id }),
    RepositoryFile.deleteMany({ project: projectId, branch: branch._id }),
  ]);

  if (user) {
    await createActivity({
      project: projectId,
      actor: user._id,
      type: "BRANCH_DELETED",
      entityType: "BRANCH",
      entityId: branch._id,
      title: "Branch deleted",
      message: `${user.name || "Developer"} deleted branch "${branchName}"`,
      metadata: { branchName },
    });
  }

  return true;
};

module.exports = {
  getOrCreateDefaultBranch,
  getBranches,
  createBranch,
  renameBranch,
  deleteBranch,
};
