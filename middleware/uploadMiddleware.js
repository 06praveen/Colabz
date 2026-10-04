const multer = require("multer");

// Configure memory storage to read uploaded file buffer
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 15 * 1024 * 1024, // 15MB file size limit
  },
});

module.exports = {
  uploadSingle: upload.single("file"),
};
