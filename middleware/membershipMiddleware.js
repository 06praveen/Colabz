const mongoose = require("mongoose");
const Project = require("../models/Project");
const ProjectMembership = require("../models/ProjectMembership");
const { sendError } = require("../utils/apiResponse");

/**
 * Middleware: Verify that authenticated user is an ACTIVE member of the project
 */
const requireProjectMember = async (req, res, next) => {
  try {
    const projectId = req.params.projectId || req.params.id || req.body.projectId;
    const userId = req.user._id || req.user.id;

    if (!projectId) {
      return sendError(res, "Project ID is required", 400);
    }

    let project = null;
    if (mongoose.Types.ObjectId.isValid(projectId)) {
      project = await Project.findById(projectId);
    } else {
      project = await Project.findOne({ slug: projectId });
    }

    if (!project) {
      return sendError(res, "Project not found", 404);
    }

    // Check ProjectMembership collection
    let membership = await ProjectMembership.findOne({
      project: project._id,
      user: userId,
      status: "ACTIVE",
    });

    // If user is project owner but membership record doesn't exist yet, auto-create it
    if (!membership && project.owner.toString() === userId.toString()) {
      membership = await ProjectMembership.findOneAndUpdate(
        { project: project._id, user: userId },
        {
          project: project._id,
          user: userId,
          role: "OWNER",
          status: "ACTIVE",
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    }

    if (!membership) {
      return sendError(
        res,
        "Not authorized: you are not an active member of this workspace",
        403
      );
    }

    req.project = project;
    req.membership = membership;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware: Verify project membership OR allow read-only access if project is public
 */
const requireProjectMemberOrPublicReadOnly = async (req, res, next) => {
  try {
    const projectId = req.params.projectId || req.params.id || req.body?.projectId;
    const userId = req.user ? (req.user._id || req.user.id) : null;

    if (!projectId) {
      return sendError(res, "Project ID is required", 400);
    }

    let project = null;
    if (mongoose.Types.ObjectId.isValid(projectId)) {
      project = await Project.findById(projectId);
    } else {
      project = await Project.findOne({ slug: projectId });
    }

    if (!project) {
      return sendError(res, "Project not found", 404);
    }

    const isPublic = (project.visibility || "").toLowerCase() === "public";

    // 1. If authenticated user, check active membership
    let membership = null;
    if (userId) {
      membership = await ProjectMembership.findOne({
        project: project._id,
        user: userId,
        status: "ACTIVE",
      });

      if (!membership && project.owner.toString() === userId.toString()) {
        membership = await ProjectMembership.findOneAndUpdate(
          { project: project._id, user: userId },
          {
            project: project._id,
            user: userId,
            role: "OWNER",
            status: "ACTIVE",
          },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );
      }
    }

    // 2. If write/mutation operation (POST, PATCH, PUT, DELETE), STRICT membership is required
    const isSafeMethod = req.method === "GET" || req.method === "HEAD" || req.method === "OPTIONS";

    if (!isSafeMethod) {
      if (!userId) {
        return sendError(res, "Authentication required to modify this repository", 401);
      }
      if (!membership) {
        return sendError(
          res,
          "Not authorized: you are not an active member of this workspace",
          403
        );
      }
    }

    // 3. For GET requests on private project without membership
    if (!membership && !isPublic) {
      return sendError(
        res,
        "Not authorized: you are not an active member of this private workspace",
        403
      );
    }

    req.project = project;
    req.membership = membership || { role: "VIEWER", isPublicViewer: true };
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware: Verify that user's membership role satisfies one of the allowed roles
 * @param  {...string} allowedRoles - e.g. "OWNER", "ADMIN", "DEVELOPER"
 */
const requireProjectRole = (...allowedRoles) => {
  const normalizedAllowed = allowedRoles.map((r) => r.toUpperCase());

  return (req, res, next) => {
    if (!req.membership) {
      return sendError(res, "Project membership context missing", 403);
    }

    const currentRole = (req.membership.role || "").toUpperCase();

    // Project OWNER always has super-privilege unless explicitly restricted
    if (currentRole === "OWNER" || normalizedAllowed.includes(currentRole)) {
      return next();
    }

    return sendError(
      res,
      `Permission denied: this action requires one of the following roles: [${normalizedAllowed.join(
        ", "
      )}]`,
      403
    );
  };
};

module.exports = {
  requireProjectMember,
  requireProjectMemberOrPublicReadOnly,
  requireProjectRole,
};
