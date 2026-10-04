const mongoose = require("mongoose");

const repositoryFileSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: [true, "Project reference is required"],
      index: true,
    },
    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      required: [true, "Branch reference is required"],
      index: true,
    },
    name: {
      type: String,
      required: [true, "File/folder name is required"],
      trim: true,
    },
    path: {
      type: String,
      required: [true, "Path is required"],
      trim: true,
    },
    type: {
      type: String,
      enum: ["FILE", "FOLDER"],
      default: "FILE",
    },
    content: {
      type: String,
      default: "",
    },
    language: {
      type: String,
      default: "text",
      trim: true,
    },
    size: {
      type: Number,
      default: 0,
    },
    lastCommitMessage: {
      type: String,
      default: "initial commit",
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id.toString();
        ret.projectId = ret.project ? ret.project.toString() : null;
        ret.branchId = ret.branch ? ret.branch.toString() : null;
        ret.isFolder = ret.type === "FOLDER";
        ret.commitMessage = ret.lastCommitMessage || "updated";
        return ret;
      },
    },
  }
);

// Prevent duplicate paths within the same project and branch
repositoryFileSchema.index({ project: 1, branch: 1, path: 1 }, { unique: true });
repositoryFileSchema.index({ project: 1, branch: 1, type: 1 });

module.exports = mongoose.model("RepositoryFile", repositoryFileSchema);
