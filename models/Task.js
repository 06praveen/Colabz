const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: [true, "Project is required"],
      index: true,
    },
    identifier: {
      type: String,
      trim: true,
      index: true,
    },
    sequenceNumber: {
      type: Number,
      default: 1,
    },
    title: {
      type: String,
      required: [true, "Task title is required"],
      trim: true,
      maxlength: [200, "Task title cannot exceed 200 characters"],
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    status: {
      type: String,
      default: "TODO",
      trim: true,
    },
    priority: {
      type: String,
      default: "Medium",
      trim: true,
    },
    assignee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    assigneeInfo: {
      name: { type: String, default: "" },
      initials: { type: String, default: "" },
      role: { type: String, default: "" },
    },
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Task reporter is required"],
      index: true,
    },
    labels: {
      type: [String],
      default: ["Frontend"],
    },
    dueDate: {
      type: String,
      default: null,
    },
    order: {
      type: Number,
      default: 0,
      index: true,
    },
    activity: [
      {
        id: { type: String },
        user: { type: String, required: true },
        action: { type: String, required: true },
        time: { type: String, default: "Just now" },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id.toString();
        ret.projectId = ret.project ? ret.project.toString() : null;
        return ret;
      },
    },
  }
);

// Helpful Compound Indexes
taskSchema.index({ project: 1, status: 1 });
taskSchema.index({ project: 1, assignee: 1 });
taskSchema.index({ project: 1, priority: 1 });
taskSchema.index({ project: 1, order: 1 });

module.exports = mongoose.model("Task", taskSchema);
