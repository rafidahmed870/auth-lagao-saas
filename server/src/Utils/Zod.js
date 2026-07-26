/**
 * ZOD VALIDATION FOR PREVENT SQL INJECTION
 * IF YOU UPDATE DATABASE SCHEMA YOU NEED TO UPDATE ZOD SCHEMA TOO
 */

const z = require("zod");

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

module.exports = {
  formateZodError,
  registerSchema,
  loginSchema,
};
