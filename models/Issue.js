const mongoose = require("mongoose");

const issueSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: [true, "Project is required"],
      index: true,
    },
    number: {
      type: Number,
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, "Issue title is required"],
      trim: true,
      maxlength: [200, "Issue title cannot exceed 200 characters"],
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    status: {
      type: String,
      default: "Open",
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
      required: [true, "Issue reporter is required"],
      index: true,
    },
    author: {
      type: String,
      default: "",
    },
    authorInitials: {
      type: String,
      default: "",
    },
    labels: {
      type: [String],
      default: ["Bug"],
    },
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
issueSchema.index({ project: 1, number: 1 });
issueSchema.index({ project: 1, status: 1 });
issueSchema.index({ project: 1, assignee: 1 });
issueSchema.index({ project: 1, priority: 1 });

module.exports = mongoose.model("Issue", issueSchema);
