const { eq } = require("drizzle-orm");
const { db } = require("../DB/database");
const { users } = require("../DB/schema");
const bcrypt = require("bcryptjs");

exports.findUserByEmail = async (email) => {
  const user = await db.select().from(users).where(eq(users.email, email));
  return user[0] || null;
};

exports.findUserById = async (id) => {
  const user = await db.select().from(users).where(eq(users.id, id));
  return user[0] || null;
};

exports.findUserByGoogleId = async (googleId) => {
  const user = await db.select().from(users).where(eq(users.googleId, googleId));
  return user[0] || null;
};

exports.findUserByDiscordId = async (discordId) => {
  const user = await db.select().from(users).where(eq(users.discordId, discordId));
  return user[0] || null;
};

exports.createUser = async (data) => {
  const { name, email, password } = data;
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = await db.insert(users).values({ name, email, password: hashedPassword });
  return newUser[0];
};

exports.createOAuthUser = async ({ name, email, googleId, discordId }) => {
  const newUser = await db
    .insert(users)
    .values({ name, email, googleId: googleId || null, discordId: discordId || null, password: null })
    .returning();
  return newUser[0];
};

exports.linkGoogleId = async (userId, googleId) => {
  const updated = await db
    .update(users)
    .set({ googleId })
    .where(eq(users.id, userId))
    .returning();
  return updated[0];
};

exports.linkDiscordId = async (userId, discordId) => {
  const updated = await db
    .update(users)
    .set({ discordId })
    .where(eq(users.id, userId))
    .returning();
  return updated[0];
};

exports.updateUserName = async (userId, name) => {
  const updated = await db
    .update(users)
    .set({ name })
    .where(eq(users.id, userId))
    .returning();
  return updated[0];
};

exports.updateUserEmail = async (userId, email) => {
  const updated = await db
    .update(users)
    .set({ email })
    .where(eq(users.id, userId))
    .returning();
  return updated[0];
};

exports.updateUserPasswordAndBumpToken = async (userId, hashedPassword, currentTokenVersion) => {
  // Bump tokenVersion to invalidate all existing sessions after password change
  const updated = await db
    .update(users)
    .set({ password: hashedPassword, tokenVersion: currentTokenVersion + 1 })
    .where(eq(users.id, userId))
    .returning();
  return updated[0];
};

exports.removeGoogleId = async (userId) => {
  const updated = await db
    .update(users)
    .set({ googleId: null })
    .where(eq(users.id, userId))
    .returning();
  return updated[0];
};

exports.removeDiscordId = async (userId) => {
  const updated = await db
    .update(users)
    .set({ discordId: null })
    .where(eq(users.id, userId))
    .returning();
  return updated[0];
};