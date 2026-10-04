const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters long"],
      maxlength: [50, "Name cannot exceed 50 characters"],
    },
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      lowercase: true,
      trim: true,
      minlength: [3, "Username must be at least 3 characters long"],
      maxlength: [30, "Username cannot exceed 30 characters"],
      match: [
        /^[a-zA-Z0-9_]{3,30}$/,
        "Username can only contain letters, numbers, and underscores",
      ],
      index: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email address",
      ],
      index: true,
    },
    password: {
      type: String,
      required: function () {
        return !this.githubId && this.authProvider !== "github";
      },
      minlength: [6, "Password must be at least 6 characters long"],
      select: false,
    },
    githubId: {
      type: String,
      sparse: true,
      unique: true,
      index: true,
    },
    authProvider: {
      type: String,
      enum: ["local", "github"],
      default: "local",
    },
    avatar: {
      type: String,
      default: "",
    },
    avatarColor: {
      type: String,
      default: "#14b8a6",
    },
    bio: {
      type: String,
      default: "",
      maxlength: [300, "Bio cannot exceed 300 characters"],
    },
    skills: {
      type: [String],
      default: [],
    },
    isOnline: {
      type: Boolean,
      default: false,
    },
    lastSeen: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret.password;
        return ret;
      },
    },
  }
);

// Hash password before saving if modified
userSchema.pre("save", async function (next) {
  if (!this.password || !this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
