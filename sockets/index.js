const { Server } = require("socket.io");
const socketAuth = require("./socketAuth");
const { setIO, getIO } = require("./ioStore");
const { registerChatSocket } = require("./chatSocket");
const { registerCallSocket } = require("./callSocket");

const initSocket = (server) => {
  const allowedOrigin = process.env.CLIENT_URL || "http://localhost:5173";

  const io = new Server(server, {
    cors: {
      origin: allowedOrigin,
      methods: ["GET", "POST", "PATCH", "DELETE"],
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  setIO(io);

  // Strict JWT Authentication Middleware for Socket.IO
  io.use(socketAuth);

  io.on("connection", (socket) => {
    // Automatically join recipient's user room for direct notifications
    if (socket.user) {
      const userId = socket.user.id || (socket.user._id ? socket.user._id.toString() : null);
      if (userId) {
        socket.join(`user:${userId}`);
      }
    }

    // Register Chat events
    registerChatSocket(io, socket);

    // Register Call & WebRTC signaling events
    registerCallSocket(io, socket);

    // Legacy / Repository event compatibility
    socket.on("join-repo", (repoId) => {
      if (!repoId) return;
      socket.join(repoId);
      socket.emit("joined-repo", repoId);
    });

    socket.on("typing", ({ repoId, userName }) => {
      if (!repoId) return;
      socket.to(repoId).emit("typing", { userName: userName || socket.user?.name });
    });

    socket.on("send-message", ({ repoId, message }) => {
      if (!repoId || !message) return;
      io.to(repoId).emit("new-message", message);
    });

    socket.on("disconnect", () => {});
  });

  return io;
};

module.exports = { initSocket, getIO };
