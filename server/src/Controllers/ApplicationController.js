/**
 * APPLICATION CONTROLLER
 * Handles all Application, License, App User, and Subscription operations
 * Each handler uses Zod validation and ownership verification
 */

const TryCatch = require("../Middlewares/TryCatch");
const {
  formateZodError,
  createApplicationSchema,
  updateApplicationSchema,
  createLicenseSchema,
  updateLicenseSchema,
  createAppUserSchema,
  updateAppUserSchema,
  createSubscriptionSchema,
  updateSubscriptionSchema,
  appIdParamSchema,
  nestedParamSchema,
} = require("../Utils/Zod");
const {
  findAllApplicationsByOwner,
  findApplicationByOwnerAndId,
  createApplication,
  updateApplication,
  deleteApplication,
  findAllLicensesByApp,
  findLicenseByIdAndApp,
  createLicense,
  updateLicense,
  deleteLicense,
  findAllUsersByApp,
  findAppUserByIdAndApp,
  findAppUserByUsername,
  createAppUser,
  updateAppUser,
  deleteAppUser,
  resetAppUserHwid,
  findAllSubscriptionsByApp,
  findSubscriptionByIdAndApp,
  createSubscription,
  updateSubscription,
  deleteSubscription,
} = require("../Models/ApplicationModel");
const RafidKMS = require("../Utils/KMS");
const bcrypt = require("bcryptjs");

/* Initialize KMS singleton with master key from env */
const kms = new RafidKMS(process.env.APP_MASTER_KEY);

/* ============================================
   HELPER: Verify app ownership
   ============================================ */

const verifyAppOwnership = async (appId, ownerId, res) => {
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

/* ============================================
   APPLICATION CRUD
   ============================================ */

exports.getAllApplications = TryCatch(async (req, res) => {
  const userId = req.user.id;
  const apps = await findAllApplicationsByOwner(userId);

  return res.status(200).json({
    success: true,
    message: "Applications fetched successfully",
    data: apps,
  });
});

exports.getApplicationById = TryCatch(async (req, res) => {
  const userId = req.user.id;
  const { appId } = req.params;

  const app = await verifyAppOwnership(appId, userId, res);
  if (!app) return;

  return res.status(200).json({
    success: true,
    message: "Application fetched successfully",
    data: app,
  });
});

exports.createApplication = TryCatch(async (req, res) => {
  const userId = req.user.id;

  const validation = createApplicationSchema.safeParse(req.body);
  if (!validation.success) {
    const { firstError, allErrors } = formateZodError(validation.error);
    return res.status(400).json({
      success: false,
      message: firstError,
      errors: allErrors,
    });
  }

  /* Generate keypair using RafidKMS (handles RSA generation + AES wrapping) */
  const keyPair = kms.generateAppKeyPair();

  const newApp = await createApplication({
    ...validation.data,
    ownerId: userId,
    appKey: keyPair.appKey,
    encryptedPrivateKey: keyPair.encryptedPrivateKey,
    privateKeyIv: keyPair.privateKeyIv,
    privateKeyAuthTag: keyPair.privateKeyAuthTag,
  });

  return res.status(201).json({
    success: true,
    message: "Application created successfully",
    data: {
      id: newApp.id,
      appName: newApp.appName,
      appDescription: newApp.appDescription,
      appVersion: newApp.appVersion,
      appKey: newApp.appKey,
      isActive: newApp.isActive,
      createdAt: newApp.createdAt,
    },
  });
});

exports.updateApplication = TryCatch(async (req, res) => {
  const userId = req.user.id;
  const { appId } = req.params;

  const app = await verifyAppOwnership(appId, userId, res);
  if (!app) return;

  const validation = updateApplicationSchema.safeParse(req.body);
  if (!validation.success) {
    const { firstError, allErrors } = formateZodError(validation.error);
    return res.status(400).json({
      success: false,
      message: firstError,
      errors: allErrors,
    });
  }

  /* Ensure at least one field is being updated */
  if (Object.keys(validation.data).length === 0) {
    return res.status(400).json({
      success: false,
      message: "At least one field is required to update",
    });
  }

  const updated = await updateApplication(appId, userId, validation.data);

  return res.status(200).json({
    success: true,
    message: "Application updated successfully",
    data: updated,
  });
});

exports.deleteApplication = TryCatch(async (req, res) => {
  const userId = req.user.id;
  const { appId } = req.params;

  const app = await verifyAppOwnership(appId, userId, res);
  if (!app) return;

  await deleteApplication(appId, userId);

  return res.status(200).json({
    success: true,
    message: "Application deleted successfully",
  });
});

/* ============================================
   LICENSE CRUD (nested under /applications/:appId)
   ============================================ */

exports.getAllLicenses = TryCatch(async (req, res) => {
  const userId = req.user.id;
  const { appId } = req.params;

  const app = await verifyAppOwnership(appId, userId, res);
  if (!app) return;

  const allLicenses = await findAllLicensesByApp(appId);

  return res.status(200).json({
    success: true,
    message: "Licenses fetched successfully",
    data: allLicenses,
  });
});

exports.getLicenseById = TryCatch(async (req, res) => {
  const userId = req.user.id;
  const { appId, id } = req.params;

  const app = await verifyAppOwnership(appId, userId, res);
  if (!app) return;

  const paramValidation = nestedParamSchema.safeParse({ appId, id });
  if (!paramValidation.success) {
    const { firstError, allErrors } = formateZodError(paramValidation.error);
    return res.status(400).json({ success: false, message: firstError, errors: allErrors });
  }

  const license = await findLicenseByIdAndApp(id, appId);
  if (!license) {
    return res.status(404).json({ success: false, message: "License not found" });
  }

  return res.status(200).json({
    success: true,
    message: "License fetched successfully",
    data: license,
  });
});

exports.createLicense = TryCatch(async (req, res) => {
  const userId = req.user.id;
  const { appId } = req.params;

  const app = await verifyAppOwnership(appId, userId, res);
  if (!app) return;

  const validation = createLicenseSchema.safeParse(req.body);
  if (!validation.success) {
    const { firstError, allErrors } = formateZodError(validation.error);
    return res.status(400).json({
      success: false,
      message: firstError,
      errors: allErrors,
    });
  }

  const newLicense = await createLicense({
    ...validation.data,
    appId,
    expiresAt: new Date(validation.data.expiresAt),
  });

  return res.status(201).json({
    success: true,
    message: "License created successfully",
    data: newLicense,
  });
});

exports.updateLicense = TryCatch(async (req, res) => {
  const userId = req.user.id;
  const { appId, id } = req.params;

  const app = await verifyAppOwnership(appId, userId, res);
  if (!app) return;

  const license = await findLicenseByIdAndApp(id, appId);
  if (!license) {
    return res.status(404).json({ success: false, message: "License not found" });
  }

  const validation = updateLicenseSchema.safeParse(req.body);
  if (!validation.success) {
    const { firstError, allErrors } = formateZodError(validation.error);
    return res.status(400).json({
      success: false,
      message: firstError,
      errors: allErrors,
    });
  }

  if (Object.keys(validation.data).length === 0) {
    return res.status(400).json({
      success: false,
      message: "At least one field is required to update",
    });
  }

  const updateData = { ...validation.data };
  if (updateData.expiresAt) {
    updateData.expiresAt = new Date(updateData.expiresAt);
  }

  const updated = await updateLicense(id, appId, updateData);

  return res.status(200).json({
    success: true,
    message: "License updated successfully",
    data: updated,
  });
});

exports.deleteLicense = TryCatch(async (req, res) => {
  const userId = req.user.id;
  const { appId, id } = req.params;

  const app = await verifyAppOwnership(appId, userId, res);
  if (!app) return;

  const license = await findLicenseByIdAndApp(id, appId);
  if (!license) {
    return res.status(404).json({ success: false, message: "License not found" });
  }

  await deleteLicense(id, appId);

  return res.status(200).json({
    success: true,
    message: "License deleted successfully",
  });
});

/* ============================================
   APP USER CRUD (nested under /applications/:appId)
   ============================================ */

exports.getAllAppUsers = TryCatch(async (req, res) => {
  const userId = req.user.id;
  const { appId } = req.params;

  const app = await verifyAppOwnership(appId, userId, res);
  if (!app) return;

  const allUsers = await findAllUsersByApp(appId);

  /* Remove password from response */
  const sanitizedUsers = allUsers.map(({ password, ...user }) => user);

  return res.status(200).json({
    success: true,
    message: "App users fetched successfully",
    data: sanitizedUsers,
  });
});

exports.getAppUserById = TryCatch(async (req, res) => {
  const userId = req.user.id;
  const { appId, id } = req.params;

  const app = await verifyAppOwnership(appId, userId, res);
  if (!app) return;

  const paramValidation = nestedParamSchema.safeParse({ appId, id });
  if (!paramValidation.success) {
    const { firstError, allErrors } = formateZodError(paramValidation.error);
    return res.status(400).json({ success: false, message: firstError, errors: allErrors });
  }

  const appUser = await findAppUserByIdAndApp(id, appId);
  if (!appUser) {
    return res.status(404).json({ success: false, message: "App user not found" });
  }

  /* Remove password from response */
  const { password, ...sanitizedUser } = appUser;

  return res.status(200).json({
    success: true,
    message: "App user fetched successfully",
    data: sanitizedUser,
  });
});

exports.createAppUser = TryCatch(async (req, res) => {
  const userId = req.user.id;
  const { appId } = req.params;

  const app = await verifyAppOwnership(appId, userId, res);
  if (!app) return;

  const validation = createAppUserSchema.safeParse(req.body);
  if (!validation.success) {
    const { firstError, allErrors } = formateZodError(validation.error);
    return res.status(400).json({
      success: false,
      message: firstError,
      errors: allErrors,
    });
  }

  /* Check if username already exists for this app */
  const existingUser = await findAppUserByUsername(validation.data.username, appId);
  if (existingUser) {
    return res.status(409).json({
      success: false,
      message: "Username already exists for this application",
    });
  }

  /* Hash the password */
  const hashedPassword = await bcrypt.hash(validation.data.password, 10);

  const newAppUser = await createAppUser({
    ...validation.data,
    appId,
    password: hashedPassword,
    expiresAt: new Date(validation.data.expiresAt),
  });

  /* Remove password from response */
  const { password, ...sanitizedUser } = newAppUser;

  return res.status(201).json({
    success: true,
    message: "App user created successfully",
    data: sanitizedUser,
  });
});

exports.updateAppUser = TryCatch(async (req, res) => {
  const userId = req.user.id;
  const { appId, id } = req.params;

  const app = await verifyAppOwnership(appId, userId, res);
  if (!app) return;

  const appUser = await findAppUserByIdAndApp(id, appId);
  if (!appUser) {
    return res.status(404).json({ success: false, message: "App user not found" });
  }

  const validation = updateAppUserSchema.safeParse(req.body);
  if (!validation.success) {
    const { firstError, allErrors } = formateZodError(validation.error);
    return res.status(400).json({
      success: false,
      message: firstError,
      errors: allErrors,
    });
  }

  if (Object.keys(validation.data).length === 0) {
    return res.status(400).json({
      success: false,
      message: "At least one field is required to update",
    });
  }

  const updateData = { ...validation.data };

  /* Hash the password if being updated */
  if (updateData.password) {
    updateData.password = await bcrypt.hash(updateData.password, 10);
  }

  /* Check username uniqueness if being updated */
  if (updateData.username) {
    const existingUser = await findAppUserByUsername(updateData.username, appId);
    if (existingUser && existingUser.id !== id) {
      return res.status(409).json({
        success: false,
        message: "Username already exists for this application",
      });
    }
  }

  if (updateData.expiresAt) {
    updateData.expiresAt = new Date(updateData.expiresAt);
  }

  const updated = await updateAppUser(id, appId, updateData);

  /* Remove password from response */
  const { password, ...sanitizedUser } = updated;

  return res.status(200).json({
    success: true,
    message: "App user updated successfully",
    data: sanitizedUser,
  });
});

exports.deleteAppUser = TryCatch(async (req, res) => {
  const userId = req.user.id;
  const { appId, id } = req.params;

  const app = await verifyAppOwnership(appId, userId, res);
  if (!app) return;

  const appUser = await findAppUserByIdAndApp(id, appId);
  if (!appUser) {
    return res.status(404).json({ success: false, message: "App user not found" });
  }

  await deleteAppUser(id, appId);

  return res.status(200).json({
    success: true,
    message: "App user deleted successfully",
  });
});

/* Reset a user's bound HWID (clears hwid field to null) */
exports.resetAppUserHwid = TryCatch(async (req, res) => {
  const userId = req.user.id;
  const { appId, id } = req.params;

  const app = await verifyAppOwnership(appId, userId, res);
  if (!app) return;

  const paramValidation = nestedParamSchema.safeParse({ appId, id });
  if (!paramValidation.success) {
    const { firstError, allErrors } = formateZodError(paramValidation.error);
    return res.status(400).json({ success: false, message: firstError, errors: allErrors });
  }

  const appUser = await findAppUserByIdAndApp(id, appId);
  if (!appUser) {
    return res.status(404).json({ success: false, message: "App user not found" });
  }

  const updated = await resetAppUserHwid(id, appId);

  /* Remove password from response */
  const { password, ...sanitizedUser } = updated;

  return res.status(200).json({
    success: true,
    message: "HWID reset successfully",
    data: sanitizedUser,
  });
});

/* ============================================
   SUBSCRIPTION CRUD (nested under /applications/:appId)
   ============================================ */

exports.getAllSubscriptions = TryCatch(async (req, res) => {
  const userId = req.user.id;
  const { appId } = req.params;

  const app = await verifyAppOwnership(appId, userId, res);
  if (!app) return;

  const allSubs = await findAllSubscriptionsByApp(appId);

  return res.status(200).json({
    success: true,
    message: "Subscriptions fetched successfully",
    data: allSubs,
  });
});

exports.getSubscriptionById = TryCatch(async (req, res) => {
  const userId = req.user.id;
  const { appId, id } = req.params;

  const app = await verifyAppOwnership(appId, userId, res);
  if (!app) return;

  const paramValidation = nestedParamSchema.safeParse({ appId, id });
  if (!paramValidation.success) {
    const { firstError, allErrors } = formateZodError(paramValidation.error);
    return res.status(400).json({ success: false, message: firstError, errors: allErrors });
  }

  const subscription = await findSubscriptionByIdAndApp(id, appId);
  if (!subscription) {
    return res.status(404).json({ success: false, message: "Subscription not found" });
  }

  return res.status(200).json({
    success: true,
    message: "Subscription fetched successfully",
    data: subscription,
  });
});

exports.createSubscription = TryCatch(async (req, res) => {
  const userId = req.user.id;
  const { appId } = req.params;

  const app = await verifyAppOwnership(appId, userId, res);
  if (!app) return;

  const validation = createSubscriptionSchema.safeParse(req.body);
  if (!validation.success) {
    const { firstError, allErrors } = formateZodError(validation.error);
    return res.status(400).json({
      success: false,
      message: firstError,
      errors: allErrors,
    });
  }

  const newSub = await createSubscription({
    ...validation.data,
    appId,
  });

  return res.status(201).json({
    success: true,
    message: "Subscription created successfully",
    data: newSub,
  });
});

exports.updateSubscription = TryCatch(async (req, res) => {
  const userId = req.user.id;
  const { appId, id } = req.params;

  const app = await verifyAppOwnership(appId, userId, res);
  if (!app) return;

  const subscription = await findSubscriptionByIdAndApp(id, appId);
  if (!subscription) {
    return res.status(404).json({ success: false, message: "Subscription not found" });
  }

  const validation = updateSubscriptionSchema.safeParse(req.body);
  if (!validation.success) {
    const { firstError, allErrors } = formateZodError(validation.error);
    return res.status(400).json({
      success: false,
      message: firstError,
      errors: allErrors,
    });
  }

  if (Object.keys(validation.data).length === 0) {
    return res.status(400).json({
      success: false,
      message: "At least one field is required to update",
    });
  }

  const updated = await updateSubscription(id, appId, validation.data);

  return res.status(200).json({
    success: true,
    message: "Subscription updated successfully",
    data: updated,
  });
});

exports.deleteSubscription = TryCatch(async (req, res) => {
  const userId = req.user.id;
  const { appId, id } = req.params;

  const app = await verifyAppOwnership(appId, userId, res);
  if (!app) return;

  const subscription = await findSubscriptionByIdAndApp(id, appId);
  if (!subscription) {
    return res.status(404).json({ success: false, message: "Subscription not found" });
  }

  await deleteSubscription(id, appId);

  return res.status(200).json({
    success: true,
    message: "Subscription deleted successfully",
  });
});
