const mongoose = require("mongoose");

const issueCommentSchema = new mongoose.Schema(
  {
    issue: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Issue",
      required: [true, "Issue is required"],
      index: true,
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: [true, "Project is required"],
      index: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Comment author is required"],
      index: true,
    },
    authorName: {
      type: String,
      default: "User",
    },
    authorInitials: {
      type: String,
      default: "US",
    },
    content: {
      type: String,
      required: [true, "Comment content cannot be empty"],
      trim: true,
      maxlength: [5000, "Comment cannot exceed 5000 characters"],
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id.toString();
        ret.text = ret.content;
        ret.author = ret.authorName || "User";
        ret.initials = ret.authorInitials || "US";
        return ret;
      },
    },
  }
);

issueCommentSchema.index({ issue: 1, createdAt: 1 });

module.exports = mongoose.model("IssueComment", issueCommentSchema);
