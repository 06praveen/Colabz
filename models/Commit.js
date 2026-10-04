const mongoose = require("mongoose");
const crypto = require("crypto");

const commitSchema = new mongoose.Schema(
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
    hash: {
      type: String,
      default: () => crypto.randomBytes(4).toString("hex").substring(0, 7),
      index: true,
    },
    message: {
      type: String,
      required: [true, "Commit message is required"],
      trim: true,
      minlength: [1, "Commit message cannot be empty"],
      maxlength: [500, "Commit message cannot exceed 500 characters"],
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Author is required"],
    },
    authorName: {
      type: String,
      default: "Developer",
    },
    authorInitials: {
      type: String,
      default: "DV",
    },
    parentCommit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Commit",
      default: null,
    },
    changes: [
      {
        fileId: { type: mongoose.Schema.Types.ObjectId, ref: "RepositoryFile" },
        path: { type: String, required: true },
        changeType: {
          type: String,
          enum: ["ADD", "MODIFY", "DELETE"],
          default: "MODIFY",
        },
        oldContent: { type: String, default: "" },
        newContent: { type: String, default: "" },
        additions: { type: Number, default: 0 },
        deletions: { type: Number, default: 0 },
      },
    ],
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id.toString();
        ret.projectId = ret.project ? ret.project.toString() : null;
        ret.branchId = ret.branch ? ret.branch.toString() : null;
        return ret;
      },
    },
  }
);

commitSchema.index({ project: 1, branch: 1, createdAt: -1 });
commitSchema.index({ project: 1, createdAt: -1 });

module.exports = mongoose.model("Commit", commitSchema);
