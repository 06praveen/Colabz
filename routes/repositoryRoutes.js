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
const protect = require("../middleware/authMiddleware");
const { requireProjectMember } = require("../middleware/membershipMiddleware");
const { uploadSingle } = require("../middleware/uploadMiddleware");

const router = express.Router({ mergeParams: true });

// All routes require authentication and project membership
router.use(protect);
router.use(requireProjectMember);

// Repository Tree
router.get("/", getRepositoryTree);
router.get("/tree", getRepositoryTree);

// File Operations
router.get("/file", getFileByPath);
router.post("/files", createFile);
router.post("/upload", uploadSingle, uploadFile);
router.get("/files/:fileId/history", getFileHistory);
router.get("/files/:fileId", getFileById);
router.patch("/files/:fileId", updateFile);
router.delete("/files/:fileId", deleteFile);
router.get("/files/*", getFileByPath);

// Folder Operations
router.post("/folders", createFolder);
router.delete("/folders", deleteFolder);

module.exports = router;
