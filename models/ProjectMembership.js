const mongoose = require("mongoose");

const projectMembershipSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: [true, "Project reference is required"],
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User reference is required"],
      index: true,
    },
    role: {
      type: String,
      enum: ["OWNER", "ADMIN", "DEVELOPER", "DESIGNER", "VIEWER"],
      default: "DEVELOPER",
      uppercase: true,
    },
    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE"],
      default: "ACTIVE",
      uppercase: true,
    },
    invitedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id.toString();
        return ret;
      },
    },
  }
);

// Compound unique index to prevent duplicate project memberships
projectMembershipSchema.index({ project: 1, user: 1 }, { unique: true });
projectMembershipSchema.index({ user: 1, status: 1 });

module.exports = mongoose.model("ProjectMembership", projectMembershipSchema);
