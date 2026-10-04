const mongoose = require("mongoose");
const messageService = require("../services/messageService");
const conversationService = require("../services/conversationService");
const ProjectMembership = require("../models/ProjectMembership");
const Conversation = require("../models/Conversation");

/**
 * Register chat socket events
 */
const registerChatSocket = (io, socket) => {
  const user = socket.user;
  if (!user) return;

  // Auto-join user-specific room for direct notifications if needed
  socket.join(`user:${user.id}`);

  /**
   * Helper to verify project membership
   */
  const verifyMembership = async (projectId) => {
    if (!projectId || !mongoose.Types.ObjectId.isValid(projectId)) {
      const err = new Error("Valid project ID is required");
      err.code = "INVALID_PROJECT";
      throw err;
    }
    const membership = await ProjectMembership.findOne({
      project: projectId,
      user: user._id,
    });
    if (!membership) {
      const err = new Error("You are not an active member of this project");
      err.code = "FORBIDDEN";
      throw err;
    }
    return membership;
  };

  /**
   * Join a conversation room
   * Event: conversation:join
   */
  socket.on("conversation:join", async (data = {}, callback) => {
    try {
      const { projectId, conversationId } = data;
      if (!conversationId) {
        throw new Error("Conversation ID is required");
      }

      // If projectId is provided, verify membership
      if (projectId) {
        await verifyMembership(projectId);
      }

      // Verify conversation exists and user has access
      const conv = await Conversation.findById(conversationId);
      if (!conv) {
        const err = new Error("Conversation not found");
        err.code = "NOT_FOUND";
        throw err;
      }

      if (conv.type === "direct") {
        const isParticipant = (conv.participants || []).some(
          (p) => (p._id ? p._id.toString() : p.toString()) === user.id
        );
        if (!isParticipant) {
          const err = new Error("You are not a participant in this conversation");
          err.code = "FORBIDDEN";
          throw err;
        }
      }

      const roomName = `conversation:${conversationId}`;
      socket.join(roomName);

      if (typeof callback === "function") {
        callback({ success: true, room: roomName });
      }
      socket.emit("conversation:joined", { conversationId });
    } catch (err) {
      const errorPayload = {
        code: err.code || "CHAT_ERROR",
        message: err.message || "Failed to join conversation",
      };
      socket.emit("chat:error", errorPayload);
      if (typeof callback === "function") callback({ success: false, error: errorPayload });
    }
  });

  /**
   * Leave a conversation room
   * Event: conversation:leave
   */
  socket.on("conversation:leave", (data = {}, callback) => {
    const { conversationId } = data;
    if (conversationId) {
      socket.leave(`conversation:${conversationId}`);
      socket.emit("conversation:left", { conversationId });
      if (typeof callback === "function") callback({ success: true });
    }
  });

  /**
   * Send a new message through socket
   * Event: message:send
   */
  socket.on("message:send", async (data = {}, callback) => {
    try {
      const { projectId, conversationId, content, replyTo, attachments, clientMessageId } = data;

      if (!conversationId) {
        throw new Error("Conversation ID is required");
      }

      const conv = await Conversation.findById(conversationId);
      if (!conv) {
        const err = new Error("Conversation not found");
        err.code = "NOT_FOUND";
        throw err;
      }

      const effectiveProjectId = projectId || conv.project;
      await verifyMembership(effectiveProjectId);

      const savedMessage = await messageService.sendMessage(effectiveProjectId, conversationId, user, {
        content,
        replyTo,
        attachments,
      });

      // Broadcast to everyone in the conversation room
      io.to(`conversation:${conversationId}`).emit("message:new", {
        message: savedMessage,
        clientMessageId,
        conversationId,
      });

      if (typeof callback === "function") {
        callback({ success: true, message: savedMessage });
      }
    } catch (err) {
      const errorPayload = {
        code: err.code || "SEND_ERROR",
        message: err.message || "Failed to send message",
      };
      socket.emit("chat:error", errorPayload);
      if (typeof callback === "function") callback({ success: false, error: errorPayload });
    }
  });

  /**
   * Edit message through socket
   * Event: message:edit
   */
  socket.on("message:edit", async (data = {}, callback) => {
    try {
      const { projectId, conversationId, messageId, content } = data;

      if (!conversationId || !messageId) {
        throw new Error("Conversation ID and Message ID are required");
      }

      const conv = await Conversation.findById(conversationId);
      const effectiveProjectId = projectId || conv?.project;
      if (effectiveProjectId) {
        await verifyMembership(effectiveProjectId);
      }

      const updatedMessage = await messageService.editMessage(
        effectiveProjectId,
        conversationId,
        messageId,
        user,
        content
      );

      io.to(`conversation:${conversationId}`).emit("message:updated", {
        message: updatedMessage,
        conversationId,
      });

      if (typeof callback === "function") {
        callback({ success: true, message: updatedMessage });
      }
    } catch (err) {
      const errorPayload = {
        code: err.code || "EDIT_ERROR",
        message: err.message || "Failed to edit message",
      };
      socket.emit("chat:error", errorPayload);
      if (typeof callback === "function") callback({ success: false, error: errorPayload });
    }
  });

  /**
   * Delete message through socket
   * Event: message:delete
   */
  socket.on("message:delete", async (data = {}, callback) => {
    try {
      const { projectId, conversationId, messageId } = data;

      if (!conversationId || !messageId) {
        throw new Error("Conversation ID and Message ID are required");
      }

      const conv = await Conversation.findById(conversationId);
      const effectiveProjectId = projectId || conv?.project;
      let userRole = "DEVELOPER";
      if (effectiveProjectId) {
        const mem = await verifyMembership(effectiveProjectId);
        userRole = mem.role;
      }

      const deletedMessage = await messageService.deleteMessage(
        effectiveProjectId,
        conversationId,
        messageId,
        user,
        userRole
      );

      io.to(`conversation:${conversationId}`).emit("message:deleted", {
        message: deletedMessage,
        messageId,
        conversationId,
      });

      if (typeof callback === "function") {
        callback({ success: true, message: deletedMessage });
      }
    } catch (err) {
      const errorPayload = {
        code: err.code || "DELETE_ERROR",
        message: err.message || "Failed to delete message",
      };
      socket.emit("chat:error", errorPayload);
      if (typeof callback === "function") callback({ success: false, error: errorPayload });
    }
  });

  /**
   * Mark message as read
   * Event: message:read
   */
  socket.on("message:read", async (data = {}, callback) => {
    try {
      const { projectId, conversationId, messageId } = data;
      if (!conversationId || !messageId) return;

      const conv = await Conversation.findById(conversationId);
      const effectiveProjectId = projectId || conv?.project;

      await messageService.markMessageAsRead(effectiveProjectId, conversationId, messageId, user);

      io.to(`conversation:${conversationId}`).emit("message:read-updated", {
        conversationId,
        messageId,
        userId: user.id,
      });

      if (typeof callback === "function") callback({ success: true });
    } catch (err) {
      // Non-critical background read event
    }
  });

  /**
   * Toggle reaction
   * Event: message:react
   */
  socket.on("message:react", async (data = {}, callback) => {
    try {
      const { projectId, conversationId, messageId, emoji } = data;
      if (!conversationId || !messageId || !emoji) return;

      const conv = await Conversation.findById(conversationId);
      const effectiveProjectId = projectId || conv?.project;
      if (effectiveProjectId) {
        await verifyMembership(effectiveProjectId);
      }

      const updatedMessage = await messageService.toggleReaction(
        effectiveProjectId,
        conversationId,
        messageId,
        user,
        emoji
      );

      io.to(`conversation:${conversationId}`).emit("message:reaction-updated", {
        message: updatedMessage,
        conversationId,
      });

      if (typeof callback === "function") callback({ success: true, message: updatedMessage });
    } catch (err) {
      const errorPayload = {
        code: err.code || "REACTION_ERROR",
        message: err.message || "Failed to toggle reaction",
      };
      socket.emit("chat:error", errorPayload);
      if (typeof callback === "function") callback({ success: false, error: errorPayload });
    }
  });
};

module.exports = { registerChatSocket };
