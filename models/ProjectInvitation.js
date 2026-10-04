const mongoose = require("mongoose");

const projectInvitationSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: [true, "Project reference is required"],
      index: true,
    },
    email: {
      type: String,
      required: [true, "Invited email is required"],
      lowercase: true,
      trim: true,
    },
    invitedUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    invitedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "InvitedBy user is required"],
    },
    role: {
      type: String,
      enum: ["ADMIN", "DEVELOPER", "DESIGNER", "VIEWER"],
      default: "DEVELOPER",
      uppercase: true,
    },
    token: {
      type: String,
      required: true,
      unique: true,
    },
    status: {
      type: String,
      enum: ["PENDING", "ACCEPTED", "DECLINED", "EXPIRED", "CANCELLED"],
      default: "PENDING",
      uppercase: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    acceptedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id.toString();
        delete ret.token; // do not expose token in general queries
        return ret;
      },
    },
  }
);

// Indexes
projectInvitationSchema.index({ project: 1, email: 1, status: 1 });
projectInvitationSchema.index({ expiresAt: 1 });

module.exports = mongoose.model("ProjectInvitation", projectInvitationSchema);
