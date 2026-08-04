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
  serial,
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
  ownerId: uuid("owner_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  appName: varchar("app_name", { length: 255 }).notNull(),
  appDescription: text("app_description"),
  appVersion: varchar("app_version", { length: 50 }).notNull().default("1.0"),
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

/* ACL/ACCESS CONTROL LIST FOR APPLICATION/CLIENT LEVEL CONTROL [TEAM MANAGEMENT SYSTEM] */
const appLevelPermissions = pgTable("app_level_permissions", {
  id: serial("id").primaryKey(), // Auto-incrementing ID for app-level permissions because they are fixed and not user-defined
  permissionName: varchar("permission_name", { length: 100 }).notNull().unique(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

const appTeamMembers = pgTable("application_team_members", {
  id: uuid("id").defaultRandom().primaryKey(),
  appId: uuid("app_id").notNull().references(() => applications.id, { onDelete: "cascade" }),
  memberId: uuid("member_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  memberPermissions: text("member_permissions").array().notNull().default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

const licenses = pgTable("licenses", {
  id: uuid("id").defaultRandom().primaryKey(),
  appId: uuid("app_id")
    .notNull()
    .references(() => applications.id, { onDelete: "cascade" }),
  key: text("key").notNull().unique(),
  isUsed: boolean("is_used").notNull().default(false),   // has this key been redeemed?
  usedBy: uuid("used_by").default(null),                 // app_user id who redeemed it (no FK to avoid circular ref)
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

const appSubscriptions = pgTable("app_subscriptions", {
  id: uuid("id").defaultRandom().primaryKey(),
  appId: uuid("app_id")
    .notNull()
    .references(() => applications.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 50 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

const appUsers = pgTable("app_users", {
  id: uuid("id").defaultRandom().primaryKey(),
  appId: uuid("app_id")
    .notNull()
    .references(() => applications.id, { onDelete: "cascade" }),
  username: varchar("username", { length: 50}).notNull(),
  password: varchar("password", { length: 255}).notNull(),
  email: varchar("email", { length: 255}).unique(),
  isActive: boolean("is_active").notNull().default(true),

  /* HWID (Hardware ID) device lock */
  hwid: text("hwid").default(null), 
  hwidLocked: boolean("hwid_locked").notNull().default(false), 

  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
})

module.exports = {
  roles,
  permissions,
  rolePermissions,
  users,
  sessions,
  applications,
  licenses,
  appSubscriptions,
  appUsers,
  appLevelPermissions,
  appTeamMembers,
};
