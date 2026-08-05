/**
 * useAppAccess
 * ─────────────────────────────────────────────────────────────────────────────
 * Convenience hook that surfaces everything a dashboard page needs to enforce
 * per-application ACL without repeating the same logic in every component.
 *
 * Usage
 * ─────
 *   const { isOwner, hasPermission, role, permissions, selectedApp } = useAppAccess();
 *
 *   // guard a whole page
 *   if (!hasPermission("app.license.view")) return <AccessDenied />;
 *
 *   // conditionally show a write button
 *   {hasPermission("app.license.create") && <button>Add License</button>}
 *
 * Permission slugs (mirrors TEAM_PERMISSIONS in Zod.js / AppTeamPermissions seed)
 * ──────────────────
 *   app.view                    app.update
 *   app.license.view            app.license.create   app.license.update   app.license.delete
 *   app.user.view               app.user.create      app.user.update      app.user.delete      app.user.hwid.reset
 *   app.subscription.view       app.subscription.create  app.subscription.update  app.subscription.delete
 *   app.team.view               app.team.manage
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useClient } from "@/context/ClientContext";

export function useAppAccess() {
  const { selectedApp, selectedAppAccess, hasPermission } = useClient();

  const role        = selectedAppAccess?.role        ?? null;   // "owner" | "member" | null
  const permissions = selectedAppAccess?.permissions ?? [];     // string[]
  const isOwner     = role === "owner";
  const isMember    = role === "member";

  return {
    /** The currently active application object (may be null if none selected). */
    selectedApp,

    /** "owner" | "member" | null */
    role,

    /** Raw permissions array — empty for owners (they hold all rights). */
    permissions,

    /** True when the authenticated user owns this application. */
    isOwner,

    /** True when the user is a team member (not the owner). */
    isMember,

    /**
     * Returns true when the user is allowed to perform the given action.
     *   - Owners always return true.
     *   - Members return true only if the slug is in their permissions.
     *   - Pass a string OR an array of strings (OR semantics — any match returns true).
     *
     * @param {string | string[]} slugOrSlugs
     */
    hasPermission,
  };
}
