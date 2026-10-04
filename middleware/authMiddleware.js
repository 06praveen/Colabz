const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { sendError } = require("../utils/apiResponse");

/**
 * Middleware to protect routes and verify JWT Bearer token
 */
const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return sendError(res, "Not authorized, token missing or malformed", 401);
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return sendError(res, "Not authorized, token missing", 401);
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "supersecretcolabzjwtkey"
    );

    const userId = decoded.userId || decoded.id;

    if (!userId) {
      return sendError(res, "Not authorized, invalid token payload", 401);
    }

    const user = await User.findById(userId).select("-password");
    if (!user) {
      return sendError(res, "Not authorized, user not found", 401);
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return sendError(res, "Not authorized, token expired", 401);
    }
    if (error.name === "JsonWebTokenError") {
      return sendError(res, "Not authorized, invalid token", 401);
    }
    return sendError(res, "Not authorized, token verification failed", 401);
  }
};

/**
 * Middleware for optional authentication (sets req.user if valid token present)
 */
const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    req.user = null;
    return next();
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "supersecretcolabzjwtkey"
    );

    const userId = decoded.userId || decoded.id;
    if (userId) {
      const user = await User.findById(userId).select("-password");
      req.user = user || null;
    }
  } catch (err) {
    req.user = null;
  }

  next();
};

module.exports = protect;
module.exports.protect = protect;
module.exports.optionalAuth = optionalAuth;
