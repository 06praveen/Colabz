const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: [true, "Project reference is required"],
      index: true,
    },
    type: {
      type: String,
      enum: ["direct", "channel"],
      default: "direct",
    },
    name: {
      type: String,
      trim: true,
      default: "",
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        index: true,
      },
    ],
    // Deterministic sorted participant key for direct conversations e.g. "userId1_userId2"
    participantKey: {
      type: String,
      index: true,
      default: null,
    },
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      default: null,
    },
    lastMessageContent: {
      type: String,
      default: "Conversation created",
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

// Indexes to prevent duplicate direct conversations and duplicate channel names in a project
conversationSchema.index(
  { project: 1, participantKey: 1 },
  { unique: true, partialFilterExpression: { participantKey: { $type: "string" } } }
);

conversationSchema.index(
  { project: 1, name: 1, type: 1 },
  { unique: true, partialFilterExpression: { type: "channel" } }
);

module.exports = mongoose.model("Conversation", conversationSchema);
