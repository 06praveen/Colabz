const User = require("../models/User");

/**
 * Migration helper: backfills unique usernames for existing users in MongoDB
 */
const migrateUsernames = async () => {
  try {
    const usersWithoutUsername = await User.find({
      $or: [
        { username: { $exists: false } },
        { username: null },
        { username: "" },
      ],
    });

    if (!usersWithoutUsername || usersWithoutUsername.length === 0) {
      return;
    }

    console.log(`[Migration] Found ${usersWithoutUsername.length} user(s) without username. Backfilling...`);

    for (const user of usersWithoutUsername) {
      let base = "";
      if (user.email) {
        base = user.email.split("@")[0].toLowerCase().replace(/[^a-z0-9_]/g, "_");
      } else if (user.name) {
        base = user.name.toLowerCase().replace(/[^a-z0-9_]/g, "_");
      }

      base = base.replace(/^_+|_+$/g, "");
      if (base.length < 3) base = `user_${base}`;
      if (base.length > 25) base = base.substring(0, 25);

      let candidate = base;
      let counter = 1;

      // Ensure uniqueness
      while (await User.exists({ username: candidate, _id: { $ne: user._id } })) {
        candidate = `${base}_${counter}`;
        counter++;
      }

      user.username = candidate;
      await user.save();
      console.log(`[Migration] Assigned username '@${candidate}' to user ${user.name} (${user.email})`);
    }

    // Ensure index on username
    try {
      await User.collection.createIndex({ username: 1 }, { unique: true, sparse: true });
    } catch (idxErr) {
      // Index may already exist
    }

    console.log("[Migration] Username backfill completed successfully.");
  } catch (err) {
    console.error("[Migration] Error during username backfill:", err);
  }
};

module.exports = { migrateUsernames };
