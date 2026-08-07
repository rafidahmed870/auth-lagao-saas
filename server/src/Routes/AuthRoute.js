const express = require("express");
const passport = require("../Config/passport");
const {
  register,
  login,
  refreshToken,
  refreshCSRF,
  logout,
  getMe,
  oauthCallback,
  updateName,
  updateEmail,
  updatePassword,
  removeOAuth,
} = require("../Controllers/AuthController");
const { verifyCSRFToken } = require("../Config/csrfToken");
const { AuthMiddleware } = require("../Middlewares/AuthMiddleware");
const router = express.Router();

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] }),
);
router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL}/login`,
  }),
  oauthCallback,
);
router.get(
  "/discord",
  passport.authenticate("discord", { scope: ["identify", "email"] }),
);
router.get(
  "/discord/callback",
  passport.authenticate("discord", {
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL}/login`,
  }),
  oauthCallback,
);
router.post("/register", register);
router.post("/login", login);

router.post("/refresh/token", refreshToken);
router.post("/refresh/csrf", AuthMiddleware, refreshCSRF);

router.post("/logout", AuthMiddleware, verifyCSRFToken, logout);

router.get("/account", AuthMiddleware, getMe);

/* ── User Profile Update ─────────────────────────────────── */
router.patch("/account/name",     AuthMiddleware, verifyCSRFToken, updateName);
router.patch("/account/email",    AuthMiddleware, verifyCSRFToken, updateEmail);
router.patch("/account/password", AuthMiddleware, verifyCSRFToken, updatePassword);
router.delete("/account/oauth/:provider", AuthMiddleware, verifyCSRFToken, removeOAuth);

module.exports = router;
