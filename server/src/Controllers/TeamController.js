/**
 * TEAM CONTROLLER
 * ─────────────────────────────────────────────────────────────────────────────
 * Manages application-scoped team members and their ACL permissions.
 *
 * All mutating endpoints are owner-only (verified via verifyAppOwnership).
 * The GET /members endpoint is also available to team members who hold the
 * "view_team" permission so they can see their colleagues.
 *
 * Permission model
 * ─────────────────
 * Permissions are stored as a text[] column (memberPermissions) on the
 * appTeamMembers row.  The full catalogue is seeded into app_level_permissions
 * and also defined as TEAM_PERMISSIONS in Zod.js.
 *
 * Route summary (all nested under /applications/:appId/team)
 * ───────────────────────────────────────────────────────────
 *   GET    /members              → list members  (owner OR member w/ view_team)
 *   POST   /members              → invite member (owner only)
 *   PATCH  /members/:id          → update perms  (owner only)
 *   DELETE /members/:id          → remove member (owner only)
 *   GET    /permissions          → permission catalogue (owner OR any member)
 * ─────────────────────────────────────────────────────────────────────────────
 */

const TryCatch = require("../Middlewares/TryCatch");
const {
  formateZodError,
  appIdParamSchema,
  nestedParamSchema,
  inviteTeamMemberSchema,
  updateTeamMemberPermissionsSchema,
} = require("../Utils/Zod");
const {
  findApplicationByOwnerAndId,
  findApplicationById,
} = require("../Models/ApplicationModel");
const { findUserByEmail } = require("../Models/AuthModel");
const {
  findAllPermissions,
  findAllTeamMembers,
  findTeamMemberById,
  findTeamMemberByUserId,
  createTeamMember,
  updateTeamMemberPermissions,
  deleteTeamMember,
} = require("../Models/TeamModel");

/* ─── Internal helpers ─────────────────────────────────────────────────────── */

/**
 * Resolves + validates :appId param, then checks whether the requesting
 * user is the application owner.  Returns the app row or null (after sending
 * a response).
 */
const requireOwner = async (appId, ownerId, res) => {
  const paramValidation = appIdParamSchema.safeParse({ appId });
  if (!paramValidation.success) {
    const { firstError, allErrors } = formateZodError(paramValidation.error);
    res.status(400).json({ success: false, message: firstError, errors: allErrors });
    return null;
  }

  const app = await findApplicationByOwnerAndId(ownerId, appId);
  if (!app) {
    res.status(404).json({ success: false, message: "Application not found" });
    return null;
  }
  return app;
};

/**
 * Resolves :appId param and determines whether the requesting user has access
 * as the owner OR as a team member with the given permission.
 * Returns { app, isOwner } or null (after sending a response).
 */
const requireOwnerOrMember = async (appId, userId, requiredPermission, res) => {
  const paramValidation = appIdParamSchema.safeParse({ appId });
  if (!paramValidation.success) {
    const { firstError, allErrors } = formateZodError(paramValidation.error);
    res.status(400).json({ success: false, message: firstError, errors: allErrors });
    return null;
  }

  /* Try owner first */
  const app = await findApplicationByOwnerAndId(userId, appId);
  if (app) return { app, isOwner: true };

  /* Fall back to team member with required permission */
  const appById = await findApplicationById(appId);
  if (!appById) {
    res.status(404).json({ success: false, message: "Application not found" });
    return null;
  }

  const membership = await findTeamMemberByUserId(userId, appId);
  if (!membership) {
    res.status(403).json({ success: false, message: "Access denied" });
    return null;
  }

  if (requiredPermission && !membership.memberPermissions.includes(requiredPermission)) {
    res.status(403).json({
      success: false,
      message: `Missing required permission: ${requiredPermission}`,
    });
    return null;
  }

  return { app: appById, isOwner: false, membership };
};

/* ─── Controllers ──────────────────────────────────────────────────────────── */

/**
 * GET /applications/:appId/team/members
 *
 * Returns all team members for the app (excluding the owner, who is not a
 * member record). Available to the owner and any member with "view_team".
 */
exports.getTeamMembers = TryCatch(async (req, res) => {
  const userId = req.user.id;
  const { appId } = req.params;

  const result = await requireOwnerOrMember(appId, userId, "app.team.view", res);
  if (!result) return;

  const members = await findAllTeamMembers(appId);

  return res.status(200).json({
    success: true,
    message: "Team members fetched successfully",
    data: members,
  });
});

/**
 * GET /applications/:appId/team/permissions
 *
 * Returns the full permission catalogue.  Useful for building the invite /
 * edit-permissions UI without hard-coding the list on the client.
 */
exports.getPermissions = TryCatch(async (req, res) => {
  const userId = req.user.id;
  const { appId } = req.params;

  const result = await requireOwnerOrMember(appId, userId, null, res);
  if (!result) return;

  const catalogue = await findAllPermissions();

  return res.status(200).json({
    success: true,
    message: "Permissions fetched successfully",
    data: catalogue,
  });
});

/**
 * POST /applications/:appId/team/members
 *
 * Body: { email, permissions[] }
 *
 * Invites a registered platform user to the team.  The invited user must
 * already have an account.  The owner cannot invite themselves.
 * Duplicate invites are rejected.
 */
exports.inviteTeamMember = TryCatch(async (req, res) => {
  const userId = req.user.id;
  const { appId } = req.params;

  const app = await requireOwner(appId, userId, res);
  if (!app) return;

  const validation = inviteTeamMemberSchema.safeParse(req.body);
  if (!validation.success) {
    const { firstError, allErrors } = formateZodError(validation.error);
    return res.status(400).json({ success: false, message: firstError, errors: allErrors });
  }

  const { email, permissions } = validation.data;

  /* Resolve the invited user */
  const invitedUser = await findUserByEmail(email);
  if (!invitedUser) {
    return res.status(404).json({
      success: false,
      message: "No user found with that email address. They must register first.",
    });
  }

  /* Owner cannot be added as a team member of their own app */
  if (invitedUser.id === userId) {
    return res.status(400).json({
      success: false,
      message: "You cannot add yourself as a team member.",
    });
  }

  /* Duplicate check */
  const existing = await findTeamMemberByUserId(invitedUser.id, appId);
  if (existing) {
    return res.status(409).json({
      success: false,
      message: "This user is already a team member of this application.",
    });
  }

  const member = await createTeamMember({
    appId,
    memberId: invitedUser.id,
    memberPermissions: permissions,
  });

  return res.status(201).json({
    success: true,
    message: `${invitedUser.name} has been added to the team.`,
    data: {
      id: member.id,
      appId: member.appId,
      memberId: member.memberId,
      memberPermissions: member.memberPermissions,
      createdAt: member.createdAt,
      /* Include display info so the client doesn't need a second request */
      name: invitedUser.name,
      email: invitedUser.email,
    },
  });
});

/**
 * PATCH /applications/:appId/team/members/:id
 *
 * Body: { permissions[] }
 *
 * Replaces the permission array for a specific team member.
 * Only the application owner can do this.
 */
exports.updateTeamMember = TryCatch(async (req, res) => {
  const userId = req.user.id;
  const { appId, id } = req.params;

  const app = await requireOwner(appId, userId, res);
  if (!app) return;

  /* Validate nested params */
  const paramValidation = nestedParamSchema.safeParse({ appId, id });
  if (!paramValidation.success) {
    const { firstError, allErrors } = formateZodError(paramValidation.error);
    return res.status(400).json({ success: false, message: firstError, errors: allErrors });
  }

  const member = await findTeamMemberById(id, appId);
  if (!member) {
    return res.status(404).json({ success: false, message: "Team member not found" });
  }

  const validation = updateTeamMemberPermissionsSchema.safeParse(req.body);
  if (!validation.success) {
    const { firstError, allErrors } = formateZodError(validation.error);
    return res.status(400).json({ success: false, message: firstError, errors: allErrors });
  }

  const updated = await updateTeamMemberPermissions(id, appId, validation.data.permissions);

  return res.status(200).json({
    success: true,
    message: "Permissions updated successfully",
    data: {
      ...updated,
      name: member.name,
      email: member.email,
    },
  });
});

/**
 * DELETE /applications/:appId/team/members/:id
 *
 * Removes a team member from the application.
 * Only the application owner can do this.
 */
exports.removeTeamMember = TryCatch(async (req, res) => {
  const userId = req.user.id;
  const { appId, id } = req.params;

  const app = await requireOwner(appId, userId, res);
  if (!app) return;

  const paramValidation = nestedParamSchema.safeParse({ appId, id });
  if (!paramValidation.success) {
    const { firstError, allErrors } = formateZodError(paramValidation.error);
    return res.status(400).json({ success: false, message: firstError, errors: allErrors });
  }

  const member = await findTeamMemberById(id, appId);
  if (!member) {
    return res.status(404).json({ success: false, message: "Team member not found" });
  }

  await deleteTeamMember(id, appId);

  return res.status(200).json({
    success: true,
    message: `${member.name} has been removed from the team.`,
  });
});
