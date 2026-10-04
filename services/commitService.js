const mongoose = require("mongoose");
const Commit = require("../models/Commit");
const Branch = require("../models/Branch");
const RepositoryFile = require("../models/RepositoryFile");
const { getOrCreateDefaultBranch } = require("./branchService");
const { computeLineDiff } = require("../utils/languageUtils");
const { createActivity } = require("./activityService");

/**
 * Format commit for API response (list & detail)
 */
const formatCommit = (commit, fullDetail = false) => {
  const c = commit.toJSON ? commit.toJSON() : commit;
  const changes = c.changes || [];
  const filesChangedCount = changes.length;

  const diffs = changes.map((ch) => {
    const lineDiff = computeLineDiff(ch.oldContent || "", ch.newContent || "");
    return {
      file: ch.path,
      changeType: ch.changeType,
      additions: ch.additions || lineDiff.additions,
      deletions: ch.deletions || lineDiff.deletions,
      lines: lineDiff.lines,
      oldContent: ch.oldContent || "",
      newContent: ch.newContent || "",
    };
  });

  return {
    id: c._id ? c._id.toString() : c.id,
    _id: c._id ? c._id.toString() : c.id,
    hash: c.hash || (c._id ? c._id.toString().substring(0, 7) : "7a8b9c0"),
    projectId: c.project ? (c.project._id ? c.project._id.toString() : c.project.toString()) : null,
    branchId: c.branch ? (c.branch._id ? c.branch._id.toString() : c.branch.toString()) : null,
    message: c.message,
    author: c.authorName || (typeof c.author === "object" ? c.author.name : "Developer"),
    authorInitials: c.authorInitials || "PR",
    time: c.createdAt
      ? new Date(c.createdAt).toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
        })
      : "Just now",
    createdAt: c.createdAt,
    filesChangedCount,
    parentCommit: c.parentCommit ? c.parentCommit.toString() : null,
    diffs,
    changes,
  };
};

/**
 * Create a new commit
 */
const createCommit = async (project, user, payload, userRole) => {
  if (userRole === "VIEWER") {
    const error = new Error("Permission denied: Viewers cannot create commits");
    error.statusCode = 403;
    throw error;
  }

  const { branch: branchInput, branchId, branchName, message } = payload;
  const rawMessage = (message || "").trim();

  if (!rawMessage) {
    const error = new Error("Commit message is required");
    error.statusCode = 400;
    throw error;
  }

  const branchKey = branchId || branchName || branchInput;
  let branch = null;
  if (branchKey && mongoose.Types.ObjectId.isValid(branchKey)) {
    branch = await Branch.findOne({ _id: branchKey, project: project._id });
  }
  if (!branch && branchKey) {
    branch = await Branch.findOne({ name: branchKey, project: project._id });
  }

  if (!branch) {
    branch = await getOrCreateDefaultBranch(project, user);
  }

  // Find all current files in this branch
  const currentFiles = await RepositoryFile.find({
    project: project._id,
    branch: branch._id,
    type: "FILE",
  });

  // Find previous commit on this branch to compare
  let parentCommit = null;
  if (branch.headCommit) {
    parentCommit = await Commit.findById(branch.headCommit);
  }

  const changes = [];

  if (!parentCommit) {
    // Initial commit: all current files are ADD
    currentFiles.forEach((file) => {
      const diff = computeLineDiff("", file.content || "");
      changes.push({
        fileId: file._id,
        path: file.path,
        changeType: "ADD",
        oldContent: "",
        newContent: file.content || "",
        additions: diff.additions,
        deletions: diff.deletions,
      });
    });
  } else {
    // Compare current working state with parent commit's file snapshots
    const prevFileMap = {};
    (parentCommit.changes || []).forEach((c) => {
      prevFileMap[c.path] = c.newContent || "";
    });

    const currentFileMap = {};
    currentFiles.forEach((file) => {
      currentFileMap[file.path] = file;
    });

    // Check for ADD and MODIFY
    currentFiles.forEach((file) => {
      const prevContent = prevFileMap[file.path];
      if (prevContent === undefined) {
        // File is newly added
        const diff = computeLineDiff("", file.content || "");
        changes.push({
          fileId: file._id,
          path: file.path,
          changeType: "ADD",
          oldContent: "",
          newContent: file.content || "",
          additions: diff.additions,
          deletions: diff.deletions,
        });
      } else if (prevContent !== file.content) {
        // File is modified
        const diff = computeLineDiff(prevContent, file.content || "");
        changes.push({
          fileId: file._id,
          path: file.path,
          changeType: "MODIFY",
          oldContent: prevContent,
          newContent: file.content || "",
          additions: diff.additions,
          deletions: diff.deletions,
        });
      }
    });

    // Check for DELETE
    Object.keys(prevFileMap).forEach((oldPath) => {
      if (!currentFileMap[oldPath]) {
        const oldContent = prevFileMap[oldPath];
        const diff = computeLineDiff(oldContent, "");
        changes.push({
          path: oldPath,
          changeType: "DELETE",
          oldContent,
          newContent: "",
          additions: diff.additions,
          deletions: diff.deletions,
        });
      }
    });
  }

  // If no changes compared to previous commit, check if force commit or throw error
  if (changes.length === 0 && parentCommit) {
    const error = new Error("There are no changes to commit.");
    error.statusCode = 400;
    throw error;
  }

  const initials = (user.name || "User")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  const newCommit = await Commit.create({
    project: project._id,
    branch: branch._id,
    message: rawMessage,
    author: user._id,
    authorName: user.name || "Developer",
    authorInitials: initials,
    parentCommit: parentCommit ? parentCommit._id : null,
    changes,
  });

  // Update branch head
  branch.headCommit = newCommit._id;
  await branch.save();

  // Update lastCommitMessage on files
  await RepositoryFile.updateMany(
    { project: project._id, branch: branch._id },
    { lastCommitMessage: rawMessage }
  );

  await createActivity({
    project: project._id,
    actor: user._id,
    type: "COMMIT_CREATED",
    entityType: "REPOSITORY",
    entityId: newCommit._id,
    title: "New commit created",
    message: `${user.name || "Developer"} committed "${rawMessage}" to ${branch.name}`,
    metadata: {
      hash: newCommit.hash,
      branch: branch.name,
      filesChanged: changes.length,
    },
  });

  return formatCommit(newCommit, true);
};

/**
 * Get commit log for project/branch
 */
const getCommits = async (projectId, query = {}) => {
  const filter = { project: projectId };

  if (query.branchId && mongoose.Types.ObjectId.isValid(query.branchId)) {
    filter.branch = query.branchId;
  }

  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 30));
  const skip = (page - 1) * limit;

  const commits = await Commit.find(filter)
    .populate("author", "name email avatar")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  return commits.map((c) => formatCommit(c, false));
};

/**
 * Get commit detail by ID or hash
 */
const getCommitById = async (projectId, commitId) => {
  const query = { project: projectId };

  if (mongoose.Types.ObjectId.isValid(commitId)) {
    query.$or = [{ _id: commitId }, { hash: commitId }];
  } else {
    query.hash = commitId;
  }

  const commit = await Commit.findOne(query).populate("author", "name email avatar");
  return commit ? formatCommit(commit, true) : null;
};

/**
 * Get history of commits modifying a specific file
 */
const getFileHistory = async (projectId, fileId) => {
  const file = await RepositoryFile.findOne({ _id: fileId, project: projectId });
  const targetPath = file ? file.path : fileId;

  const commits = await Commit.find({
    project: projectId,
    "changes.path": targetPath,
  })
    .populate("author", "name email avatar")
    .sort({ createdAt: -1 });

  return commits.map((c) => formatCommit(c, false));
};

module.exports = {
  createCommit,
  getCommits,
  getCommitById,
  getFileHistory,
};
