/**
 * SCHEMA FILE FOR CONNECTION BETWEEN DRIZZLE AND POSTGRESQL
 * IF YOU WON'T CHANGE IN DATABASE SO DO NOT EDIT THIS!
 */

const {
  pgTable,
  uuid,
  integer,
  varchar,
  timestamp,
  text,
  boolean,
} = require("drizzle-orm/pg-core");

/* PLATFORM USERS ROLE BASED PERMISSION TABLE */
const roles = pgTable("roles", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 50 }).notNull().unique(),
  description: text("description"),
});

const permissions = pgTable("permissions", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  description: text("description"),
});

const rolePermissions = pgTable("role_permissions", {
  id: uuid("id").defaultRandom().primaryKey(),
  roleId: uuid("role_id").references(() => roles.id),
  permissionId: uuid("permission_id").references(() => permissions.id),
});

/* PLATFORM USERS TABLE */
const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", {
    length: 255,
  }) /* DEFAULT NULL FOR GOOGLE AND DISCORD LOGIN CONFIGURATION */,
  tokenVersion: integer("token_version").default(1).notNull(),
  roleId: uuid("role_id").references(() => roles.id),
  googleId: varchar("google_id", { length: 255 }).unique(),
  discordId: varchar("discord_id", { length: 255 }).unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

/* SESSIONS TABLE TO STORE REFRESH TOKENS */
const sessions = pgTable("sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  sessionId: varchar("session_id", { length: 255 }).notNull().unique(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  refreshToken: text("refresh_token").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
  expiresAt: timestamp("expires_at").notNull(),
});

/* CLIENTS APPLICATION */
const applications = pgTable("applications", {
  id: uuid("id").defaultRandom().primaryKey(),
  ownerId: uuid("owner_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  appName: varchar("app_name", { length: 255 }).notNull(),
  appDescription: text("app_description"),
  appVersion: varchar("app_version", { length: 50 }).notNull(),
  isActive: boolean("is_active").notNull().default(true),

  appKey: text("app_key").notNull(), // Public key that will provided
  encryptedPrivateKey: text("encrypted_private_key").notNull(), // base64
  privateKeyIv: text("private_key_iv").notNull(), // base64
  privateKeyAuthTag: text("private_key_auth_tag").notNull(), // base64
  keyVersion: integer("key_version").notNull().default(1),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

module.exports = {
  roles,
  permissions,
  rolePermissions,
  users,
  sessions,
};
