const { revokeCSRFToken, refreshCSRFToken } = require("../Config/csrfToken");
const {
  generateToken,
  revokeRefreshToken,
  verifyRefreshToken,
  generateAccessToken,
} = require("../Config/generateToken");
const TryCatch = require("../Middlewares/TryCatch");
const {
  findUserByEmail,
  createUser,
  findUserById,
  updateUserName,
  updateUserEmail,
  updateUserPasswordAndBumpToken,
  removeGoogleId,
  removeDiscordId,
} = require("../Models/AuthModel");
const {
  registerSchema,
  formateZodError,
  loginSchema,
  updateNameSchema,
  updateEmailSchema,
  updatePasswordSchema,
} = require("../Utils/Zod");
const bcrypt = require("bcryptjs");

exports.register = TryCatch(async (req, res) => {
  const validation = registerSchema.safeParse(req.body);
  if (!validation.success) {
    const { firstError, allErrors } = formateZodError(validation.error);
    return res.status(400).json({
      success: false,
      message: firstError,
      errors: allErrors,
    });
  }

  const existingUser = await findUserByEmail(validation.data.email);
  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: "Email already exists",
    });
  }

  await createUser(validation.data);

  return res.status(201).json({
    success: true,
    message: "Registration Successful! Now You Can Login",
  });
});

exports.login = TryCatch(async (req, res) => {
  const validation = loginSchema.safeParse(req.body);
  if (!validation.success) {
    const { firstError, allErrors } = formateZodError(validation.error);
    return res.status(400).json({
      success: false,
      message: firstError,
      errors: allErrors,
    });
  }

  const { email, password } = validation.data;
  const user = await findUserByEmail(email);
  if (!user) {
    return res.status(400).json({
      success: false,
      message: "Invalid Credentials",
    });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res.status(400).json({
      success: false,
      message: "Invalid Credentials",
    });
  }

  await generateToken(user.id, user.tokenVersion, res);
  return res.status(200).json({
    success: true,
    message: `Welcome ${user.name}!`,
  });
});

exports.oauthCallback = TryCatch(async (req, res) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "OAuth authentication failed",
    });
  }

  await generateToken(req.user.id, req.user.tokenVersion, res);

  const redirectUrl = process.env.FRONTEND_URL
    ? `${process.env.FRONTEND_URL}/dashboard`
    : "/";

  return res.redirect(redirectUrl);
});

exports.logout = TryCatch(async (req, res) => {
  const userId = req.user.id;
  const sessionId = req.user.sessionId;

  await revokeRefreshToken(userId, sessionId);
  await revokeCSRFToken(userId, sessionId);

  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");
  res.clearCookie("csrfToken");

  res.status(200).json({
    success: true,
    message: "Logout Successfull!",
  });
});

exports.refreshToken = TryCatch(async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({
      success: false,
      message: "Refresh token not found",
    });
  }

  const decoded = await verifyRefreshToken(refreshToken);
  if (!decoded) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired refresh token",
    });
  }

  const user = await findUserById(decoded.id);
  if (!user) {
    return res.status(400).json({
      success: false,
      message: "User Not Found!",
    });
  }

  // Token Rotation || Token Version
  if (decoded.tokenVersion !== user.tokenVersion) {
    await revokeRefreshToken(user.id, decoded.sessionId);
    return res.status(401).json({
      success: false,
      message: "Improper token has been passed!",
    });
  }

  await generateAccessToken(
    decoded.id,
    decoded.sessionId,
    decoded.tokenVersion,
    res,
  );

  return res.status(200).json({
    success: true,
    message: "Token refreshed successfully",
  });
});

exports.refreshCSRF = TryCatch(async (req, res) => {
  const userId = req.user.id;
  const sessionId = req.user.sessionId;

  await refreshCSRFToken(userId, sessionId, res);

  return res.status(200).json({
    success: true,
    message: "CSRF token refreshed successfully",
  });
});

exports.getMe = TryCatch(async (req, res) => {
  const user = await findUserById(req.user.id);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  return res.status(200).json({
    success: true,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      googleId: user.googleId ?? null,
      discordId: user.discordId ?? null,
    },
  });
});

/* ============================================================
   USER PROFILE UPDATE HANDLERS
   ============================================================ */

exports.updateName = TryCatch(async (req, res) => {
  const validation = updateNameSchema.safeParse(req.body);
  if (!validation.success) {
    const { firstError, allErrors } = formateZodError(validation.error);
    return res.status(400).json({ success: false, message: firstError, errors: allErrors });
  }

  const updated = await updateUserName(req.user.id, validation.data.name);
  if (!updated) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  return res.status(200).json({
    success: true,
    message: "Name updated successfully",
    user: { id: updated.id, name: updated.name, email: updated.email, googleId: updated.googleId ?? null, discordId: updated.discordId ?? null },
  });
});

exports.updateEmail = TryCatch(async (req, res) => {
  const validation = updateEmailSchema.safeParse(req.body);
  if (!validation.success) {
    const { firstError, allErrors } = formateZodError(validation.error);
    return res.status(400).json({ success: false, message: firstError, errors: allErrors });
  }

  const { email, currentPassword } = validation.data;

  const user = await findUserById(req.user.id);
  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  // Email change requires password confirmation (OAuth-only users have no password)
  if (!user.password) {
    return res.status(400).json({
      success: false,
      message: "Your account uses social login. Set a password first to change your email.",
    });
  }

  const isValid = await bcrypt.compare(currentPassword, user.password);
  if (!isValid) {
    return res.status(400).json({ success: false, message: "Incorrect password" });
  }

  const existing = await findUserByEmail(email);
  if (existing && existing.id !== req.user.id) {
    return res.status(400).json({ success: false, message: "Email is already in use" });
  }

  const updated = await updateUserEmail(req.user.id, email);

  return res.status(200).json({
    success: true,
    message: "Email updated successfully",
    user: { id: updated.id, name: updated.name, email: updated.email, googleId: updated.googleId ?? null, discordId: updated.discordId ?? null },
  });
});

exports.updatePassword = TryCatch(async (req, res) => {
  const validation = updatePasswordSchema.safeParse(req.body);
  if (!validation.success) {
    const { firstError, allErrors } = formateZodError(validation.error);
    return res.status(400).json({ success: false, message: firstError, errors: allErrors });
  }

  const { currentPassword, newPassword } = validation.data;

  const user = await findUserById(req.user.id);
  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  if (!user.password) {
    return res.status(400).json({
      success: false,
      message: "Your account uses social login only. You cannot change a password that was never set.",
    });
  }

  const isValid = await bcrypt.compare(currentPassword, user.password);
  if (!isValid) {
    return res.status(400).json({ success: false, message: "Current password is incorrect" });
  }

  if (newPassword === currentPassword) {
    return res.status(400).json({ success: false, message: "New password must be different from current password" });
  }

  const hashed = await bcrypt.hash(newPassword, 10);
  await updateUserPasswordAndBumpToken(req.user.id, hashed, user.tokenVersion);

  // Revoke current session tokens — user must log in again
  await revokeRefreshToken(req.user.id, req.user.sessionId);
  await revokeCSRFToken(req.user.id, req.user.sessionId);
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");
  res.clearCookie("csrfToken");

  return res.status(200).json({
    success: true,
    message: "Password changed successfully. Please log in again.",
  });
});

exports.removeOAuth = TryCatch(async (req, res) => {
  const { provider } = req.params;

  if (!["google", "discord"].includes(provider)) {
    return res.status(400).json({ success: false, message: "Invalid OAuth provider" });
  }

  const user = await findUserById(req.user.id);
  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  // Must have a password before unlinking OAuth (so account is not locked out)
  if (!user.password) {
    return res.status(400).json({
      success: false,
      message: "Set a password before removing your only login method.",
    });
  }

  if (provider === "google") {
    if (!user.googleId) {
      return res.status(400).json({ success: false, message: "Google account is not linked" });
    }
    const updated = await removeGoogleId(req.user.id);
    return res.status(200).json({
      success: true,
      message: "Google account unlinked",
      user: { id: updated.id, name: updated.name, email: updated.email, googleId: null, discordId: updated.discordId ?? null },
    });
  }

  if (provider === "discord") {
    if (!user.discordId) {
      return res.status(400).json({ success: false, message: "Discord account is not linked" });
    }
    const updated = await removeDiscordId(req.user.id);
    return res.status(200).json({
      success: true,
      message: "Discord account unlinked",
      user: { id: updated.id, name: updated.name, email: updated.email, googleId: updated.googleId ?? null, discordId: null },
    });
  }
});
