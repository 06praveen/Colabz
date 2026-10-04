const mongoose = require("mongoose");

const branchSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: [true, "Project reference is required"],
      index: true,
    },
    name: {
      type: String,
      required: [true, "Branch name is required"],
      trim: true,
      minlength: [1, "Branch name must not be empty"],
      maxlength: [100, "Branch name cannot exceed 100 characters"],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    headCommit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Commit",
      default: null,
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

// Enforce unique branch names per project
branchSchema.index({ project: 1, name: 1 }, { unique: true });

module.exports = mongoose.model("Branch", branchSchema);
