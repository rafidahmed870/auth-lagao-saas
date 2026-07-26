const { findUserById } = require("../Models/AuthModel");
const TryCatch = require("./TryCatch");
const jwt = require("jsonwebtoken");

exports.AuthMiddleware = TryCatch(async (req, res, next) => {
  const token = req.headers?.accessToken;
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Access token not found",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.APP_SECRET);
    if (!decoded) {
      return res.status(401).json({
        success: true,
        message: "Invalid Access Token",
      });
    }

    const getUser = await findUserById(decoded.id);

    if (getUser.tokenVersion !== decoded.tokenVersion) {
      return res.status(401).json({
        success: true,
        message: "Invalid Access Token",
      });
    }

    req.user = {
      id: decoded.id,
      sessionId: decoded.sessionId,
      tokenVersion: decoded.tokenVersion,
    };

    next();
  } catch {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired access token",
    });
  }
});
