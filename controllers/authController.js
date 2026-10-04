const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { sendSuccess, sendError } = require("../utils/apiResponse");

/**
 * Generate signed JWT token for user with 7-day expiration
 */
const generateToken = (user) => {
  return jwt.sign(
    {
      userId: user._id.toString(),
      id: user._id.toString(),
      email: user.email,
    },
    process.env.JWT_SECRET || "supersecretcolabzjwtkey",
    { expiresIn: "7d" }
  );
};

/**
 * Formats user profile for client response
 */
const formatUserResponse = (user, defaultRole = "DEVELOPER") => {
  return {
    id: user._id.toString(),
    _id: user._id.toString(),
    name: user.name,
    username: user.username || (user.email ? user.email.split("@")[0].toLowerCase() : "user"),
    email: user.email,
    avatar: user.avatar || null,
    avatarColor: user.avatarColor || "#14b8a6",
    bio: user.bio || "",
    skills: user.skills || [],
    role: defaultRole,
    isOnline: user.isOnline,
    lastSeen: user.lastSeen,
    createdAt: user.createdAt,
  };
};

/**
 * Register a new user
 * Route: POST /api/auth/register
 */
const registerUser = async (req, res, next) => {
  try {
    const { name, username, email, password } = req.body;

    const normalizedEmail = email ? email.trim().toLowerCase() : "";
    const normalizedUsername = (username || (email ? email.split("@")[0] : ""))
      .trim()
      .toLowerCase();

    // Validate username format
    if (!/^[a-zA-Z0-9_]{3,30}$/.test(normalizedUsername)) {
      return sendError(
        res,
        "Username must be 3-30 characters and contain only letters, numbers, and underscores",
        400
      );
    }

    // Check if username already exists
    const usernameExists = await User.findOne({ username: normalizedUsername });
    if (usernameExists) {
      return sendError(res, "Username already taken", 409);
    }

    // Check if email already exists
    const userExists = await User.findOne({ email: normalizedEmail });
    if (userExists) {
      return sendError(res, "An account with this email already exists", 409);
    }

    // Create user in database
    const user = await User.create({
      name: name.trim(),
      username: normalizedUsername,
      email: normalizedEmail,
      password,
    });

    const token = generateToken(user);

    return sendSuccess(
      res,
      {
        user: formatUserResponse(user, "OWNER"),
        token,
      },
      201,
      "Account created successfully"
    );
  } catch (error) {
    if (error.code === 11000) {
      if (error.keyPattern?.username || error.message?.includes("username")) {
        return sendError(res, "Username already taken", 409);
      }
      return sendError(res, "An account with this email already exists", 409);
    }
    next(error);
  }
};

/**
 * Authenticate user and get token
 * Route: POST /api/auth/login
 */
const loginUser = async (req, res, next) => {
  try {
    const { email, username, emailOrUsername, password } = req.body;

    const identifier = (email || username || emailOrUsername || "").trim().toLowerCase();

    if (!identifier) {
      return sendError(res, "Email or username is required", 400);
    }

    // Support logging in via email or username
    const query = identifier.includes("@")
      ? { email: identifier }
      : { $or: [{ username: identifier }, { email: identifier }] };

    // Find user including password hash explicitly
    const user = await User.findOne(query).select("+password");
    if (!user) {
      return sendError(res, "Invalid credentials", 401);
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return sendError(res, "Invalid credentials", 401);
    }

    user.isOnline = true;
    user.lastSeen = new Date();
    await user.save();

    const token = generateToken(user);

    return sendSuccess(
      res,
      {
        user: formatUserResponse(user, "DEVELOPER"),
        token,
      },
      200,
      "Login successful"
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get current authenticated user profile
 * Route: GET /api/auth/me
 */
const getMe = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id || req.user.userId;
    const user = await User.findById(userId);

    if (!user) {
      return sendError(res, "User not found", 404);
    }

    return sendSuccess(res, {
      user: formatUserResponse(user, "DEVELOPER"),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Logout user
 * Route: POST /api/auth/logout
 */
const logoutUser = async (req, res, next) => {
  try {
    if (req.user && (req.user._id || req.user.id || req.user.userId)) {
      const userId = req.user._id || req.user.id || req.user.userId;
      await User.findByIdAndUpdate(userId, {
        isOnline: false,
        lastSeen: new Date(),
      });
    }

    return sendSuccess(res, null, 200, "Logged out successfully");
  } catch (error) {
    next(error);
  }
};

/**
 * Initiate GitHub OAuth Flow
 * Route: GET /api/auth/github
 */
const initiateGitHubAuth = (req, res) => {
  const clientId = process.env.GITHUB_CLIENT_ID;
  if (!clientId) {
    return res.status(500).json({
      success: false,
      message: "GitHub OAuth is not configured. GITHUB_CLIENT_ID is missing.",
    });
  }

  const callbackUrl =
    process.env.GITHUB_CALLBACK_URL ||
    `${req.protocol}://${req.get("host")}/api/auth/github/callback`;

  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(
    callbackUrl
  )}&scope=user:email,read:user`;

  return res.redirect(githubAuthUrl);
};

/**
 * Handle GitHub OAuth Callback
 * Route: GET /api/auth/github/callback
 */
const handleGitHubCallback = async (req, res, next) => {
  const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
  try {
    const { code, error } = req.query;

    if (error || !code) {
      return res.redirect(
        `${clientUrl}/login?error=${encodeURIComponent(error || "GitHub authentication cancelled")}`
      );
    }

    const clientId = process.env.GITHUB_CLIENT_ID;
    const clientSecret = process.env.GITHUB_CLIENT_SECRET;
    const callbackUrl =
      process.env.GITHUB_CALLBACK_URL ||
      `${req.protocol}://${req.get("host")}/api/auth/github/callback`;

    // 1. Exchange code for access token
    const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: callbackUrl,
      }),
    });

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;

    if (!accessToken) {
      return res.redirect(
        `${clientUrl}/login?error=${encodeURIComponent(
          tokenData.error_description || "Failed to retrieve GitHub access token"
        )}`
      );
    }

    // 2. Fetch user profile from GitHub
    const userRes = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "User-Agent": "Colabz-App",
      },
    });
    const githubUser = await userRes.json();

    // 3. Fetch user emails from GitHub
    let primaryEmail = githubUser.email;
    if (!primaryEmail) {
      const emailsRes = await fetch("https://api.github.com/user/emails", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "User-Agent": "Colabz-App",
        },
      });
      const emails = await emailsRes.json();
      if (Array.isArray(emails)) {
        const primary = emails.find((e) => e.primary && e.verified) || emails[0];
        if (primary) primaryEmail = primary.email;
      }
    }

    if (!primaryEmail) {
      primaryEmail = `${githubUser.id}+${githubUser.login}@users.noreply.github.com`;
    }

    primaryEmail = primaryEmail.toLowerCase().trim();

    // 4. Find existing user by githubId or email
    let user = await User.findOne({
      $or: [{ githubId: githubUser.id.toString() }, { email: primaryEmail }],
    });

    if (user) {
      // Link githubId if not already linked
      if (!user.githubId) {
        user.githubId = githubUser.id.toString();
        user.authProvider = user.authProvider || "github";
      }
      if (!user.avatar && githubUser.avatar_url) {
        user.avatar = githubUser.avatar_url;
      }
      user.isOnline = true;
      user.lastSeen = new Date();
      await user.save();
    } else {
      // Generate clean unique username
      let baseUsername = (githubUser.login || primaryEmail.split("@")[0])
        .toLowerCase()
        .replace(/[^a-z0-9_]/g, "_")
        .replace(/^_+|_+$/g, "");

      if (baseUsername.length < 3) baseUsername = `gh_${baseUsername}`;
      if (baseUsername.length > 25) baseUsername = baseUsername.substring(0, 25);

      let candidateUsername = baseUsername;
      let counter = 1;
      while (await User.exists({ username: candidateUsername })) {
        candidateUsername = `${baseUsername}_${counter}`;
        counter++;
      }

      user = await User.create({
        name: githubUser.name || githubUser.login || "GitHub User",
        username: candidateUsername,
        email: primaryEmail,
        githubId: githubUser.id.toString(),
        authProvider: "github",
        avatar: githubUser.avatar_url || "",
        bio: (githubUser.bio || "").substring(0, 300),
        isOnline: true,
      });
    }

    const token = generateToken(user);
    const userPayload = formatUserResponse(user, "DEVELOPER");

    return res.redirect(
      `${clientUrl}/login?token=${token}&user=${encodeURIComponent(
        JSON.stringify(userPayload)
      )}`
    );
  } catch (err) {
    console.error("GitHub OAuth Callback error:", err);
    return res.redirect(
      `${clientUrl}/login?error=${encodeURIComponent("Authentication failed: " + err.message)}`
    );
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
  logoutUser,
  initiateGitHubAuth,
  handleGitHubCallback,
};
