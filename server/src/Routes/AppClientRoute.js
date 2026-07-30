/**
 * APP CLIENT ROUTES
 * ─────────────────────────────────────────────────────────────────────────────
 * Routes consumed by end-user client applications (desktop apps, scripts, etc.)
 * Authentication is App-Key based, not cookie/JWT based.
 *
 * POST /init      → Validate App Key, get session token
 * POST /login     → Authenticate app user
 * POST /register  → Redeem license key and create app user
 * POST /logout    → Revoke client session
 * POST /check     → Verify session token is still valid
 * ─────────────────────────────────────────────────────────────────────────────
 */

const express = require("express");
const {
  initializeV1,
  loginV1,
  registerV1,
  logoutV1,
  checkV1,
} = require("../Controllers/AppClientController");

const router = express.Router();

router.post("/init",     initializeV1);
router.post("/login",    loginV1);
router.post("/register", registerV1);
router.post("/logout",   logoutV1);
router.post("/check",    checkV1);

module.exports = router;
