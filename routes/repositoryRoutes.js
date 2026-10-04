const express = require("express");
const {
  getRepositoryTree,
  getFileByPath,
  getFileById,
  createFile,
  updateFile,
  deleteFile,
  createFolder,
  deleteFolder,
  uploadFile,
} = require("../controllers/repositoryController");
const { getFileHistory } = require("../controllers/commitController");
const { protect, optionalAuth } = require("../middleware/authMiddleware");
const {
  requireProjectMember,
  requireProjectMemberOrPublicReadOnly,
} = require("../middleware/membershipMiddleware");
const { uploadSingle } = require("../middleware/uploadMiddleware");

const router = express.Router({ mergeParams: true });

// Read-only endpoints: accessible by project members OR public visitors if project is public
router.get("/", optionalAuth, requireProjectMemberOrPublicReadOnly, getRepositoryTree);
router.get("/tree", optionalAuth, requireProjectMemberOrPublicReadOnly, getRepositoryTree);
router.get("/file", optionalAuth, requireProjectMemberOrPublicReadOnly, getFileByPath);
router.get("/files/:fileId/history", optionalAuth, requireProjectMemberOrPublicReadOnly, getFileHistory);
router.get("/files/:fileId", optionalAuth, requireProjectMemberOrPublicReadOnly, getFileById);
router.get("/files/*", optionalAuth, requireProjectMemberOrPublicReadOnly, getFileByPath);

// Write/Mutation endpoints: STRICTLY require authenticated active membership
router.post("/files", protect, requireProjectMember, createFile);
router.post("/upload", protect, requireProjectMember, uploadSingle, uploadFile);
router.patch("/files/:fileId", protect, requireProjectMember, updateFile);
router.delete("/files/:fileId", protect, requireProjectMember, deleteFile);
router.post("/folders", protect, requireProjectMember, createFolder);
router.delete("/folders", protect, requireProjectMember, deleteFolder);

module.exports = router;
