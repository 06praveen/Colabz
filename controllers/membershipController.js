const mongoose = require("mongoose");
const Project = require("../models/Project");
const ProjectMembership = require("../models/ProjectMembership");
const User = require("../models/User");
const { sendSuccess, sendError } = require("../utils/apiResponse");
const { createActivity } = require("../services/activityService");
const { createNotification } = require("../services/notificationService");

/**
 * Format member record for client response
 */
const formatMemberRecord = (membership) => {
  const u = membership.user || {};
  const name = u.name || "Member";
  const email = u.email || "";
  const username = u.username || (email ? email.split("@")[0] : name.toLowerCase().replace(/\s+/g, "."));

  return {
    id: u._id ? u._id.toString() : membership._id.toString(),
    _id: u._id ? u._id.toString() : membership._id.toString(),
    membershipId: membership._id.toString(),
    userId: u._id ? u._id.toString() : null,
    name,
    username,
    email,
    role: (membership.role || "DEVELOPER").toLowerCase(),
    status: (membership.status || "ACTIVE").toLowerCase(),
    avatar: u.avatar || null,
    avatarColor: u.avatarColor || "#00E5A3",
    initials: name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase(),
    joinedAt: membership.joinedAt
      ? new Date(membership.joinedAt).toLocaleDateString(undefined, {
          month: "long",
          year: "numeric",
        })
      : "Recently",
    bio: u.bio || "",
    skills: u.skills || [],
    isOnline: u.isOnline || false,
    lastSeen: u.lastSeen || new Date(),
    contributions: {
      commits: 0,
      tasksCompleted: 0,
      issuesResolved: 0,
    },
    activities: [],
  };
};

/**
 * List all members of a project
 * Route: GET /api/projects/:projectId/members
 */
const getProjectMembers = async (req, res, next) => {
  try {
    const project = req.project;

    const memberships = await ProjectMembership.find({
      project: project._id,
      status: "ACTIVE",
    })
      .populate("user", "name username email avatar avatarColor bio skills isOnline lastSeen")
      .sort({ createdAt: 1 });

    const formatted = memberships
      .filter((m) => m.user) // exclude deleted users
      .map(formatMemberRecord);

    return sendSuccess(res, { members: formatted });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current user's membership details in project
 * Route: GET /api/projects/:projectId/members/me
 */
const getMyMembership = async (req, res, next) => {
  try {
    const membership = req.membership;

    return sendSuccess(res, {
      membership: {
        id: membership._id.toString(),
        role: (membership.role || "DEVELOPER").toUpperCase(),
        status: (membership.status || "ACTIVE").toUpperCase(),
        joinedAt: membership.joinedAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Change member role
 * Route: PATCH /api/projects/:projectId/members/:userId
 */
const updateMemberRole = async (req, res, next) => {
  try {
    const project = req.project;
    const requesterMembership = req.membership;
    const targetUserId = req.params.userId;
    const { role } = req.body;

    // Only OWNER can change member roles
    if (requesterMembership.role.toUpperCase() !== "OWNER") {
      return sendError(
        res,
        "Permission denied: only the project owner can change member roles",
        403
      );
    }

    if (!role) {
      return sendError(res, "Role is required", 400);
    }

    const normalizedRole = role.toUpperCase();
    const validRoles = ["ADMIN", "DEVELOPER", "DESIGNER", "VIEWER"];

    if (!validRoles.includes(normalizedRole)) {
      return sendError(
        res,
        `Invalid role. Allowed roles: ${validRoles.join(", ")}`,
        400
      );
    }

    const targetQuery = {
      project: project._id,
      status: "ACTIVE",
      $or: [
        { user: mongoose.Types.ObjectId.isValid(targetUserId) ? targetUserId : null },
        { _id: mongoose.Types.ObjectId.isValid(targetUserId) ? targetUserId : null },
      ],
    };

    const targetMembership = await ProjectMembership.findOne(targetQuery).populate(
      "user",
      "name email avatar avatarColor"
    );

    if (!targetMembership) {
      return sendError(res, "Target project member not found", 404);
    }

    // Protect OWNER
    if (targetMembership.role.toUpperCase() === "OWNER") {
      return sendError(
        res,
        "Project owner role cannot be changed through this endpoint",
        400
      );
    }

    targetMembership.role = normalizedRole;
    await targetMembership.save();

    return sendSuccess(
      res,
      { member: formatMemberRecord(targetMembership) },
      200,
      `Role updated to ${normalizedRole}`
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Remove a member from the project
 * Route: DELETE /api/projects/:projectId/members/:userId
 */
const removeMember = async (req, res, next) => {
  try {
    const project = req.project;
    const requesterMembership = req.membership;
    const targetUserId = req.params.userId;
    const requesterRole = requesterMembership.role.toUpperCase();

    const targetQuery = {
      project: project._id,
      status: "ACTIVE",
      $or: [
        { user: mongoose.Types.ObjectId.isValid(targetUserId) ? targetUserId : null },
        { _id: mongoose.Types.ObjectId.isValid(targetUserId) ? targetUserId : null },
      ],
    };

    const targetMembership = await ProjectMembership.findOne(targetQuery);

    if (!targetMembership) {
      return sendError(res, "Member not found in project", 404);
    }

    const targetRole = targetMembership.role.toUpperCase();

    // Cannot remove owner
    if (targetRole === "OWNER") {
      return sendError(res, "Project owner cannot be removed from project", 400);
    }

    // Role check: OWNER can remove anyone. ADMIN can only remove DEVELOPER, DESIGNER, VIEWER.
    if (requesterRole !== "OWNER" && requesterRole !== "ADMIN") {
      return sendError(
        res,
        "Permission denied: you must be an owner or admin to remove members",
        403
      );
    }

    if (requesterRole === "ADMIN" && (targetRole === "ADMIN" || targetRole === "OWNER")) {
      return sendError(
        res,
        "Permission denied: admins cannot remove other admins or the project owner",
        403
      );
    }

    // Delete membership and pull from project members array
    await Promise.all([
      ProjectMembership.deleteOne({ _id: targetMembership._id }),
      Project.updateOne(
        { _id: project._id },
        { $pull: { members: targetMembership.user } }
      ),
    ]);

    await createActivity({
      project: project._id,
      actor: req.user._id,
      type: "MEMBER_REMOVED",
      entityType: "MEMBER",
      entityId: targetMembership._id,
      title: "Member removed",
      message: `${req.user.name || "An admin"} removed a member from the project`,
    });

    if (targetMembership.user && targetMembership.user.toString() !== req.user._id.toString()) {
      await createNotification({
        recipient: targetMembership.user,
        actor: req.user._id,
        project: project._id,
        type: "PROJECT_MEMBER_REMOVED",
        title: "Removed from project",
        message: `You were removed from project ${project.name}`,
        entityType: "PROJECT",
        entityId: project._id,
      });
    }

    return sendSuccess(res, null, 200, "Member removed from project successfully");
  } catch (error) {
    next(error);
  }
};

/**
 * Leave project
 * Route: POST /api/projects/:projectId/leave
 */
const leaveProject = async (req, res, next) => {
  try {
    const project = req.project;
    const requesterMembership = req.membership;

    if (requesterMembership.role.toUpperCase() === "OWNER") {
      return sendError(
        res,
        "Project owner cannot leave the project. Please transfer ownership or delete the project.",
        400
      );
    }

    await Promise.all([
      ProjectMembership.deleteOne({ _id: requesterMembership._id }),
      Project.updateOne(
        { _id: project._id },
        { $pull: { members: req.user._id } }
      ),
    ]);

    await createActivity({
      project: project._id,
      actor: req.user._id,
      type: "MEMBER_LEFT",
      entityType: "MEMBER",
      entityId: requesterMembership._id,
      title: "Member left",
      message: `${req.user.name || "A member"} left the project`,
    });

    return sendSuccess(res, null, 200, "You have left the project successfully");
  } catch (error) {
    next(error);
  }
};

/**
 * Add a member directly to project (Owner / Admin only)
 * Route: POST /api/projects/:projectId/members
 */
const addProjectMember = async (req, res, next) => {
  try {
    const project = req.project;
    const requesterMembership = req.membership;
    const requesterRole = requesterMembership.role.toUpperCase();

    if (requesterRole !== "OWNER" && requesterRole !== "ADMIN") {
      return sendError(
        res,
        "Permission denied: you must be an owner or admin to add members",
        403
      );
    }

    const { userId, username, email, role } = req.body;
    let targetUser = null;

    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
      targetUser = await User.findById(userId);
    } else if (username) {
      const cleanUsername = username.trim().toLowerCase().replace(/^@/, "");
      targetUser = await User.findOne({
        $or: [{ username: cleanUsername }, { email: cleanUsername }],
      });
    } else if (email) {
      targetUser = await User.findOne({ email: email.trim().toLowerCase() });
    }

    if (!targetUser) {
      return sendError(res, "User not found", 404);
    }

    if (project.owner.toString() === targetUser._id.toString()) {
      return sendError(res, "User is already the owner of this project", 409);
    }

    const existingMember = await ProjectMembership.findOne({
      project: project._id,
      user: targetUser._id,
      status: "ACTIVE",
    });

    if (existingMember) {
      return sendError(res, "User is already a member of this project", 409);
    }

    const normalizedRole = (role || "DEVELOPER").toUpperCase();
    const validRoles = ["ADMIN", "DEVELOPER", "DESIGNER", "VIEWER"];
    if (!validRoles.includes(normalizedRole)) {
      return sendError(
        res,
        `Invalid role. Allowed roles: ${validRoles.join(", ")}`,
        400
      );
    }

    const membership = await ProjectMembership.findOneAndUpdate(
      { project: project._id, user: targetUser._id },
      {
        project: project._id,
        user: targetUser._id,
        role: normalizedRole,
        status: "ACTIVE",
        invitedBy: req.user._id,
        joinedAt: new Date(),
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).populate("user", "name username email avatar avatarColor bio skills isOnline lastSeen");

    await Project.updateOne(
      { _id: project._id },
      { $addToSet: { members: targetUser._id } }
    );

    // Delete any pending invitations for this user/email
    const ProjectInvitation = require("../models/ProjectInvitation");
    await ProjectInvitation.deleteMany({
      project: project._id,
      $or: [{ email: targetUser.email }, { invitedUser: targetUser._id }],
    });

    await createActivity({
      project: project._id,
      actor: req.user._id,
      type: "MEMBER_JOINED",
      entityType: "MEMBER",
      entityId: membership._id,
      title: "Member added",
      message: `${req.user.name || "Admin"} added @${targetUser.username || targetUser.name} as ${normalizedRole}`,
    });

    await createNotification({
      recipient: targetUser._id,
      actor: req.user._id,
      project: project._id,
      type: "PROJECT_MEMBER_ADDED",
      title: "Added to project",
      message: `You were added to project ${project.name} as ${normalizedRole}`,
      entityType: "PROJECT",
      entityId: project._id,
    });

    return sendSuccess(
      res,
      { member: formatMemberRecord(membership) },
      201,
      "Member added to project successfully"
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProjectMembers,
  getMyMembership,
  addProjectMember,
  updateMemberRole,
  removeMember,
  leaveProject,
};
