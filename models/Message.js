const mongoose = require("mongoose");

const reactionSchema = new mongoose.Schema(
  {
    emoji: {
      type: String,
      required: true,
      trim: true,
    },
    users: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { _id: false }
);

const messageSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: [true, "Project reference is required"],
      index: true,
    },
    conversation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: [true, "Conversation reference is required"],
      index: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Message sender is required"],
      index: true,
    },
    content: {
      type: String,
      required: [true, "Message content is required"],
      trim: true,
      maxlength: [5000, "Message cannot exceed 5000 characters"],
    },
    messageType: {
      type: String,
      enum: ["TEXT"],
      default: "TEXT",
    },
    replyTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      default: null,
    },
    reactions: [reactionSchema],
    edited: {
      type: Boolean,
      default: false,
    },
    editedAt: {
      type: Date,
      default: null,
    },
    deleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
    readBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    attachments: {
      type: Array,
      default: [],
    },
  },
  { timestamps: true }
);

// Compound index for querying conversation messages chronologically
messageSchema.index({ conversation: 1, createdAt: 1 });

module.exports = mongoose.model("Message", messageSchema);
