const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Project name is required"],
      trim: true,
      minlength: [2, "Project name must be at least 2 characters"],
      maxlength: [100, "Project name cannot exceed 100 characters"],
    },
    displayName: {
      type: String,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Project owner is required"],
      index: true,
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        index: true,
      },
    ],
    visibility: {
      type: String,
      enum: ["public", "private", "PUBLIC", "PRIVATE"],
      default: "private",
    },
    language: {
      type: String,
      default: "JavaScript",
      trim: true,
    },
    technologies: {
      type: [String],
      default: ["React", "Node.js", "MongoDB"],
    },
    avatarColor: {
      type: String,
      default: "#00E5A3",
    },
    accent: {
      type: String,
      default: "#00E5A3",
    },
    status: {
      type: String,
      enum: ["Active", "Maintenance", "Archived"],
      default: "Active",
    },
    stars: {
      type: Number,
      default: 0,
    },
    defaultBranch: {
      type: String,
      default: "main",
      trim: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id.toString();
        ret.projectId = ret._id.toString();
        ret.techStack = ret.technologies || [];
        ret.branch = ret.defaultBranch || "main";
        return ret;
      },
    },
  }
);

// Helpful compound indexes
projectSchema.index({ owner: 1, updatedAt: -1 });
projectSchema.index({ members: 1, updatedAt: -1 });

module.exports = mongoose.model("Project", projectSchema);
