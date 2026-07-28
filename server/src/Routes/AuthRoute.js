const express = require("express");
const { register, login, refreshToken, refreshCSRF, logout, getMe } = require("../Controllers/AuthController");
const { verifyCSRFToken } = require("../Config/csrfToken");
const { AuthMiddleware } = require("../Middlewares/AuthMiddleware");
const router = express.Router();

router.post('/register', register);
router.post('/login', login);

router.post('/refresh/token', refreshToken);
router.post('/refresh/csrf', AuthMiddleware, refreshCSRF);

router.post('/logout', AuthMiddleware, verifyCSRFToken, logout);

router.get('/account', AuthMiddleware, getMe);

module.exports = router;