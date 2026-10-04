const mongoose = require("mongoose");
const Project = require("../models/Project");
const ProjectMembership = require("../models/ProjectMembership");
const { sendSuccess, sendError } = require("../utils/apiResponse");
const { createActivity } = require("../services/activityService");

/**
 * Generate a unique URL-friendly slug
 */
const generateUniqueSlug = async (name, existingId = null) => {
  let baseSlug = name
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");

  if (!baseSlug) baseSlug = "project";

  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const query = { slug };
    if (existingId) {
      query._id = { $ne: existingId };
    }
    const existing = await Project.findOne(query);
    if (!existing) {
      return slug;
    }
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
};

/**
 * Create a new Project
 * Route: POST /api/projects
 */
const createProject = async (req, res, next) => {
  try {
    const {
      name,
      displayName,
      description,
      visibility,
      language,
      technologies,
      techStack,
      avatarColor,
      accent,
      status,
      defaultBranch,
    } = req.body;

    const userId = req.user._id || req.user.id;

    if (!name || !name.trim()) {
      return sendError(res, "Project name is required", 400);
    }

    const trimmedName = name.trim();
    const slug = await generateUniqueSlug(trimmedName);

    // Normalize techStack / technologies
    let techArray = ["React", "Node.js", "MongoDB"];
    const rawTech = technologies || techStack;
    if (Array.isArray(rawTech)) {
      techArray = rawTech.map((t) => t.toString().trim()).filter(Boolean);
    } else if (typeof rawTech === "string" && rawTech.trim()) {
      techArray = rawTech.split(",").map((t) => t.trim()).filter(Boolean);
    }

    const project = await Project.create({
      name: trimmedName,
      displayName: displayName ? displayName.trim() : trimmedName,
      slug,
      description: description ? description.trim() : "",
      owner: userId,
      members: [userId],
      visibility: visibility ? visibility.toLowerCase() : "private",
      language: language || "JavaScript",
      technologies: techArray,
      avatarColor: avatarColor || accent || "#00E5A3",
      accent: accent || avatarColor || "#00E5A3",
      status: status || "Active",
      defaultBranch: defaultBranch ? defaultBranch.trim() : "main",
    });

    // Automatically create OWNER membership for project creator
    await ProjectMembership.create({
      project: project._id,
      user: userId,
      role: "OWNER",
      status: "ACTIVE",
    });

    await createActivity({
      project: project._id,
      actor: userId,
      type: "PROJECT_CREATED",
      entityType: "PROJECT",
      entityId: project._id,
      title: "Project created",
      message: `${req.user.name || "User"} created project "${trimmedName}"`,
    });

    const populatedProject = await Project.findById(project._id)
      .populate("owner", "name email avatar avatarColor")
      .populate("members", "name email avatar avatarColor isOnline");

    return sendSuccess(
      res,
      { project: populatedProject },
      201,
      "Project created successfully"
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get all Projects for the authenticated user (owned + active memberships)
 * Route: GET /api/projects
 */
const getProjects = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;

    // Find all active memberships for the user
    const userMemberships = await ProjectMembership.find({
      user: userId,
      status: "ACTIVE",
    }).select("project");

    const memberProjectIds = userMemberships.map((m) => m.project);

    const projects = await Project.find({
      $or: [{ owner: userId }, { _id: { $in: memberProjectIds } }],
    })
      .populate("owner", "name email avatar avatarColor")
      .populate("members", "name email avatar avatarColor isOnline")
      .sort({ updatedAt: -1 });

    return sendSuccess(res, { projects });
  } catch (error) {
    next(error);
  }
};

/**
 * Get a specific Project by ID or slug
 * Route: GET /api/projects/:projectId
 */
const getProjectById = async (req, res, next) => {
  try {
    const userId = (req.user._id || req.user.id).toString();
    const { projectId } = req.params;

    let project = null;
    if (mongoose.Types.ObjectId.isValid(projectId)) {
      project = await Project.findById(projectId)
        .populate("owner", "name email avatar avatarColor")
        .populate("members", "name email avatar avatarColor isOnline lastSeen");
    }

    if (!project) {
      project = await Project.findOne({ slug: projectId })
        .populate("owner", "name email avatar avatarColor")
        .populate("members", "name email avatar avatarColor isOnline lastSeen");
    }

    if (!project) {
      return sendError(res, "Project not found", 404);
    }

    const isOwner = project.owner._id.toString() === userId;
    const isPublic = project.visibility.toLowerCase() === "public";

    // Check active membership
    const membership = await ProjectMembership.findOne({
      project: project._id,
      user: userId,
      status: "ACTIVE",
    });

    const isMember = Boolean(membership) || project.members.some(
      (member) => member._id.toString() === userId
    );

    if (!isOwner && !isMember && !isPublic) {
      return sendError(res, "Not authorized to access this project", 403);
    }

    return sendSuccess(res, { project });
  } catch (error) {
    next(error);
  }
};

/**
 * Update a Project (Owner Only)
 * Route: PATCH /api/projects/:projectId
 */
const updateProject = async (req, res, next) => {
  try {
    const userId = (req.user._id || req.user.id).toString();
    const { projectId } = req.params;

    let project = null;
    if (mongoose.Types.ObjectId.isValid(projectId)) {
      project = await Project.findById(projectId);
    } else {
      project = await Project.findOne({ slug: projectId });
    }

    if (!project) {
      return sendError(res, "Project not found", 404);
    }

    // Owner authorization check
    if (project.owner.toString() !== userId) {
      return sendError(
        res,
        "Only the project owner can update project settings",
        403
      );
    }

    const {
      name,
      displayName,
      description,
      visibility,
      language,
      technologies,
      techStack,
      avatarColor,
      accent,
      status,
      defaultBranch,
    } = req.body;

    if (name && name.trim()) {
      project.name = name.trim();
      project.slug = await generateUniqueSlug(project.name, project._id);
    }

    if (displayName !== undefined) project.displayName = displayName.trim();
    if (description !== undefined) project.description = description.trim();
    if (visibility !== undefined) project.visibility = visibility.toLowerCase();
    if (language !== undefined) project.language = language.trim();

    const rawTech = technologies !== undefined ? technologies : techStack;
    if (rawTech !== undefined) {
      if (Array.isArray(rawTech)) {
        project.technologies = rawTech.map((t) => t.toString().trim()).filter(Boolean);
      } else if (typeof rawTech === "string") {
        project.technologies = rawTech.split(",").map((t) => t.trim()).filter(Boolean);
      }
    }

    if (avatarColor !== undefined) project.avatarColor = avatarColor;
    if (accent !== undefined) project.accent = accent;
    if (status !== undefined) project.status = status;
    if (defaultBranch !== undefined) project.defaultBranch = defaultBranch.trim();

    await project.save();

    const updatedProject = await Project.findById(project._id)
      .populate("owner", "name email avatar avatarColor")
      .populate("members", "name email avatar avatarColor isOnline");

    return sendSuccess(
      res,
      { project: updatedProject },
      200,
      "Project updated successfully"
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a Project (Owner Only)
 * Route: DELETE /api/projects/:projectId
 */
const deleteProject = async (req, res, next) => {
  try {
    const userId = (req.user._id || req.user.id).toString();
    const { projectId } = req.params;

    let project = null;
    if (mongoose.Types.ObjectId.isValid(projectId)) {
      project = await Project.findById(projectId);
    } else {
      project = await Project.findOne({ slug: projectId });
    }

    if (!project) {
      return sendError(res, "Project not found", 404);
    }

    // Owner authorization check
    if (project.owner.toString() !== userId) {
      return sendError(res, "Only the project owner can delete this project", 403);
    }

    // Remove all associated memberships and invitations
    await Promise.all([
      ProjectMembership.deleteMany({ project: project._id }),
      Project.deleteOne({ _id: project._id }),
    ]);

    return sendSuccess(res, null, 200, "Project deleted successfully");
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
};
