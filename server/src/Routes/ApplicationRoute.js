/**
 * APPLICATION ROUTES
 * RESTful nested routes for Applications, Licenses, App Users, and Subscriptions
 * All routes are protected by AuthMiddleware
 */

const express = require("express");
const { AuthMiddleware } = require("../Middlewares/AuthMiddleware");
const {
  /* Application */
  getAllApplications,
  getMyAccess,
  getApplicationById,
  createApplication,
  updateApplication,
  deleteApplication,

  /* Licenses */
  getAllLicenses,
  getLicenseById,
  createLicense,
  updateLicense,
  deleteLicense,

  /* App Users */
  getAllAppUsers,
  getAppUserById,
  createAppUser,
  updateAppUser,
  deleteAppUser,
  resetAppUserHwid,

  /* Subscriptions */
  getAllSubscriptions,
  getSubscriptionById,
  createSubscription,
  updateSubscription,
  deleteSubscription,
} = require("../Controllers/ApplicationController");
const { verifyCSRFToken } = require("../Config/csrfToken");

const router = express.Router();

/* ============================================
   APPLICATION ROUTES
   GET    /                  → Get all applications
   POST   /                  → Create application
   GET    /:appId            → Get single application
   PATCH  /:appId            → Update application
   DELETE /:appId            → Delete application
   ============================================ */

router.get("/", AuthMiddleware, getAllApplications);
router.post("/", AuthMiddleware, verifyCSRFToken, createApplication);
router.get("/:appId/my-access", AuthMiddleware, getMyAccess);
router.get("/:appId", AuthMiddleware, getApplicationById);
router.patch("/:appId", AuthMiddleware, verifyCSRFToken, updateApplication);
router.delete("/:appId", AuthMiddleware, verifyCSRFToken, deleteApplication);

/* ============================================
   LICENSE ROUTES (nested under /:appId/licenses)
   GET    /:appId/licenses        → Get all licenses
   POST   /:appId/licenses        → Create license
   GET    /:appId/licenses/:id    → Get single license
   PATCH  /:appId/licenses/:id    → Update license
   DELETE /:appId/licenses/:id    → Delete license
   ============================================ */

router.get("/:appId/licenses", AuthMiddleware, getAllLicenses);
router.post("/:appId/licenses", AuthMiddleware, verifyCSRFToken, createLicense);
router.get("/:appId/licenses/:id", AuthMiddleware, getLicenseById);
router.patch("/:appId/licenses/:id", AuthMiddleware, verifyCSRFToken, updateLicense);
router.delete("/:appId/licenses/:id", AuthMiddleware, verifyCSRFToken, deleteLicense);

/* ============================================
   APP USER ROUTES (nested under /:appId/users)
   GET    /:appId/users           → Get all app users
   POST   /:appId/users           → Create app user
   GET    /:appId/users/:id       → Get single app user
   PATCH  /:appId/users/:id       → Update app user
   DELETE /:appId/users/:id       → Delete app user
   ============================================ */

router.get("/:appId/users", AuthMiddleware, getAllAppUsers);
router.post("/:appId/users", AuthMiddleware, verifyCSRFToken, createAppUser);
router.get("/:appId/users/:id", AuthMiddleware, getAppUserById);
router.patch("/:appId/users/:id", AuthMiddleware, verifyCSRFToken, updateAppUser);
router.delete("/:appId/users/:id", AuthMiddleware, verifyCSRFToken, deleteAppUser);
/* PATCH /:appId/users/:id/reset-hwid → clear bound HWID */
router.patch("/:appId/users/:id/reset-hwid", AuthMiddleware, verifyCSRFToken, resetAppUserHwid);

/* ============================================
   SUBSCRIPTION ROUTES (nested under /:appId/subscriptions)
   GET    /:appId/subscriptions        → Get all subscriptions
   POST   /:appId/subscriptions        → Create subscription
   GET    /:appId/subscriptions/:id    → Get single subscription
   PATCH  /:appId/subscriptions/:id    → Update subscription
   DELETE /:appId/subscriptions/:id    → Delete subscription
   ============================================ */

router.get("/:appId/subscriptions", AuthMiddleware, getAllSubscriptions);
router.post("/:appId/subscriptions", AuthMiddleware, verifyCSRFToken, createSubscription);
router.get("/:appId/subscriptions/:id", AuthMiddleware, verifyCSRFToken, getSubscriptionById);
router.patch("/:appId/subscriptions/:id", AuthMiddleware, verifyCSRFToken, updateSubscription);
router.delete("/:appId/subscriptions/:id", AuthMiddleware, verifyCSRFToken, deleteSubscription);

module.exports = router;