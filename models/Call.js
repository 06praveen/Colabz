const mongoose = require("mongoose");

const callSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: [true, "Project is required for a call"],
      index: true,
    },
    caller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Caller is required"],
      index: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Receiver is required"],
      index: true,
    },
    title: {
      type: String,
      trim: true,
      default: "1-on-1 Call",
    },
    type: {
      type: String,
      enum: ["AUDIO", "VIDEO"],
      default: "VIDEO",
      required: true,
    },
    status: {
      type: String,
      enum: [
        "RINGING",
        "ONGOING",
        "COMPLETED",
        "MISSED",
        "DECLINED",
        "FAILED",
        "CANCELLED",
      ],
      default: "RINGING",
      required: true,
      index: true,
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    answeredAt: {
      type: Date,
      default: null,
    },
    endedAt: {
      type: Date,
      default: null,
    },
    duration: {
      type: Number, // duration in seconds
      default: 0,
    },
    endReason: {
      type: String,
      enum: ["NORMAL", "DECLINED", "CANCELLED", "MISSED", "FAILED", "TIMEOUT"],
      default: "NORMAL",
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Compound indexes for fast lookups
callSchema.index({ project: 1, createdAt: -1 });
callSchema.index({ caller: 1, createdAt: -1 });
callSchema.index({ receiver: 1, createdAt: -1 });
callSchema.index({ caller: 1, receiver: 1, status: 1 });

module.exports = mongoose.model("Call", callSchema);
