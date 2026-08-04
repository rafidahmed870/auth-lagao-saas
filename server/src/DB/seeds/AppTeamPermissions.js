/**
 * SEED: app_level_permissions
 * ─────────────────────────────────────────────────────────────────────────────
 * Populates the app_level_permissions catalogue with all built-in ACL slugs.
 * Run with:  node server/src/DB/seeds/AppTeamPermissions.js
 *
 * Safe to re-run — uses INSERT … ON CONFLICT DO NOTHING so existing rows are
 * left untouched.  New slugs added here will be inserted on the next run.
 * ─────────────────────────────────────────────────────────────────────────────
 */

require("dotenv").config({ path: require("path").resolve(__dirname, "../../../.env") });

const { db, pool } = require("../database");
const { appLevelPermissions } = require("../schema");

/* ─── Permission catalogue ────────────────────────────────────────────────── */

const PERMISSIONS = [
  // ── Application ───────────────────────────────────────────────────────────
  {
    permissionName: "app.view",
    description:    "View application details, version, and status.",
  },
  {
    permissionName: "app.update",
    description:    "Edit application name, description, version, and toggle active state.",
  },

  // ── Licenses ──────────────────────────────────────────────────────────────
  {
    permissionName: "app.license.view",
    description:    "View all license keys and their expiry / redemption status.",
  },
  {
    permissionName: "app.license.create",
    description:    "Generate new license keys for the application.",
  },
  {
    permissionName: "app.license.update",
    description:    "Edit existing license keys (e.g. extend expiry date).",
  },
  {
    permissionName: "app.license.delete",
    description:    "Permanently delete license keys.",
  },

  // ── End-users ─────────────────────────────────────────────────────────────
  {
    permissionName: "app.user.view",
    description:    "View end-users registered under the application.",
  },
  {
    permissionName: "app.user.create",
    description:    "Manually create end-user accounts.",
  },
  {
    permissionName: "app.user.update",
    description:    "Edit end-user details, status, and expiry.",
  },
  {
    permissionName: "app.user.delete",
    description:    "Delete end-user accounts.",
  },
  {
    permissionName: "app.user.hwid.reset",
    description:    "Clear the bound hardware ID for an end-user account.",
  },

  // ── Subscriptions ─────────────────────────────────────────────────────────
  {
    permissionName: "app.subscription.view",
    description:    "View subscription tiers defined for the application.",
  },
  {
    permissionName: "app.subscription.create",
    description:    "Create new subscription tiers.",
  },
  {
    permissionName: "app.subscription.update",
    description:    "Rename or modify existing subscription tiers.",
  },
  {
    permissionName: "app.subscription.delete",
    description:    "Delete subscription tiers.",
  },

  // ── Team ──────────────────────────────────────────────────────────────────
  {
    permissionName: "app.team.view",
    description:    "View the team member list and their assigned permissions.",
  },
  {
    permissionName: "app.team.manage",
    description:    "Invite, update, or remove team members and their permissions.",
  },
];

/* ─── Runner ──────────────────────────────────────────────────────────────── */

async function seed() {
  console.log("🌱  Seeding app_level_permissions …\n");

  let inserted = 0;
  let skipped  = 0;

  for (const perm of PERMISSIONS) {
    try {
      /* INSERT … ON CONFLICT DO NOTHING — idempotent */
      await db
        .insert(appLevelPermissions)
        .values(perm)
        .onConflictDoNothing();

      console.log(`  ✅  ${perm.permissionName}`);
      inserted++;
    } catch (err) {
      console.warn(`  ⚠️   ${perm.permissionName} — skipped (${err.message})`);
      skipped++;
    }
  }

  console.log(`\n  Done — ${inserted} inserted, ${skipped} skipped.`);
}

seed()
  .then(() => {
    console.log("\n✅  Seed complete.");
    process.exit(0);
  })
  .catch((err) => {
    console.error("\n❌  Seed failed:", err);
    process.exit(1);
  })
  .finally(() => pool.end());
