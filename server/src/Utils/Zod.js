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
  key: z
    .string()
    .min(1, "License key is required")
    .max(500, "License key must not exceed 500 characters"),
  expiresAt: z
    .string()
    .datetime({ message: "Invalid expiration date format (ISO 8601 required)" }),
});

const updateLicenseSchema = z.object({
  key: z
    .string()
    .min(1, "License key is required")
    .max(500, "License key must not exceed 500 characters")
    .optional(),
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
    .min(3, "Username must be at least 3 characters")
    .max(50, "Username must not exceed 50 characters"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(255, "Password must not exceed 255 characters"),
  email: z
    .string()
    .email("Invalid email address")
    .max(255, "Email must not exceed 255 characters")
    .optional()
    .nullable(),
  hwidLocked: z.boolean().optional().default(false),
  expiresAt: z
    .string()
    .datetime({ message: "Invalid expiration date format (ISO 8601 required)" }),
});

const updateAppUserSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(50, "Username must not exceed 50 characters")
    .optional(),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
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

module.exports = {
  formateZodError,
  registerSchema,
  loginSchema,

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

  /* Param Schemas */
  uuidParamSchema,
  appIdParamSchema,
  nestedParamSchema,
};

