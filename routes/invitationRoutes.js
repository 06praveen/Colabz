const express = require("express");
const {
  createInvitation,
  getProjectInvitations,
  getMyPendingInvitations,
  acceptInvitation,
  declineInvitation,
  cancelInvitation,
} = require("../controllers/invitationController");
const protect = require("../middleware/authMiddleware");
const {
  requireProjectMember,
  requireProjectRole,
} = require("../middleware/membershipMiddleware");

// Router for /api/projects/:projectId/invitations
const projectInvitationRouter = express.Router({ mergeParams: true });
projectInvitationRouter.use(protect);
projectInvitationRouter.use(requireProjectMember);
projectInvitationRouter.use(requireProjectRole("OWNER", "ADMIN"));

projectInvitationRouter.post("/", createInvitation);
projectInvitationRouter.get("/", getProjectInvitations);
projectInvitationRouter.delete("/:invitationId", cancelInvitation);

// Router for /api/invitations
const userInvitationRouter = express.Router();
userInvitationRouter.use(protect);

userInvitationRouter.get("/", getMyPendingInvitations);
userInvitationRouter.get("/inbox", getMyPendingInvitations);
userInvitationRouter.get("/me", getMyPendingInvitations);
userInvitationRouter.post("/:invitationId/accept", acceptInvitation);
userInvitationRouter.post("/:invitationId/decline", declineInvitation);

module.exports = {
  projectInvitationRouter,
  userInvitationRouter,
};
