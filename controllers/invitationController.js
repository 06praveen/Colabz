const crypto = require("crypto");
const mongoose = require("mongoose");
const Project = require("../models/Project");
const ProjectMembership = require("../models/ProjectMembership");
const ProjectInvitation = require("../models/ProjectInvitation");
const User = require("../models/User");
const { sendSuccess, sendError } = require("../utils/apiResponse");
const { createActivity } = require("../services/activityService");
const { createNotification } = require("../services/notificationService");

/**
 * Format invitation for client response
 */
const formatInvitation = (inv) => {
  const inviter = inv.invitedBy || {};
  const inviterUsername = inviter.username || (inviter.email ? inviter.email.split("@")[0] : "user");
  const projectObj = inv.project || {};

  return {
    id: inv._id.toString(),
    _id: inv._id.toString(),
    projectId: projectObj._id ? projectObj._id.toString() : projectObj.toString(),
    projectName: projectObj.name || "Colabz Project",
    project: projectObj,
    email: inv.email,
    role: (inv.role || "DEVELOPER").toUpperCase(),
    status: (inv.status || "PENDING").toUpperCase(),
    invitedBy: inviter.name || "Team Owner",
    inviterUsername,
    inviter: {
      id: inviter._id ? inviter._id.toString() : null,
      name: inviter.name || "Team Owner",
      username: inviterUsername,
      avatar: inviter.avatar || null,
      avatarColor: inviter.avatarColor || "#00E5A3",
    },
    invitedAt: inv.createdAt
      ? new Date(inv.createdAt).toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
        })
      : "Recently",
    expiresAt: inv.expiresAt,
  };
};

/**
 * Send an invitation to a new project member
 * Route: POST /api/projects/:projectId/invitations
 */
const createInvitation = async (req, res, next) => {
  try {
    const project = req.project;
    const requester = req.user;
    const { email, username, emailOrUsername, role } = req.body;

    const rawInput = (username || email || emailOrUsername || "").trim();

    if (!rawInput) {
      return sendError(res, "Username or email address is required to send an invitation", 400);
    }

    let targetUser = null;
    let targetEmail = "";

    if (rawInput.includes("@")) {
      targetEmail = rawInput.toLowerCase();
      targetUser = await User.findOne({ email: targetEmail });
    } else {
      const cleanUsername = rawInput.replace(/^@/, "").toLowerCase();
      targetUser = await User.findOne({
        $or: [{ username: cleanUsername }, { name: new RegExp(`^${cleanUsername}$`, "i") }],
      });
      if (targetUser) {
        targetEmail = targetUser.email;
      } else {
        return sendError(res, `User with username '@${cleanUsername}' not found`, 404);
      }
    }

    // Check if inviting oneself
    if (targetUser && targetUser._id.toString() === requester._id.toString()) {
      return sendError(res, "You cannot invite yourself to the project", 400);
    }

    const normalizedRole = (role || "DEVELOPER").toUpperCase();
    const validRoles = ["ADMIN", "DEVELOPER", "DESIGNER", "VIEWER"];
    if (!validRoles.includes(normalizedRole)) {
      return sendError(res, `Invalid role. Allowed roles: ${validRoles.join(", ")}`, 400);
    }

    // Check if target is already project owner
    if (project.owner.toString() === targetUser?._id?.toString()) {
      return sendError(res, "This user is already the owner of this project", 409);
    }

    // Check if target is already an active member
    if (targetUser) {
      const existingMember = await ProjectMembership.findOne({
        project: project._id,
        user: targetUser._id,
        status: "ACTIVE",
      });

      if (existingMember) {
        return sendError(res, "User is already an active member of this project", 409);
      }
    }

    // Check if a PENDING invitation already exists
    const queryConditions = [{ email: targetEmail }];
    if (targetUser) {
      queryConditions.push({ invitedUser: targetUser._id });
    }

    const existingInvite = await ProjectInvitation.findOne({
      project: project._id,
      $or: queryConditions,
      status: "PENDING",
      expiresAt: { $gt: new Date() },
    });

    if (existingInvite) {
      return sendError(
        res,
        "An active pending invitation already exists for this user",
        409
      );
    }

    // Generate secure cryptographic invitation token
    const token = crypto.randomBytes(24).toString("hex");
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const invitation = await ProjectInvitation.create({
      project: project._id,
      email: targetEmail,
      invitedUser: targetUser?._id || null,
      invitedBy: requester._id,
      role: normalizedRole,
      token,
      status: "PENDING",
      expiresAt,
    });

    if (targetUser) {
      await createNotification({
        recipient: targetUser._id,
        actor: requester._id,
        project: project._id,
        type: "PROJECT_INVITATION",
        title: "Project invitation",
        message: `${requester.name || "A project admin"} invited you to join ${project.name}`,
        entityType: "PROJECT",
        entityId: project._id,
        metadata: {
          invitationId: invitation._id,
          role: normalizedRole,
        },
      });
    }

    const populatedInvite = await ProjectInvitation.findById(invitation._id)
      .populate("project", "name slug description avatarColor")
      .populate("invitedBy", "name username email avatar avatarColor");

    return sendSuccess(
      res,
      { invitation: formatInvitation(populatedInvite) },
      201,
      "Invitation sent successfully"
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get all pending invitations for a project
 * Route: GET /api/projects/:projectId/invitations
 */
const getProjectInvitations = async (req, res, next) => {
  try {
    const project = req.project;

    const invitations = await ProjectInvitation.find({
      project: project._id,
      status: "PENDING",
      expiresAt: { $gt: new Date() },
    })
      .populate("project", "name slug description avatarColor")
      .populate("invitedBy", "name username email avatar avatarColor")
      .sort({ createdAt: -1 });

    const formatted = invitations.map(formatInvitation);

    return sendSuccess(res, { invitations: formatted });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all pending invitations sent to current user
 * Route: GET /api/invitations / /api/invitations/me / /api/invitations/inbox
 */
const getMyPendingInvitations = async (req, res, next) => {
  try {
    const userEmail = (req.user.email || "").toLowerCase();
    const userId = req.user._id || req.user.id;

    const queryConditions = [{ email: userEmail }];
    if (userId) {
      queryConditions.push({ invitedUser: userId });
    }

    const invitations = await ProjectInvitation.find({
      $or: queryConditions,
      status: "PENDING",
      expiresAt: { $gt: new Date() },
    })
      .populate("project", "name slug description avatarColor language")
      .populate("invitedBy", "name username email avatar avatarColor")
      .sort({ createdAt: -1 });

    const formatted = invitations.map(formatInvitation);

    return sendSuccess(res, { invitations: formatted });
  } catch (error) {
    next(error);
  }
};

/**
 * Accept an invitation to join a project
 * Route: POST /api/invitations/:invitationId/accept
 */
const acceptInvitation = async (req, res, next) => {
  try {
    const { invitationId } = req.params;
    const userId = req.user._id || req.user.id;
    const userEmail = (req.user.email || "").toLowerCase();

    let invitation = null;
    if (mongoose.Types.ObjectId.isValid(invitationId)) {
      invitation = await ProjectInvitation.findById(invitationId);
    } else {
      invitation = await ProjectInvitation.findOne({ token: invitationId });
    }

    if (!invitation) {
      return sendError(res, "Invitation not found", 404);
    }

    if (invitation.status !== "PENDING") {
      return sendError(res, `This invitation is already ${invitation.status.toLowerCase()}`, 400);
    }

    if (new Date() > new Date(invitation.expiresAt)) {
      invitation.status = "EXPIRED";
      await invitation.save();
      return sendError(res, "This invitation has expired", 400);
    }

    // Verify invited recipient matches current user
    const matchesUser =
      (invitation.invitedUser && invitation.invitedUser.toString() === userId.toString()) ||
      invitation.email.toLowerCase() === userEmail;

    if (!matchesUser) {
      return sendError(
        res,
        "Not authorized: this invitation was sent to a different user",
        403
      );
    }

    // Upsert membership and mark status active
    const membership = await ProjectMembership.findOneAndUpdate(
      { project: invitation.project, user: userId },
      {
        project: invitation.project,
        user: userId,
        role: invitation.role,
        status: "ACTIVE",
        invitedBy: invitation.invitedBy,
        joinedAt: new Date(),
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Update project members array
    await Project.updateOne(
      { _id: invitation.project },
      { $addToSet: { members: userId } }
    );

    // Mark invitation accepted
    invitation.status = "ACCEPTED";
    invitation.acceptedAt = new Date();
    invitation.invitedUser = userId;
    await invitation.save();

    await createActivity({
      project: invitation.project,
      actor: userId,
      type: "MEMBER_JOINED",
      entityType: "MEMBER",
      entityId: membership._id,
      title: "Member joined",
      message: `${req.user.name || "A member"} joined the project as ${invitation.role}`,
      metadata: { role: invitation.role },
    });

    if (invitation.invitedBy && invitation.invitedBy.toString() !== userId.toString()) {
      await createNotification({
        recipient: invitation.invitedBy,
        actor: userId,
        project: invitation.project,
        type: "PROJECT_INVITATION_ACCEPTED",
        title: "Invitation accepted",
        message: `${req.user.name || "A user"} accepted your invitation to join the project`,
        entityType: "PROJECT",
        entityId: invitation.project,
        metadata: { role: invitation.role },
      });
    }

    return sendSuccess(
      res,
      { membership, projectId: invitation.project },
      200,
      "Invitation accepted successfully"
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Decline an invitation
 * Route: POST /api/invitations/:invitationId/decline
 */
const declineInvitation = async (req, res, next) => {
  try {
    const { invitationId } = req.params;
    const userId = req.user._id || req.user.id;
    const userEmail = (req.user.email || "").toLowerCase();

    let invitation = null;
    if (mongoose.Types.ObjectId.isValid(invitationId)) {
      invitation = await ProjectInvitation.findById(invitationId);
    } else {
      invitation = await ProjectInvitation.findOne({ token: invitationId });
    }

    if (!invitation) {
      return sendError(res, "Invitation not found", 404);
    }

    const matchesUser =
      (invitation.invitedUser && invitation.invitedUser.toString() === userId.toString()) ||
      invitation.email.toLowerCase() === userEmail;

    if (!matchesUser) {
      return sendError(
        res,
        "Not authorized: this invitation was addressed to a different user",
        403
      );
    }

    invitation.status = "DECLINED";
    await invitation.save();

    return sendSuccess(res, null, 200, "Invitation declined");
  } catch (error) {
    next(error);
  }
};

/**
 * Cancel a pending invitation (Owner/Admin only)
 * Route: DELETE /api/projects/:projectId/invitations/:invitationId
 */
const cancelInvitation = async (req, res, next) => {
  try {
    const { invitationId } = req.params;
    const project = req.project;

    const invitation = await ProjectInvitation.findOne({
      _id: invitationId,
      project: project._id,
    });

    if (!invitation) {
      return sendError(res, "Invitation not found", 404);
    }

    invitation.status = "CANCELLED";
    await invitation.save();

    return sendSuccess(res, null, 200, "Invitation cancelled successfully");
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createInvitation,
  getProjectInvitations,
  getMyPendingInvitations,
  acceptInvitation,
  declineInvitation,
  cancelInvitation,
};
