const multer = require("multer");

// Configure memory storage to read uploaded file buffers
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB per file limit
    files: 20, // Max 20 files at once
  },
});

// Middleware supporting single 'file' or multiple 'files' / 'file' fields
const uploadMultiOrSingle = upload.any();

module.exports = {
  uploadSingle: uploadMultiOrSingle,
  uploadMulti: uploadMultiOrSingle,
};
