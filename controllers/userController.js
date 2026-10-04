const mongoose = require("mongoose");
const User = require("../models/User");
const { sendSuccess, sendError } = require("../utils/apiResponse");

/**
 * Format public safe user profile
 */
const formatPublicUser = (user) => {
  return {
    _id: user._id.toString(),
    id: user._id.toString(),
    name: user.name,
    username: user.username || (user.email ? user.email.split("@")[0].toLowerCase() : ""),
    email: user.email,
    avatar: user.avatar || null,
    avatarColor: user.avatarColor || "#14b8a6",
    bio: user.bio || "",
    skills: user.skills || [],
    isOnline: user.isOnline || false,
    lastSeen: user.lastSeen || new Date(),
  };
};

/**
 * Search users by username, email, or name
 * Route: GET /api/users/search?username=... or ?q=...
 */
const searchUsers = async (req, res, next) => {
  try {
    const rawQuery = (req.query.username || req.query.q || req.query.search || "").trim();

    if (!rawQuery || rawQuery.length < 1) {
      return sendSuccess(res, { users: [] });
    }

    const cleanQuery = rawQuery.replace(/^@/, "").toLowerCase();
    const regex = new RegExp(cleanQuery, "i");

    const currentUserId = req.user._id || req.user.id;

    // Search matching users excluding current user
    const users = await User.find({
      _id: { $ne: currentUserId },
      $or: [
        { username: regex },
        { name: regex },
        { email: regex },
      ],
    })
      .select("name username email avatar avatarColor bio skills isOnline lastSeen")
      .limit(20)
      .lean();

    const formatted = users.map(formatPublicUser);

    return sendSuccess(res, { users: formatted, count: formatted.length });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current authenticated user profile
 * Route: GET /api/users/me
 */
const getMyProfile = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      return sendError(res, "User not found", 404);
    }

    return sendSuccess(res, { user: formatPublicUser(user) });
  } catch (error) {
    next(error);
  }
};

/**
 * Update current user's profile (including unique username)
 * Route: PATCH /api/users/me
 */
const updateMyProfile = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const { username, name, bio, skills, avatar, avatarColor } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return sendError(res, "User not found", 404);
    }

    // 1. Username change validation
    if (username !== undefined) {
      const normalizedUsername = username.trim().toLowerCase().replace(/^@/, "");

      if (normalizedUsername !== user.username) {
        if (!/^[a-zA-Z0-9_]{3,30}$/.test(normalizedUsername)) {
          return sendError(
            res,
            "Username must be 3-30 characters and contain only letters, numbers, and underscores",
            400
          );
        }

        const existing = await User.findOne({
          username: normalizedUsername,
          _id: { $ne: userId },
        });

        if (existing) {
          return sendError(res, "Username already taken", 409);
        }

        user.username = normalizedUsername;
      }
    }

    // 2. Name update
    if (name !== undefined) {
      const trimmedName = name.trim();
      if (trimmedName.length < 2 || trimmedName.length > 50) {
        return sendError(res, "Name must be between 2 and 50 characters", 400);
      }
      user.name = trimmedName;
    }

    // 3. Bio & skills
    if (bio !== undefined) {
      user.bio = String(bio).substring(0, 300);
    }

    if (skills !== undefined && Array.isArray(skills)) {
      user.skills = skills.map((s) => String(s).trim()).filter(Boolean);
    }

    // 4. Avatar & Color
    if (avatar !== undefined) {
      user.avatar = String(avatar);
    }

    if (avatarColor !== undefined) {
      user.avatarColor = String(avatarColor);
    }

    await user.save();

    const formatted = formatPublicUser(user);

    return sendSuccess(
      res,
      { user: formatted },
      200,
      "Profile updated successfully"
    );
  } catch (error) {
    if (error.code === 11000) {
      return sendError(res, "Username already taken", 409);
    }
    next(error);
  }
};

/**
 * Get user by ID or Username
 * Route: GET /api/users/:identifier
 */
const getUserByIdOrUsername = async (req, res, next) => {
  try {
    const { identifier } = req.params;
    const cleanId = (identifier || "").trim().toLowerCase().replace(/^@/, "");

    let user = null;
    if (mongoose.Types.ObjectId.isValid(identifier)) {
      user = await User.findById(identifier);
    }

    if (!user) {
      user = await User.findOne({ username: cleanId });
    }

    if (!user) {
      return sendError(res, "User not found", 404);
    }

    return sendSuccess(res, { user: formatPublicUser(user) });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  searchUsers,
  getMyProfile,
  updateMyProfile,
  getUserByIdOrUsername,
  formatPublicUser,
};
