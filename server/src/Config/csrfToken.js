/**
 * CSRF TOKEN & CSRF MIDDLEWARE
 * DO NOT EDIT THIS!
 */

const crypto = require("crypto");
const redisClient = require("../Utils/RedisClient");

exports.generateCSRFToken = async (id, sessionId, res) => {
    const csrfToken = crypto.randomBytes(16).toString("hex");
    const csrfTokenKey = `csrf:${id}:${sessionId}`;
    await redisClient.set(csrfTokenKey, csrfToken, {
        EX: 60 * 60, // 1 hour expiration
    });

    res.cookie("csrfToken", csrfToken, {
        httpOnly: false,
        secure: true,
        sameSite: "strict",
        maxAge: 60 * 60 * 1000, // 1 hour
    });

    return csrfToken;
};

exports.verifyCSRFToken = async (req, res, next) => {
    try {
        if (req.method === 'GET') {
            return next();
        }

        const userId = req.user.id;
        const sessionId = req.user.sessionId;

        const clientToken = req.headers['x-csrf-token'] || req.headers['x-xsrf-token'] || req.headers['csrf-token'];
        if (!clientToken) {
            return res.status(403).json({
                success: false,
                message: 'CSRF token missing. Please refresh the page.',
                code: 'CSRF_TOKEN_MISSING',
            });
        }

        const storedSession = await redisClient.get(`csrf:${userId}:${sessionId}`);
        if (!storedSession) {
            return res.status(403).json({
                success: false,
                message: 'Invalid or expired session. Please refresh the page.',
                code: 'CSRF_INVALID_SESSION',
            });
        }

        if (storedSession !== clientToken) {
            return res.status(403).json({
                success: false,
                message: 'CSRF token mismatch. Please refresh the page.',
                code: 'CSRF_TOKEN_MISMATCH',
            });
        }

        next();

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Internal server error during CSRF verification',
            code: 'CSRF_VERIFICATION_ERROR',
        });
    }
};

exports.revokeCSRFToken = async (id, sessionId) => {
    const csrfTokenKey = `csrf:${id}:${sessionId}`;
    await redisClient.del(csrfTokenKey);
};

exports.refreshCSRFToken = async (id, sessionId, res) => {
    await exports.revokeCSRFToken(id, sessionId);
    return await exports.generateCSRFToken(id, sessionId, res);
};