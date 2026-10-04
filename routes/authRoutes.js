const express = require("express");
const {
  registerUser,
  loginUser,
  getMe,
  logoutUser,
  initiateGitHubAuth,
  handleGitHubCallback,
} = require("../controllers/authController");
const protect = require("../middleware/authMiddleware");
const validate = require("../middleware/validateMiddleware");
const rateLimit = require("../middleware/rateLimitMiddleware");
const { registerValidator, loginValidator } = require("../validators/authValidator");

const router = express.Router();

// Rate limiter: 20 auth attempts per 5 minutes to prevent brute-force attacks
const authLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 20,
  message: "Too many authentication attempts. Please try again in a few minutes.",
});

router.post("/register", authLimiter, validate(registerValidator), registerUser);
router.post("/login", authLimiter, validate(loginValidator), loginUser);
router.get("/me", protect, getMe);
router.post("/logout", logoutUser);

// GitHub OAuth routes
router.get("/github", initiateGitHubAuth);
router.get("/github/callback", handleGitHubCallback);

module.exports = router;
