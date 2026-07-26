const express = require("express");
const { register, login, refreshToken, refreshCSRF, logout, getMe } = require("../Controllers/AuthController");
const { verifyCSRFToken } = require("../Config/csrfToken");
const { AuthMiddleware } = require("../Middlewares/AuthMiddleware");
const router = express.Router();

router.post('/register', register);
router.post('/login', login);

router.post('/refresh/token', refreshToken);
router.post('/refresh/csrf', refreshCSRF);

router.post('/logout', verifyCSRFToken, logout);

router.get('/acount', AuthMiddleware, getMe);

module.exports = router;