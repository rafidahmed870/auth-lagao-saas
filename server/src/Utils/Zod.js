/**
 * ZOD VALIDATION FOR PREVENT SQL INJECTION
 * IF YOU UPDATE DATABASE SCHEMA YOU NEED TO UPDATE ZOD SCHEMA TOO
 */

const z = require("zod");

/* HELPER FUNCTION FOR ZOD ERROR HANDLING */
const formateZodError = (zodError) => {
  let firstError = "Validation Error";
  let allErrors = [];
  if (zodError?.issues && Array.isArray(zodError.issues)) {
    allErrors = zodError.issues.map((issue) => ({
      field: issue.path ? issue.path.join(".") : "unknown",
      message: issue.message || "Validation error",
      code: issue.code,
    }));
    firstError = allErrors[0]?.message || "Validation Error";
  }
  return { firstError, allErrors };
};

const registerSchema = z.object({
  name: z
    .string()
    .min(3, "Name must be at least 3 characters long")
    .max(50, "Name must not exceed 50 characters"),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters long")
    .max(50, "Password must not exceed 50 characters"),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters long")
    .max(50, "Password must not exceed 50 characters"),
});

/* ============================================
   APPLICATION SCHEMAS
   ============================================ */

const createApplicationSchema = z.object({
  appName: z
    .string()
    .min(2, "App name must be at least 2 characters")
    .max(255, "App name must not exceed 255 characters"),
  appDescription: z
    .string()
    .max(1000, "Description must not exceed 1000 characters")
    .optional()
    .nullable(),
  appVersion: z
    .string()
    .max(50, "App version must not exceed 50 characters")
    .optional()
    .default("1.0"),
});

const updateApplicationSchema = z.object({
  appName: z
    .string()
    .min(2, "App name must be at least 2 characters")
    .max(255, "App name must not exceed 255 characters")
    .optional(),
  appDescription: z
    .string()
    .max(1000, "Description must not exceed 1000 characters")
    .optional()
    .nullable(),
  appVersion: z
    .string()
    .min(1, "App version is required")
    .max(50, "App version must not exceed 50 characters")
    .optional(),
  isActive: z.boolean().optional(),
});

/* ============================================
   LICENSE SCHEMAS
   ============================================ */

const createLicenseSchema = z.object({
  // key is optional — if omitted the server auto-generates one
  key: z
    .string()
    .max(500, "License key must not exceed 500 characters")
    .optional()
    .nullable(),
  // Optional customization hints used when auto-generating
  prefix: z
    .string()
    .max(20, "Prefix must not exceed 20 characters")
    .regex(/^[A-Za-z0-9_-]*$/, "Prefix may only contain letters, numbers, _ and -")
    .optional()
    .nullable(),
  suffix: z
    .string()
    .max(20, "Suffix must not exceed 20 characters")
    .regex(/^[A-Za-z0-9_-]*$/, "Suffix may only contain letters, numbers, _ and -")
    .optional()
    .nullable(),
  appSubscriptionId: z
    .string()
    .uuid("Invalid subscription ID")
    .optional()
    .nullable(),
  hwidLocked: z.boolean().optional().default(false),
  isOneTimeLogin: z.boolean().optional().default(false),
  expiresAt: z
    .string()
    .datetime({
      message: "Invalid expiration date format (ISO 8601 required)",
    }),
});

const updateLicenseSchema = z.object({
  key: z
    .string()
    .min(1, "License key is required")
    .max(500, "License key must not exceed 500 characters")
    .optional(),
  hwidLocked: z.boolean().optional(),
  isOneTimeLogin: z.boolean().optional(),
  expiresAt: z
    .string()
    .datetime({ message: "Invalid expiration date format (ISO 8601 required)" })
    .optional(),
});

/* ============================================
   APP USER SCHEMAS
   ============================================ */

const createAppUserSchema = z.object({
  username: z
    .string()
    .min(1, "Username must be at least 1 characters")
    .max(50, "Username must not exceed 50 characters"),
  password: z
    .string()
    .min(1, "Password must be at least 1 characters")
    .max(255, "Password must not exceed 255 characters"),
  email: z
    .string()
    .email("Invalid email address")
    .max(255, "Email must not exceed 255 characters")
    .optional()
    .nullable(),
  hwidLocked: z.boolean().optional().default(false),
  appSubscriptionId: z
    .string()
    .uuid("Invalid subscription ID")
    .optional()
    .nullable(),
  isOneTimeLogin: z.boolean().optional().default(false),
  expiresAt: z
    .string()
    .datetime({
      message: "Invalid expiration date format (ISO 8601 required)",
    }),
});

const updateAppUserSchema = z.object({
  username: z
    .string()
    .min(1, "Username must be at least 1 characters")
    .max(50, "Username must not exceed 50 characters")
    .optional(),
  password: z
    .string()
    .min(1, "Password must be at least 1 characters")
    .max(255, "Password must not exceed 255 characters")
    .optional(),
  email: z
    .string()
    .email("Invalid email address")
    .max(255, "Email must not exceed 255 characters")
    .optional()
    .nullable(),
  isActive: z.boolean().optional(),
  hwidLocked: z.boolean().optional(),
  appSubscriptionId: z
    .string()
    .uuid("Invalid subscription ID")
    .optional()
    .nullable(),
  isOneTimeLogin: z.boolean().optional(),
  expiresAt: z
    .string()
    .datetime({ message: "Invalid expiration date format (ISO 8601 required)" })
    .optional(),
});

/* ============================================
   SUBSCRIPTION SCHEMAS
   ============================================ */

const createSubscriptionSchema = z.object({
  name: z
    .string()
    .min(2, "Subscription name must be at least 2 characters")
    .max(50, "Subscription name must not exceed 50 characters"),
});

const updateSubscriptionSchema = z.object({
  name: z
    .string()
    .min(2, "Subscription name must be at least 2 characters")
    .max(50, "Subscription name must not exceed 50 characters")
    .optional(),
});

/* ============================================
   COMMON PARAM SCHEMAS
   ============================================ */

const uuidParamSchema = z.object({
  id: z.string().uuid("Invalid ID format"),
});

const appIdParamSchema = z.object({
  appId: z.string().uuid("Invalid Application ID format"),
});

const nestedParamSchema = z.object({
  appId: z.string().uuid("Invalid Application ID format"),
  id: z.string().uuid("Invalid ID format"),
});

/* ============================================
   TEAM MANAGEMENT SCHEMAS
   ============================================ */

/**
 * All permission slugs that can be assigned to a team member.
 * These map 1-to-1 with rows in the app_level_permissions table.
 * Format:  <resource>.<sub-resource?>.<action>
 */
const TEAM_PERMISSIONS = [
  // Application
  "app.view",
  "app.update",
  // Licenses
  "app.license.view",
  "app.license.create",
  "app.license.update",
  "app.license.delete",
  // End-users
  "app.user.view",
  "app.user.create",
  "app.user.update",
  "app.user.delete",
  "app.user.hwid.reset",
  // Subscriptions
  "app.subscription.view",
  "app.subscription.create",
  "app.subscription.update",
  "app.subscription.delete",
  // Team
  "app.team.view",
  "app.team.manage",
];

const inviteTeamMemberSchema = z.object({
  email: z.string().email("Invalid email address"),
  permissions: z
    .array(z.enum(TEAM_PERMISSIONS, { message: "Invalid permission slug" }))
    .min(1, "At least one permission must be assigned")
    .default([]),
});

const updateTeamMemberPermissionsSchema = z.object({
  permissions: z
    .array(z.enum(TEAM_PERMISSIONS, { message: "Invalid permission slug" }))
    .min(1, "At least one permission must be assigned"),
});

/* ============================================
   USER PROFILE UPDATE SCHEMAS
   ============================================ */

const updateNameSchema = z.object({
  name: z
    .string()
    .min(3, "Name must be at least 3 characters long")
    .max(50, "Name must not exceed 50 characters"),
});

const updateEmailSchema = z.object({
  email: z.string().email("Invalid email address"),
  currentPassword: z
    .string()
    .min(1, "Current password is required to change email"),
});

const updatePasswordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(6, "New password must be at least 6 characters long")
      .max(50, "New password must not exceed 50 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });


const newsletterSubscriptionSchema = z.object({
  email: z.string()
    .email("Invalid email address")
    .refine(
      (email) => email.endsWith('@gmail.com'),
      {
        message: "Only Gmail addresses are allowed"
      }
    )
});

module.exports = {
  formateZodError,
  registerSchema,
  loginSchema,

  /* User profile */
  updateNameSchema,
  updateEmailSchema,
  updatePasswordSchema,

  /* Application */
  createApplicationSchema,
  updateApplicationSchema,

  /* License */
  createLicenseSchema,
  updateLicenseSchema,

  /* App User */
  createAppUserSchema,
  updateAppUserSchema,

  /* Subscription */
  createSubscriptionSchema,
  updateSubscriptionSchema,

  /* Team */
  inviteTeamMemberSchema,
  updateTeamMemberPermissionsSchema,
  TEAM_PERMISSIONS,

  /* Param Schemas */
  uuidParamSchema,
  appIdParamSchema,
  nestedParamSchema,

  newsletterSubscriptionSchema,
};
