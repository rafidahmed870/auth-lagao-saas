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

  /* Subscriptions */
  getAllSubscriptions,
  getSubscriptionById,
  createSubscription,
  updateSubscription,
  deleteSubscription,
} = require("../Controllers/ApplicationController");

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
router.post("/", AuthMiddleware, createApplication);
router.get("/:appId", AuthMiddleware, getApplicationById);
router.patch("/:appId", AuthMiddleware, updateApplication);
router.delete("/:appId", AuthMiddleware, deleteApplication);

/* ============================================
   LICENSE ROUTES (nested under /:appId/licenses)
   GET    /:appId/licenses        → Get all licenses
   POST   /:appId/licenses        → Create license
   GET    /:appId/licenses/:id    → Get single license
   PATCH  /:appId/licenses/:id    → Update license
   DELETE /:appId/licenses/:id    → Delete license
   ============================================ */

router.get("/:appId/licenses", AuthMiddleware, getAllLicenses);
router.post("/:appId/licenses", AuthMiddleware, createLicense);
router.get("/:appId/licenses/:id", AuthMiddleware, getLicenseById);
router.patch("/:appId/licenses/:id", AuthMiddleware, updateLicense);
router.delete("/:appId/licenses/:id", AuthMiddleware, deleteLicense);

/* ============================================
   APP USER ROUTES (nested under /:appId/users)
   GET    /:appId/users           → Get all app users
   POST   /:appId/users           → Create app user
   GET    /:appId/users/:id       → Get single app user
   PATCH  /:appId/users/:id       → Update app user
   DELETE /:appId/users/:id       → Delete app user
   ============================================ */

router.get("/:appId/users", AuthMiddleware, getAllAppUsers);
router.post("/:appId/users", AuthMiddleware, createAppUser);
router.get("/:appId/users/:id", AuthMiddleware, getAppUserById);
router.patch("/:appId/users/:id", AuthMiddleware, updateAppUser);
router.delete("/:appId/users/:id", AuthMiddleware, deleteAppUser);

/* ============================================
   SUBSCRIPTION ROUTES (nested under /:appId/subscriptions)
   GET    /:appId/subscriptions        → Get all subscriptions
   POST   /:appId/subscriptions        → Create subscription
   GET    /:appId/subscriptions/:id    → Get single subscription
   PATCH  /:appId/subscriptions/:id    → Update subscription
   DELETE /:appId/subscriptions/:id    → Delete subscription
   ============================================ */

router.get("/:appId/subscriptions", AuthMiddleware, getAllSubscriptions);
router.post("/:appId/subscriptions", AuthMiddleware, createSubscription);
router.get("/:appId/subscriptions/:id", AuthMiddleware, getSubscriptionById);
router.patch("/:appId/subscriptions/:id", AuthMiddleware, updateSubscription);
router.delete("/:appId/subscriptions/:id", AuthMiddleware, deleteSubscription);

module.exports = router;