const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: [true, "Project reference is required"],
      index: true,
    },
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Activity actor is required"],
    },
    type: {
      type: String,
      required: [true, "Activity type is required"],
      enum: [
        "PROJECT_CREATED",
        "MEMBER_JOINED",
        "MEMBER_LEFT",
        "MEMBER_REMOVED",
        "TASK_CREATED",
        "TASK_UPDATED",
        "TASK_STATUS_CHANGED",
        "TASK_ASSIGNED",
        "TASK_COMPLETED",
        "ISSUE_CREATED",
        "ISSUE_UPDATED",
        "ISSUE_STATUS_CHANGED",
        "ISSUE_ASSIGNED",
        "ISSUE_COMMENTED",
        "FILE_CREATED",
        "FILE_UPDATED",
        "FILE_DELETED",
        "BRANCH_CREATED",
        "BRANCH_DELETED",
        "COMMIT_CREATED",
        "MESSAGE_SENT",
      ],
      index: true,
    },
    entityType: {
      type: String,
      enum: [
        "PROJECT",
        "MEMBER",
        "TASK",
        "ISSUE",
        "REPOSITORY",
        "BRANCH",
        "MESSAGE",
      ],
      required: true,
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    title: {
      type: String,
      trim: true,
      default: "",
    },
    message: {
      type: String,
      required: [true, "Activity message is required"],
      trim: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

// Compound index for querying project activities chronologically
activitySchema.index({ project: 1, createdAt: -1 });

module.exports = mongoose.model("Activity", activitySchema);
