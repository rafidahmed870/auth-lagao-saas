/**
 * JWT TOKEN & TOKEN VALIDATE FUNCTIONS
 * DO NOT EDIT THIS!
 */

const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { db } = require("../DB/database");
const { sessions } = require("../DB/schema");
const { and, gte, eq } = require("drizzle-orm");

const APP_SECRET = process.env.APP_SECRET ?? null;
if (!APP_SECRET) {
  throw new Error("APP_SECRET is not defined in the environment variables.");
}

exports.generateToken = async (id, tokenVersion, res) => {
  const sessionId = crypto
    .randomBytes(16)
    .toString("hex"); /* SessionId stands for multi device login support */
  const accessToken = jwt.sign(
    {
      id,
      tokenVersion,
      sessionId,
    },
    APP_SECRET,
    { expiresIn: "1h" },
  );

  const refreshToken = jwt.sign(
    {
      id,
      tokenVersion,
      sessionId,
    },
    APP_SECRET,
    { expiresIn: "1h" },
  );

  await db.insert(sessions).values({
    sessionId,
    userId: id,
    refreshToken,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), //  7 day expiry
  });

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    maxAge: 60 * 60 * 1000, // 1 hour
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 day expiry
  });

  return { accessToken, refreshToken };
};

exports.verifyRefreshToken = async (refreshToken) => {
  try {
    const decoded = jwt.verify(refreshToken, APP_SECRET);
    if (!decoded || !decoded.id || !decoded.tokenVersion || !decoded.sessionId) {
      return null;
    }

    const validSession = await db
      .select()
      .from(sessions)
      .where(
        and(
          eq(sessions.sessionId, decoded.sessionId),
          eq(sessions.userId, decoded.id),
          gte(sessions.expiresAt, new Date()),
        ),
      );

    if (!validSession || validSession.length === 0) {
      return null;
    }
    return decoded;
  } catch {
    throw new Error("Invalid Refresh Token!");
  }
};

exports.generateAccessToken = async (id, sessionId, tokenVersion, res) => {
    const accessToken = jwt.sign(
    {
      id,
      tokenVersion,
      sessionId,
    },
    APP_SECRET,
    { expiresIn: "1h" },
  );

   res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    maxAge: 60 * 60 * 1000, // 1 hour
  });

  return accessToken;
};

exports.revokeRefreshToken = async (id, sessionId) => {
    await db.delete(sessions).where(and(eq(sessions.userId, id), eq(sessions.sessionId, sessionId)));
}