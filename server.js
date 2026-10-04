const express = require("express");
const http = require("http");
const cors = require("cors");
const helmet = require("helmet");
const mongoose = require("mongoose");

// Validate and load environment variables
const env = require("./config/env");
const connectDB = require("./config/db");
const { initSocket } = require("./sockets");
const notFoundMiddleware = require("./middleware/notFoundMiddleware");
const errorMiddleware = require("./middleware/errorMiddleware");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const projectRoutes = require("./routes/projectRoutes");
const messageRoutes = require("./routes/messageRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const aiRoutes = require("./routes/aiRoutes");
const { userInvitationRouter } = require("./routes/invitationRoutes");

const app = express();
const server = http.createServer(app);
const PORT = env.PORT || 5000;
const CLIENT_URL = env.CLIENT_URL || "http://localhost:5173";

// Connect to MongoDB
connectDB();

// Security Headers with Helmet
app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: false, // Allows Vite client scripts in development
  })
);

// CORS Setup
app.use(
  cors({
    origin: CLIENT_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Body Parsers with Safe Size Limits
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));

// Health Check Endpoint
app.get("/api/health", (req, res) => {
  const dbStatusMap = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting",
  };
  const dbStatus = dbStatusMap[mongoose.connection.readyState] || "unknown";

  res.status(200).json({
    success: true,
    message: "Colabz API is healthy and running",
    data: {
      status: "ok",
      database: dbStatus,
      environment: env.NODE_ENV,
      timestamp: new Date().toISOString(),
    },
  });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/repos", projectRoutes);
app.use("/api/invitations", userInvitationRouter);
app.use("/api/messages", messageRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/ai", aiRoutes);

// Error Handling Middlewares
app.use(notFoundMiddleware);
app.use(errorMiddleware);

// Initialize Socket.IO
const io = initSocket(server);

// Graceful Shutdown Handling
const handleGracefulShutdown = async (signal) => {
  console.log(`\n[${signal}] Received signal. Gracefully closing Colabz server...`);
  try {
    if (io) {
      console.log("Closing Socket.IO connections...");
      io.close();
    }
    server.close(() => {
      console.log("HTTP server closed.");
    });
    if (mongoose.connection.readyState === 1) {
      console.log("Closing MongoDB connection...");
      await mongoose.connection.close();
      console.log("MongoDB connection closed.");
    }
    process.exit(0);
  } catch (err) {
    console.error("Error during graceful shutdown:", err);
    process.exit(1);
  }
};

process.on("SIGINT", () => handleGracefulShutdown("SIGINT"));
process.on("SIGTERM", () => handleGracefulShutdown("SIGTERM"));

// Start HTTP Server when executed directly
if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`Colabz server running in ${env.NODE_ENV} mode on port ${PORT}`);
  });
}

module.exports = { app, server, io };
