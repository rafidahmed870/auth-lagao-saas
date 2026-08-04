import { useClient } from "@/context/ClientContext";
import { useAuth } from "@/context/AuthContext";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { motion, AnimatePresence } from "framer-motion";
import {
  UsersRound, UserPlus, Trash2, Shield, ShieldCheck, ShieldOff,
  AlertCircle, X, Check, Pencil, Search, Mail, Crown,
  Eye, Key, Users, CreditCard, Settings,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { cn } from "@/lib/utils";

// ── Permission catalogue (client-side definition, matches server TEAM_PERMISSIONS) ──
const ALL_PERMISSIONS = [
  // Application
  { slug: "app.view",                  label: "View App",              icon: Eye,         group: "Application"   },
  { slug: "app.update",                label: "Update App",            icon: Settings,    group: "Application"   },
  // Licenses
  { slug: "app.license.view",          label: "View Licenses",         icon: Eye,         group: "Licenses"      },
  { slug: "app.license.create",        label: "Create Licenses",       icon: Key,         group: "Licenses"      },
  { slug: "app.license.update",        label: "Update Licenses",       icon: Key,         group: "Licenses"      },
  { slug: "app.license.delete",        label: "Delete Licenses",       icon: Trash2,      group: "Licenses"      },
  // End-users
  { slug: "app.user.view",             label: "View Users",            icon: Eye,         group: "Users"         },
  { slug: "app.user.create",           label: "Create Users",          icon: UserPlus,    group: "Users"         },
  { slug: "app.user.update",           label: "Update Users",          icon: Users,       group: "Users"         },
  { slug: "app.user.delete",           label: "Delete Users",          icon: Trash2,      group: "Users"         },
  { slug: "app.user.hwid.reset",       label: "Reset HWID",            icon: Shield,      group: "Users"         },
  // Subscriptions
  { slug: "app.subscription.view",     label: "View Subscriptions",    icon: Eye,         group: "Subscriptions" },
  { slug: "app.subscription.create",   label: "Create Subscriptions",  icon: CreditCard,  group: "Subscriptions" },
  { slug: "app.subscription.update",   label: "Update Subscriptions",  icon: CreditCard,  group: "Subscriptions" },
  { slug: "app.subscription.delete",   label: "Delete Subscriptions",  icon: Trash2,      group: "Subscriptions" },
  // Team
  { slug: "app.team.view",             label: "View Team",             icon: UsersRound,  group: "Team"          },
  { slug: "app.team.manage",           label: "Manage Team",           icon: Settings,    group: "Team"          },
];

const PERMISSION_GROUPS = ["Application", "Licenses", "Users", "Subscriptions", "Team"];

// ── Helpers ───────────────────────────────────────────────────────────────────
const getInitials = (name = "") =>
  name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

const AVATAR_COLORS = [
  "bg-violet-500/20 text-violet-400 border-violet-500/30",
  "bg-blue-500/20 text-blue-400 border-blue-500/30",
  "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  "bg-amber-500/20 text-amber-400 border-amber-500/30",
  "bg-rose-500/20 text-rose-400 border-rose-500/30",
  "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
];

const avatarColor = (name = "") => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
};

// ── Permission Toggle Grid ────────────────────────────────────────────────────
function PermissionGrid({ selected, onChange, disabled = false }) {
  const toggle = (slug) => {
    if (disabled) return;
    onChange(
      selected.includes(slug) ? selected.filter((s) => s !== slug) : [...selected, slug]
    );
  };

  return (
    <div className="space-y-3">
      {PERMISSION_GROUPS.map((group) => {
        const perms = ALL_PERMISSIONS.filter((p) => p.group === group);
        return (
          <div key={group}>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-1.5 px-0.5">
              {group}
            </p>
            <div className="grid grid-cols-2 gap-1.5">
              {perms.map(({ slug, label, icon: Icon }) => {
                const active = selected.includes(slug);
                return (
                  <button
                    key={slug}
                    type="button"
                    onClick={() => toggle(slug)}
                    disabled={disabled}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-all duration-150",
                      active
                        ? "bg-primary/15 border-primary/40 text-primary"
                        : "bg-secondary/20 border-border text-muted-foreground hover:border-border/80 hover:text-foreground",
                      disabled && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    <div className={cn(
                      "w-4 h-4 rounded flex items-center justify-center shrink-0 border",
                      active ? "bg-primary/20 border-primary/40" : "border-border"
                    )}>
                      {active
                        ? <Check className="w-2.5 h-2.5 text-primary" />
                        : <Icon className="w-2.5 h-2.5 text-muted-foreground/50" />}
                    </div>
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Invite Member Dialog ──────────────────────────────────────────────────────
function InviteDialog({ appId, open, onClose }) {
  const { inviteTeamMember } = useClient();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [permissions, setPermissions] = useState(["app.license.view", "app.user.view"]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) { toast.error("Email is required"); return; }
    if (permissions.length === 0) { toast.error("Select at least one permission"); return; }
    setLoading(true);
    const res = await inviteTeamMember(appId, { email: email.trim(), permissions });
    setLoading(false);
    if (res?.success) {
      toast.success("Team member added successfully!");
      setEmail("");
      setPermissions(["app.license.view", "app.user.view"]);
      onClose();
    } else {
      toast.error(res?.message || "Failed to invite member");
    }
  };

  const selectAll = () => setPermissions(ALL_PERMISSIONS.map((p) => p.slug));
  const clearAll  = () => setPermissions([]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            key="bd"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            key="dlg"
            initial={{ opacity: 0, scale: 0.95, y: 14 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 14 }}
            transition={{ duration: 0.18 }}
            className="relative z-10 w-full max-w-lg rounded-2xl border border-border bg-card shadow-2xl shadow-black/50 max-h-[90vh] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-border shrink-0">
              <div>
                <h2 className="text-base font-bold font-space-grotesk text-foreground">Add Team Member</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Invite a registered user and set their permissions.
                </p>
              </div>
              <button onClick={onClose} className="cursor-pointer p-1.5 rounded-md hover:bg-accent/60 text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                  Email address <span className="text-destructive">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="team@example.com"
                    autoFocus
                    className="w-full bg-secondary/30 border border-border rounded-lg py-2.5 pl-9 pr-3.5 text-sm text-foreground focus:outline-none focus:border-primary transition-colors placeholder:text-muted-foreground/40"
                  />
                </div>
                <p className="text-[11px] text-muted-foreground mt-1.5">
                  The user must already have an Auth Lagao account.
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-medium text-muted-foreground">
                    Permissions <span className="text-destructive">*</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={selectAll} className="text-[10px] text-primary hover:underline">All</button>
                    <span className="text-muted-foreground/40 text-[10px]">·</span>
                    <button type="button" onClick={clearAll} className="text-[10px] text-muted-foreground hover:text-foreground hover:underline">None</button>
                  </div>
                </div>
                <PermissionGrid selected={permissions} onChange={setPermissions} />
              </div>

              <div className="flex gap-3 pt-1 shrink-0">
                <button type="button" onClick={onClose} className="cursor-pointer flex-1 py-2.5 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-accent/60 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={loading} className="cursor-pointer flex-1 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold font-space-grotesk hover:bg-primary/80 transition-colors disabled:opacity-60">
                  {loading ? "Adding…" : "Add Member"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// ── Edit Permissions Dialog ───────────────────────────────────────────────────
function EditPermissionsDialog({ appId, member, open, onClose }) {
  const { updateTeamMember } = useClient();
  const [loading, setLoading] = useState(false);
  const [permissions, setPermissions] = useState(member?.memberPermissions ?? []);

  // Sync when member changes
  useEffect(() => {
    if (member) setPermissions(member.memberPermissions ?? []);
  }, [member]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (permissions.length === 0) { toast.error("Select at least one permission"); return; }
    setLoading(true);
    const res = await updateTeamMember(appId, member.id, { permissions });
    setLoading(false);
    if (res?.success) {
      toast.success("Permissions updated!");
      onClose();
    } else {
      toast.error(res?.message || "Failed to update permissions");
    }
  };

  if (!member) return null;

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            key="bd"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            key="dlg"
            initial={{ opacity: 0, scale: 0.95, y: 14 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 14 }}
            transition={{ duration: 0.18 }}
            className="relative z-10 w-full max-w-lg rounded-2xl border border-border bg-card shadow-2xl shadow-black/50 max-h-[90vh] flex flex-col"
          >
            <div className="flex items-center justify-between px-6 py-5 border-b border-border shrink-0">
              <div>
                <h2 className="text-base font-bold font-space-grotesk text-foreground">Edit Permissions</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Updating access for <span className="text-foreground font-medium">{member.name}</span>
                </p>
              </div>
              <button onClick={onClose} className="cursor-pointer p-1.5 rounded-md hover:bg-accent/60 text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto">
              {/* Member preview */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/20 border border-border">
                <div className={cn("w-9 h-9 rounded-full border flex items-center justify-center shrink-0 text-xs font-bold font-space-grotesk", avatarColor(member.name))}>
                  {getInitials(member.name)}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground font-space-grotesk truncate">{member.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{member.email}</p>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-medium text-muted-foreground">Permissions</label>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => setPermissions(ALL_PERMISSIONS.map((p) => p.slug))} className="text-[10px] text-primary hover:underline">All</button>
                    <span className="text-muted-foreground/40 text-[10px]">·</span>
                    <button type="button" onClick={() => setPermissions([])} className="text-[10px] text-muted-foreground hover:text-foreground hover:underline">None</button>
                  </div>
                </div>
                <PermissionGrid selected={permissions} onChange={setPermissions} />
              </div>

              <div className="flex gap-3 pt-1">
                <button type="button" onClick={onClose} className="cursor-pointer flex-1 py-2.5 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-accent/60 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={loading} className="cursor-pointer flex-1 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold font-space-grotesk hover:bg-primary/80 transition-colors disabled:opacity-60">
                  {loading ? "Saving…" : "Save Changes"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// ── Permission Pills (inline display) ────────────────────────────────────────
function PermissionPills({ permissions }) {
  const visible = permissions.slice(0, 3);
  const overflow = permissions.length - 3;

  return (
    <div className="flex flex-wrap items-center gap-1">
      {visible.map((slug) => {
        const def = ALL_PERMISSIONS.find((p) => p.slug === slug);
        return (
          <span
            key={slug}
            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-primary/10 border border-primary/20 text-[10px] text-primary font-medium"
          >
            {def ? def.label : slug}
          </span>
        );
      })}
      {overflow > 0 && (
        <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-secondary/40 border border-border text-[10px] text-muted-foreground font-medium">
          +{overflow} more
        </span>
      )}
      {permissions.length === 0 && (
        <span className="text-[10px] text-muted-foreground italic">No permissions</span>
      )}
    </div>
  );
}

// ── Member Row ────────────────────────────────────────────────────────────────
function MemberRow({ member, appId, isOwner, onEdit, onRemove }) {
  const [removeOpen, setRemoveOpen] = useState(false);
  const [removing, setRemoving] = useState(false);

  const handleRemove = async () => {
    setRemoving(true);
    const res = await onRemove(appId, member.id);
    setRemoving(false);
    if (res?.success) {
      setRemoveOpen(false);
    } else {
      toast.error(res?.message || "Failed to remove member");
    }
  };

  const hasFullAccess = ALL_PERMISSIONS.every((p) =>
    member.memberPermissions.includes(p.slug)
  );

  return (
    <>
      <motion.tr
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="border-b border-border/50 group hover:bg-accent/20 transition-colors"
      >
        {/* Member info */}
        <td className="py-3.5 px-4">
          <div className="flex items-center gap-3">
            <div className={cn("w-8 h-8 rounded-full border flex items-center justify-center shrink-0 text-xs font-bold font-space-grotesk", avatarColor(member.name))}>
              {getInitials(member.name)}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground font-space-grotesk truncate">{member.name}</p>
              <p className="text-xs text-muted-foreground truncate">{member.email}</p>
            </div>
          </div>
        </td>

        {/* Access level badge */}
        <td className="py-3.5 px-4 hidden sm:table-cell">
          <span className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold border",
            hasFullAccess
              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
              : member.memberPermissions.length > 0
              ? "bg-primary/10 text-primary border-primary/20"
              : "bg-secondary/40 text-muted-foreground border-border"
          )}>
            {hasFullAccess ? <ShieldCheck className="w-3 h-3" /> : member.memberPermissions.length > 0 ? <Shield className="w-3 h-3" /> : <ShieldOff className="w-3 h-3" />}
            {hasFullAccess ? "Full Access" : member.memberPermissions.length > 0 ? "Custom" : "No Access"}
          </span>
        </td>

        {/* Permission pills */}
        <td className="py-3.5 px-4 hidden lg:table-cell max-w-xs">
          <PermissionPills permissions={member.memberPermissions} />
        </td>

        {/* Joined date */}
        <td className="py-3.5 px-4 hidden xl:table-cell">
          <span className="text-xs text-muted-foreground">
            {new Date(member.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
          </span>
        </td>

        {/* Actions */}
        <td className="py-3.5 px-4">
          {isOwner && (
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => onEdit(member)}
                className="cursor-pointer p-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all duration-150"
                title="Edit permissions"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setRemoveOpen(true)}
                className="cursor-pointer p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-150"
                title="Remove member"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </td>
      </motion.tr>

      <ConfirmDialog
        open={removeOpen}
        onOpenChange={setRemoveOpen}
        title="Remove Team Member"
        description={`Remove ${member.name} from this application? They will lose all access immediately.`}
        confirmLabel="Remove"
        variant="destructive"
        loading={removing}
        onConfirm={handleRemove}
      />
    </>
  );
}

// ── Stats cards ───────────────────────────────────────────────────────────────
function StatCard({ label, value, icon: Icon, color, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35 }}
      className="rounded-xl border border-border bg-card/60 p-5 flex items-start justify-between"
    >
      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{label}</p>
        <p className="text-2xl font-bold font-space-grotesk text-foreground">{value}</p>
      </div>
      <div className={cn("p-2.5 rounded-lg", color)}>
        <Icon className="w-4 h-4" />
      </div>
    </motion.div>
  );
}

// ── Owner row (always pinned at top of table) ─────────────────────────────────
function OwnerRow({ user }) {
  return (
    <tr className="border-b border-border/50 bg-primary/5">
      <td className="py-3.5 px-4">
        <div className="flex items-center gap-3">
          <div className={cn("w-8 h-8 rounded-full border flex items-center justify-center shrink-0 text-xs font-bold font-space-grotesk", avatarColor(user?.name ?? ""))}>
            {getInitials(user?.name ?? "?")}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-foreground font-space-grotesk truncate">{user?.name}</p>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-[9px] text-amber-400 font-semibold">
                <Crown className="w-2.5 h-2.5" /> Owner
              </span>
            </div>
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
          </div>
        </div>
      </td>
      <td className="py-3.5 px-4 hidden sm:table-cell">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold border bg-amber-500/10 text-amber-400 border-amber-500/20">
          <ShieldCheck className="w-3 h-3" /> Full Access
        </span>
      </td>
      <td className="py-3.5 px-4 hidden lg:table-cell">
        <span className="text-[10px] text-muted-foreground italic">All permissions</span>
      </td>
      <td className="py-3.5 px-4 hidden xl:table-cell" />
      <td className="py-3.5 px-4" />
    </tr>
  );
}

// ── Main Team page ────────────────────────────────────────────────────────────
function TeamContent() {
  const { user } = useAuth();
  const {
    selectedApp,
    applications,
    teamMembers,
    teamLoading,
    fetchTeamMembers,
    removeTeamMember,
  } = useClient();

  const [search, setSearch]     = useState("");
  const [inviteOpen, setInviteOpen] = useState(false);
  const [editMember, setEditMember] = useState(null);

  // Determine if the logged-in user is the owner of the selected app
  const isOwner = selectedApp?.ownerId === user?.id ||
    (selectedApp && applications.find((a) => a.id === selectedApp.id)?.ownerId === user?.id);

  useEffect(() => {
    if (selectedApp?.id) fetchTeamMembers(selectedApp.id);
  }, [selectedApp?.id, fetchTeamMembers]);

  const filtered = teamMembers.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase())
  );

  const fullAccessCount  = teamMembers.filter((m) =>
    ALL_PERMISSIONS.every((p) => m.memberPermissions.includes(p.slug))
  ).length;

  if (!selectedApp) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
        <AlertCircle className="w-10 h-10 text-muted-foreground/40" />
        <p className="text-sm font-medium font-space-grotesk text-foreground">No application selected</p>
        <p className="text-xs text-muted-foreground max-w-xs">
          Select an application from the sidebar to manage its team.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Page header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
      >
        <div>
          <h2 className="text-base font-bold font-space-grotesk text-foreground">
            {selectedApp.appName} — Team
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {teamMembers.length} member{teamMembers.length !== 1 ? "s" : ""} · manage access and permissions
          </p>
        </div>
        {isOwner && (
          <button
            onClick={() => setInviteOpen(true)}
            className="cursor-pointer flex items-center gap-2 px-3.5 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/80 transition-all duration-200 shrink-0"
          >
            <UserPlus className="w-3.5 h-3.5" />
            Add Member
          </button>
        )}
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <StatCard label="Total Members" value={teamMembers.length + 1} icon={UsersRound}   color="bg-primary/15 text-primary"            delay={0}    />
        <StatCard label="Collaborators" value={teamMembers.length}     icon={Users}        color="bg-blue-500/15 text-blue-400"          delay={0.05} />
        <StatCard label="Full Access"   value={fullAccessCount}        icon={ShieldCheck}  color="bg-emerald-500/15 text-emerald-400"    delay={0.1}  />
      </div>

      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search members by name or email…"
          className="w-full bg-secondary/30 border border-border rounded-lg py-2 pl-9 pr-4 text-sm focus:outline-none focus:border-primary transition-colors"
        />
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-card/40 overflow-hidden">
        {teamLoading ? (
          <div className="p-10 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-card/60">
                  <th className="py-3 px-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Member</th>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Access</th>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Permissions</th>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden xl:table-cell">Added</th>
                  <th className="py-3 px-4 w-16" />
                </tr>
              </thead>
              <tbody>
                {/* Owner always pinned first */}
                <OwnerRow user={user} />
                <AnimatePresence>
                  {filtered.length === 0 && !teamLoading && (
                    <tr>
                      <td colSpan={5}>
                        <div className="py-14 flex flex-col items-center gap-3 text-center">
                          <UsersRound className="w-8 h-8 text-muted-foreground/30" />
                          <p className="text-sm font-medium font-space-grotesk text-foreground">
                            {search ? "No matching members" : "No team members yet"}
                          </p>
                          <p className="text-xs text-muted-foreground max-w-xs">
                            {search
                              ? "Try a different name or email."
                              : isOwner
                              ? "Add your first collaborator using the button above."
                              : "The owner hasn't added any team members yet."}
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                  {filtered.map((member) => (
                    <MemberRow
                      key={member.id}
                      member={member}
                      appId={selectedApp.id}
                      isOwner={isOwner}
                      onEdit={(m) => setEditMember(m)}
                      onRemove={removeTeamMember}
                    />
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Permission legend */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-xl border border-border bg-card/30 p-5"
      >
        <p className="text-xs font-semibold text-foreground font-space-grotesk mb-3 flex items-center gap-2">
          <Shield className="w-3.5 h-3.5 text-primary" />
          Available Permissions
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {ALL_PERMISSIONS.map(({ slug, label, icon: Icon, group }) => (
            <div key={slug} className="flex items-start gap-2 p-2.5 rounded-lg bg-secondary/20 border border-border">
              <div className="w-6 h-6 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                <Icon className="w-3 h-3 text-primary" />
              </div>
              <div>
                <p className="text-xs font-medium text-foreground">{label}</p>
                <p className="text-[10px] text-muted-foreground">{group}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Dialogs */}
      <InviteDialog
        appId={selectedApp.id}
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
      />
      <EditPermissionsDialog
        appId={selectedApp.id}
        member={editMember}
        open={!!editMember}
        onClose={() => setEditMember(null)}
      />
    </div>
  );
}

export default function Team() {
  return <TeamContent />;
}
