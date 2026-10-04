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

// Wrapped middleware with explicit error handling so Multer never hangs the connection
const uploadMiddleware = (req, res, next) => {
  upload.any()(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(413).json({
            success: false,
            message: "File too large. Maximum size allowed is 20MB per file.",
          });
        }
        if (err.code === "LIMIT_FILE_COUNT") {
          return res.status(400).json({
            success: false,
            message: "Too many files. Maximum is 20 files per upload request.",
          });
        }
        return res.status(400).json({
          success: false,
          message: `Upload error: ${err.message}`,
        });
      }
      return res.status(500).json({
        success: false,
        message: err.message || "Failed to process uploaded file.",
      });
    }
    next();
  });
};

module.exports = {
  uploadSingle: uploadMiddleware,
  uploadMulti: uploadMiddleware,
};

