/**
 * TEAM MODEL
 * Database operations for the application-level team management system.
 * Covers appTeamMembers (ACL join table) and appLevelPermissions (permission catalogue).
 */

const { eq, and } = require("drizzle-orm");
const { db } = require("../DB/database");
const { appTeamMembers, appLevelPermissions, users } = require("../DB/schema");

/* ============================================
   PERMISSION CATALOGUE
   ============================================ */

/**
 * Return the full catalogue of available app-level permissions.
 * Ordered by id so the list is stable for the UI.
 */
exports.findAllPermissions = async () => {
  const result = await db
    .select()
    .from(appLevelPermissions)
    .orderBy(appLevelPermissions.id);
  return result;
};

/* ============================================
   TEAM MEMBER QUERIES
   ============================================ */

/**
 * Return all team members for an application, joined with the platform
 * user's name and email so the UI can display them without extra lookups.
 */
exports.findAllTeamMembers = async (appId) => {
  const result = await db
    .select({
      id: appTeamMembers.id,
      appId: appTeamMembers.appId,
      memberId: appTeamMembers.memberId,
      memberPermissions: appTeamMembers.memberPermissions,
      createdAt: appTeamMembers.createdAt,
      updatedAt: appTeamMembers.updatedAt,
      /* Joined user fields */
      name: users.name,
      email: users.email,
    })
    .from(appTeamMembers)
    .innerJoin(users, eq(appTeamMembers.memberId, users.id))
    .where(eq(appTeamMembers.appId, appId));
  return result;
};

/**
 * Find a single team-member record by its own UUID (the membership row id).
 */
exports.findTeamMemberById = async (memberId, appId) => {
  const result = await db
    .select({
      id: appTeamMembers.id,
      appId: appTeamMembers.appId,
      memberId: appTeamMembers.memberId,
      memberPermissions: appTeamMembers.memberPermissions,
      createdAt: appTeamMembers.createdAt,
      updatedAt: appTeamMembers.updatedAt,
      name: users.name,
      email: users.email,
    })
    .from(appTeamMembers)
    .innerJoin(users, eq(appTeamMembers.memberId, users.id))
    .where(
      and(
        eq(appTeamMembers.id, memberId),
        eq(appTeamMembers.appId, appId)
      )
    );
  return result[0] || null;
};

/**
 * Look up a membership row by the platform user's UUID (not the membership row id).
 * Useful for duplicate-invite checks and permission gate lookups.
 */
exports.findTeamMemberByUserId = async (userId, appId) => {
  const result = await db
    .select()
    .from(appTeamMembers)
    .where(
      and(
        eq(appTeamMembers.memberId, userId),
        eq(appTeamMembers.appId, appId)
      )
    );
  return result[0] || null;
};

/* ============================================
   TEAM MEMBER MUTATIONS
   ============================================ */

/**
 * Add a user to an application's team with the supplied permission array.
 */
exports.createTeamMember = async ({ appId, memberId, memberPermissions }) => {
  const inserted = await db
    .insert(appTeamMembers)
    .values({ appId, memberId, memberPermissions })
    .returning();
  return inserted[0];
};

/**
 * Replace the permission array for an existing team member.
 */
exports.updateTeamMemberPermissions = async (id, appId, permissions) => {
  const updated = await db
    .update(appTeamMembers)
    .set({ memberPermissions: permissions })
    .where(
      and(
        eq(appTeamMembers.id, id),
        eq(appTeamMembers.appId, appId)
      )
    )
    .returning();
  return updated[0] || null;
};

/**
 * Remove a member from the team entirely.
 */
exports.deleteTeamMember = async (id, appId) => {
  const deleted = await db
    .delete(appTeamMembers)
    .where(
      and(
        eq(appTeamMembers.id, id),
        eq(appTeamMembers.appId, appId)
      )
    )
    .returning();
  return deleted[0] || null;
};
