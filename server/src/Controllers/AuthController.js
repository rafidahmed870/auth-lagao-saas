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
} = require("../Models/AuthModel");
const {
  registerSchema,
  formateZodError,
  loginSchema,
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
    },
  });
});
