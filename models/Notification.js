const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Notification recipient is required"],
      index: true,
    },
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Notification actor is required"],
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      default: null,
      index: true,
    },
    type: {
      type: String,
      required: [true, "Notification type is required"],
      enum: [
        "TASK_ASSIGNED",
        "TASK_UPDATED",
        "TASK_COMPLETED",
        "ISSUE_ASSIGNED",
        "ISSUE_UPDATED",
        "ISSUE_COMMENTED",
        "PROJECT_INVITATION",
        "PROJECT_INVITATION_ACCEPTED",
        "PROJECT_MEMBER_ADDED",
        "PROJECT_MEMBER_REMOVED",
        "REPOSITORY_COMMIT",
        "BRANCH_CREATED",
        "CHAT_MESSAGE",
        "SYSTEM_ALERT",
      ],
      index: true,
    },
    title: {
      type: String,
      required: [true, "Notification title is required"],
      trim: true,
    },
    message: {
      type: String,
      required: [true, "Notification message is required"],
      trim: true,
    },
    entityType: {
      type: String,
      enum: [
        "TASK",
        "ISSUE",
        "PROJECT",
        "INVITATION",
        "MEMBER",
        "REPOSITORY",
        "BRANCH",
        "MESSAGE",
        "SYSTEM",
      ],
      default: "SYSTEM",
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    readAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Compound indexes for fast lookups
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, isRead: 1 });
notificationSchema.index({ project: 1, createdAt: -1 });

module.exports = mongoose.model("Notification", notificationSchema);
