const jwt = require("jsonwebtoken");
const User = require("../models/User");

/**
 * Socket.IO Authentication Middleware
 * Validates JWT token from handshake auth or headers and attaches socket.user
 */
const socketAuth = async (socket, next) => {
  try {
    const rawToken =
      socket.handshake.auth?.token ||
      socket.handshake.headers?.authorization?.replace(/^Bearer\s+/i, "");

    if (!rawToken) {
      const err = new Error("Authentication error: Token required");
      err.data = { code: "UNAUTHORIZED" };
      return next(err);
    }

    const decoded = jwt.verify(rawToken, process.env.JWT_SECRET || "supersecretcolabzjwtkey");
    const userId = decoded.userId || decoded.id;

    if (!userId) {
      const err = new Error("Authentication error: Invalid token payload");
      err.data = { code: "UNAUTHORIZED" };
      return next(err);
    }

    const user = await User.findById(userId).select("name email avatar").lean();
    if (!user) {
      const err = new Error("Authentication error: User not found");
      err.data = { code: "USER_NOT_FOUND" };
      return next(err);
    }

    socket.user = {
      id: user._id.toString(),
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
    };

    next();
  } catch (error) {
    const err = new Error("Authentication error: " + (error.message || "Invalid token"));
    err.data = { code: "INVALID_TOKEN" };
    return next(err);
  }
};

module.exports = socketAuth;
