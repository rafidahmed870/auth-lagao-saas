/**
 * APPLICATION MODEL
 * Database operations for Applications, Licenses, App Users, and Subscriptions
 */

const { eq, and } = require("drizzle-orm");
const { db } = require("../DB/database");
const {
  applications,
  licenses,
  appUsers,
  appSubscriptions,
} = require("../DB/schema");

/* ============================================
   APPLICATION FUNCTIONS
   ============================================ */

exports.findAllApplicationsByOwner = async (ownerId) => {
  const apps = await db
    .select()
    .from(applications)
    .where(eq(applications.ownerId, ownerId));
  return apps;
};

exports.findApplicationById = async (appId) => {
  const app = await db
    .select()
    .from(applications)
    .where(eq(applications.id, appId));
  return app[0] || null;
};

exports.findApplicationByOwnerAndId = async (ownerId, appId) => {
  const app = await db
    .select()
    .from(applications)
    .where(
      and(eq(applications.id, appId), eq(applications.ownerId, ownerId))
    );
  return app[0] || null;
};

exports.createApplication = async (data) => {
  const newApp = await db.insert(applications).values(data).returning();
  return newApp[0];
};

exports.updateApplication = async (appId, ownerId, data) => {
  const updated = await db
    .update(applications)
    .set(data)
    .where(
      and(eq(applications.id, appId), eq(applications.ownerId, ownerId))
    )
    .returning();
  return updated[0] || null;
};

exports.deleteApplication = async (appId, ownerId) => {
  const deleted = await db
    .delete(applications)
    .where(
      and(eq(applications.id, appId), eq(applications.ownerId, ownerId))
    )
    .returning();
  return deleted[0] || null;
};

/* ============================================
   LICENSE FUNCTIONS
   ============================================ */

exports.findAllLicensesByApp = async (appId) => {
  const result = await db
    .select()
    .from(licenses)
    .where(eq(licenses.appId, appId));
  return result;
};

exports.findLicenseById = async (licenseId) => {
  const result = await db
    .select()
    .from(licenses)
    .where(eq(licenses.id, licenseId));
  return result[0] || null;
};

exports.findLicenseByIdAndApp = async (licenseId, appId) => {
  const result = await db
    .select()
    .from(licenses)
    .where(and(eq(licenses.id, licenseId), eq(licenses.appId, appId)));
  return result[0] || null;
};

exports.createLicense = async (data) => {
  const newLicense = await db.insert(licenses).values(data).returning();
  return newLicense[0];
};

exports.updateLicense = async (licenseId, appId, data) => {
  const updated = await db
    .update(licenses)
    .set(data)
    .where(and(eq(licenses.id, licenseId), eq(licenses.appId, appId)))
    .returning();
  return updated[0] || null;
};

exports.deleteLicense = async (licenseId, appId) => {
  const deleted = await db
    .delete(licenses)
    .where(and(eq(licenses.id, licenseId), eq(licenses.appId, appId)))
    .returning();
  return deleted[0] || null;
};

/* ============================================
   APP USER FUNCTIONS
   ============================================ */

exports.findAllUsersByApp = async (appId) => {
  const result = await db
    .select()
    .from(appUsers)
    .where(eq(appUsers.appId, appId));
  return result;
};

exports.findAppUserById = async (appUserId) => {
  const result = await db
    .select()
    .from(appUsers)
    .where(eq(appUsers.id, appUserId));
  return result[0] || null;
};

exports.findAppUserByIdAndApp = async (appUserId, appId) => {
  const result = await db
    .select()
    .from(appUsers)
    .where(and(eq(appUsers.id, appUserId), eq(appUsers.appId, appId)));
  return result[0] || null;
};

exports.findAppUserByUsername = async (username, appId) => {
  const result = await db
    .select()
    .from(appUsers)
    .where(
      and(eq(appUsers.username, username), eq(appUsers.appId, appId))
    );
  return result[0] || null;
};

exports.createAppUser = async (data) => {
  const newUser = await db.insert(appUsers).values(data).returning();
  return newUser[0];
};

exports.updateAppUser = async (appUserId, appId, data) => {
  const updated = await db
    .update(appUsers)
    .set(data)
    .where(and(eq(appUsers.id, appUserId), eq(appUsers.appId, appId)))
    .returning();
  return updated[0] || null;
};

exports.deleteAppUser = async (appUserId, appId) => {
  const deleted = await db
    .delete(appUsers)
    .where(and(eq(appUsers.id, appUserId), eq(appUsers.appId, appId)))
    .returning();
  return deleted[0] || null;
};

/* Reset HWID — clears the bound hardware ID for a user */
exports.resetAppUserHwid = async (appUserId, appId) => {
  const updated = await db
    .update(appUsers)
    .set({ hwid: null })
    .where(and(eq(appUsers.id, appUserId), eq(appUsers.appId, appId)))
    .returning();
  return updated[0] || null;
};

/* ============================================
   SUBSCRIPTION FUNCTIONS
   ============================================ */

exports.findAllSubscriptionsByApp = async (appId) => {
  const result = await db
    .select()
    .from(appSubscriptions)
    .where(eq(appSubscriptions.appId, appId));
  return result;
};

exports.findSubscriptionById = async (subscriptionId) => {
  const result = await db
    .select()
    .from(appSubscriptions)
    .where(eq(appSubscriptions.id, subscriptionId));
  return result[0] || null;
};

exports.findSubscriptionByIdAndApp = async (subscriptionId, appId) => {
  const result = await db
    .select()
    .from(appSubscriptions)
    .where(
      and(
        eq(appSubscriptions.id, subscriptionId),
        eq(appSubscriptions.appId, appId)
      )
    );
  return result[0] || null;
};

exports.createSubscription = async (data) => {
  const newSub = await db
    .insert(appSubscriptions)
    .values(data)
    .returning();
  return newSub[0];
};

exports.updateSubscription = async (subscriptionId, appId, data) => {
  const updated = await db
    .update(appSubscriptions)
    .set(data)
    .where(
      and(
        eq(appSubscriptions.id, subscriptionId),
        eq(appSubscriptions.appId, appId)
      )
    )
    .returning();
  return updated[0] || null;
};

exports.deleteSubscription = async (subscriptionId, appId) => {
  const deleted = await db
    .delete(appSubscriptions)
    .where(
      and(
        eq(appSubscriptions.id, subscriptionId),
        eq(appSubscriptions.appId, appId)
      )
    )
    .returning();
  return deleted[0] || null;
};
