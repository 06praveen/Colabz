const dotenv = require("dotenv");

// Load .env variables
dotenv.config();

/**
 * Validates and sanitizes environment variables at server startup.
 */
function validateEnv() {
  const nodeEnv = process.env.NODE_ENV || "development";
  const isProduction = nodeEnv === "production";

  const requiredVars = ["MONGO_URI", "JWT_SECRET"];
  const missingVars = [];

  for (const varName of requiredVars) {
    if (!process.env[varName] || process.env[varName].trim() === "") {
      missingVars.push(varName);
    }
  }

  if (missingVars.length > 0) {
    const errorMsg = `[STARTUP ERROR] Missing required environment variables: ${missingVars.join(", ")}`;
    if (isProduction) {
      console.error(errorMsg);
      process.exit(1);
    } else {
      console.warn(`[DEVELOPMENT WARNING] ${errorMsg}`);
      // In development, provide safe fallbacks if missing
      if (!process.env.JWT_SECRET) {
        process.env.JWT_SECRET = "dev_secret_colabz_jwt_key_2026";
      }
      if (!process.env.MONGO_URI) {
        process.env.MONGO_URI = "mongodb://127.0.0.1:27017/colabz";
      }
    }
  }

  return {
    PORT: parseInt(process.env.PORT || "5000", 10),
    NODE_ENV: nodeEnv,
    MONGO_URI: process.env.MONGO_URI,
    JWT_SECRET: process.env.JWT_SECRET,
    CLIENT_URL: process.env.CLIENT_URL || "http://localhost:5173",
    GEMINI_API_KEY: process.env.GEMINI_API_KEY || "",
    GEMINI_MODEL: process.env.GEMINI_MODEL || "gemini-3.8-flash",
  };
}

const envConfig = validateEnv();

module.exports = envConfig;
