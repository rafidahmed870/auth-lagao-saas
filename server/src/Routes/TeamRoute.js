/**
 * TEAM ROUTES
 * All nested under /applications/:appId/team
 *
 *   GET    /:appId/team/members          → list team members
 *   POST   /:appId/team/members          → invite a member
 *   PATCH  /:appId/team/members/:id      → update member permissions
 *   DELETE /:appId/team/members/:id      → remove member
 *   GET    /:appId/team/permissions      → permission catalogue
 */

const express = require("express");
const { AuthMiddleware } = require("../Middlewares/AuthMiddleware");
const {
  getTeamMembers,
  inviteTeamMember,
  updateTeamMember,
  removeTeamMember,
  getPermissions,
} = require("../Controllers/TeamController");

const router = express.Router({ mergeParams: true });

router.get("/members",          AuthMiddleware, getTeamMembers);
router.post("/members",         AuthMiddleware, inviteTeamMember);
router.patch("/members/:id",    AuthMiddleware, updateTeamMember);
router.delete("/members/:id",   AuthMiddleware, removeTeamMember);
router.get("/permissions",      AuthMiddleware, getPermissions);

module.exports = router;
