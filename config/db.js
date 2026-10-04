const mongoose = require("mongoose");

/**
 * Connect to MongoDB database
 */
const connectDB = async () => {
  const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/colabz";

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 4000,
    });
    console.log(`MongoDB connected successfully: ${conn.connection.host}/${conn.connection.name}`);
    
    // Automatically backfill any existing users missing usernames
    const { migrateUsernames } = require("../utils/userMigration");
    await migrateUsernames();
    
    return conn;
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    // Do not silently hide the error; notify clearly
    if (process.env.NODE_ENV === "production") {
      process.exit(1);
    }
  }
};

module.exports = connectDB;
