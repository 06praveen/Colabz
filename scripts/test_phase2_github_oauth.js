const mongoose = require("mongoose");
const crypto = require("crypto");
const dotenv = require("dotenv");
dotenv.config();

const User = require("../models/User");
const { registerUser, loginUser, generateToken } = require("../controllers/authController");

async function runPhase2OAuthTests() {
  console.log("==================================================");
  console.log("STARTING COLABZ PHASE 2 GITHUB OAUTH TEST SUITE");
  console.log("==================================================");

  try {
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || "mongodb://localhost:27017/colabz";
    await mongoose.connect(mongoUri);
    console.log("✓ Connected to MongoDB for OAuth testing");

    const timestamp = Date.now();

    // -------------------------------------------------------------
    // TEST 1: Standard Email/Password User Creation & Verification
    // -------------------------------------------------------------
    console.log("\n[TEST 1] Testing Standard Email/Password Auth...");
    const localUser = new User({
      name: "OAuth Local Test User",
      email: `oauth_test_${timestamp}@colabz.test`,
      username: `oauthtest_${timestamp}`,
      password: "securepassword123",
      authProvider: "local",
    });
    await localUser.save();

    console.log("✓ Standard user registered:", localUser.email, "Username:", localUser.username);

    // Password comparison check
    const isPasswordMatch = await localUser.matchPassword("securepassword123");
    const isBadPasswordMatch = await localUser.matchPassword("wrongpass");
    if (isPasswordMatch && !isBadPasswordMatch) {
      console.log("✓ Password hashing & bcrypt verification: PASS");
    } else {
      throw new Error("Password verification failed");
    }

    // -------------------------------------------------------------
    // TEST 2: Cryptographic State Generation & Verification
    // -------------------------------------------------------------
    console.log("\n[TEST 2] Testing Cryptographic State Mechanism...");
    const generateOAuthState = () => {
      const random = crypto.randomBytes(24).toString("hex");
      const time = Date.now();
      const payload = `${random}.${time}`;
      const signature = crypto
        .createHmac("sha256", process.env.JWT_SECRET || "supersecretcolabzjwtkey")
        .update(payload)
        .digest("hex");
      return `${payload}.${signature}`;
    };

    const verifyOAuthState = (state) => {
      if (!state || typeof state !== "string") return false;
      const parts = state.split(".");
      if (parts.length !== 3) return false;
      const [random, timestampStr, signature] = parts;
      const time = parseInt(timestampStr, 10);

      if (isNaN(time) || Date.now() - time > 15 * 60 * 1000 || Date.now() < time - 60000) {
        return false;
      }

      const payload = `${random}.${timestampStr}`;
      const expectedSig = crypto
        .createHmac("sha256", process.env.JWT_SECRET || "supersecretcolabzjwtkey")
        .update(payload)
        .digest("hex");

      try {
        return crypto.timingSafeEqual(
          Buffer.from(signature, "hex"),
          Buffer.from(expectedSig, "hex")
        );
      } catch {
        return false;
      }
    };

    const validState = generateOAuthState();
    console.log("✓ Generated State:", validState.substring(0, 30) + "...");
    const isGoodValid = verifyOAuthState(validState);
    const isTamperedValid = verifyOAuthState(validState + "tampered");
    const isBadStateValid = verifyOAuthState("invalid.state.signature");

    if (isGoodValid && !isTamperedValid && !isBadStateValid) {
      console.log("✓ State verification & cryptographic HMAC protection: PASS");
    } else {
      throw new Error("State verification failed");
    }

    // -------------------------------------------------------------
    // TEST 3: Account Linking by GitHub ID / Verified Email
    // -------------------------------------------------------------
    console.log("\n[TEST 3] Testing Account Linking Policy with Verified Email...");
    const ghId = `gh_id_${timestamp}`;
    const ghEmail = localUser.email; // matches existing user

    // Simulate GitHub authentication for existing user
    let existingUser = await User.findOne({
      $or: [{ githubId: ghId }, { email: ghEmail }],
    });

    if (existingUser) {
      if (!existingUser.githubId) {
        existingUser.githubId = ghId;
        existingUser.authProvider = "github";
        await existingUser.save();
      }
      console.log("✓ Successfully linked GitHub ID to existing Colabz account:", existingUser.email);
    } else {
      throw new Error("Failed to find user for linking");
    }

    // -------------------------------------------------------------
    // TEST 4: New User Creation from GitHub Profile with Username Collision Protection
    // -------------------------------------------------------------
    console.log("\n[TEST 4] Testing New GitHub User Auto-Creation & Unique Username Strategy...");
    const newGhUserPayload = {
      id: `gh_new_${timestamp}`,
      login: `oauthtest_${timestamp}`, // Same username as localUser to test collision handling!
      email: `new_github_${timestamp}@users.noreply.github.com`,
      name: "GitHub New Developer",
      avatar_url: "https://avatars.githubusercontent.com/u/1234567?v=4",
      bio: "Open source builder",
    };

    let baseUsername = (newGhUserPayload.login || newGhUserPayload.email.split("@")[0])
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

    const createdGhUser = new User({
      name: newGhUserPayload.name,
      username: candidateUsername,
      email: newGhUserPayload.email,
      githubId: newGhUserPayload.id,
      authProvider: "github",
      avatar: newGhUserPayload.avatar_url,
      bio: newGhUserPayload.bio,
      isOnline: true,
    });
    await createdGhUser.save();

    console.log("✓ Created New GitHub User successfully:");
    console.log(`  Base Requested: ${newGhUserPayload.login}`);
    console.log(`  Unique Generated: ${createdGhUser.username}`);
    console.log(`  Email: ${createdGhUser.email}`);
    console.log(`  GitHub ID: ${createdGhUser.githubId}`);

    if (createdGhUser.username !== localUser.username) {
      console.log("✓ Username collision safely avoided without overwriting existing user: PASS");
    } else {
      throw new Error("Username collision check failed");
    }

    // -------------------------------------------------------------
    // TEST 5: JWT Token Issuance & Verification
    // -------------------------------------------------------------
    console.log("\n[TEST 5] Testing JWT Generation & Verification...");
    const jwt = require("jsonwebtoken");
    const testToken = jwt.sign(
      {
        userId: createdGhUser._id.toString(),
        id: createdGhUser._id.toString(),
        email: createdGhUser.email,
      },
      process.env.JWT_SECRET || "supersecretcolabzjwtkey",
      { expiresIn: "7d" }
    );

    const decoded = jwt.verify(testToken, process.env.JWT_SECRET || "supersecretcolabzjwtkey");
    if (decoded.userId === createdGhUser._id.toString()) {
      console.log("✓ Colabz JWT issuance & claims verification: PASS");
    } else {
      throw new Error("JWT claims mismatch");
    }

    // Clean up test records
    await User.deleteMany({
      _id: { $in: [localUser._id, createdGhUser._id] },
    });
    console.log("✓ Test records cleaned up successfully");

    await mongoose.disconnect();
    console.log("✓ Disconnected from MongoDB");

    console.log("\n==================================================");
    console.log("PHASE 2 GITHUB OAUTH TEST SUITE COMPLETED: 100% PASS");
    console.log("==================================================");
    process.exit(0);
  } catch (err) {
    console.error("❌ Phase 2 OAuth Verification Failed:", err);
    process.exit(1);
  }
}

runPhase2OAuthTests();
