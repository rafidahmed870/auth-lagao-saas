import { useClient } from "@/context/ClientContext";
import { useAuth } from "@/context/AuthContext";
import { useAppAccess } from "@/hooks/use-app-access";
import AccessDenied from "@/components/dashboard/AccessDenied";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { motion, AnimatePresence } from "framer-motion";
import {
  UsersRound, UserPlus, Trash2, Shield, ShieldCheck, ShieldOff,
  AlertCircle, X, Check, Pencil, Search, Mail, Crown,
  Eye, Key, Users, CreditCard, Settings, ChevronDown,
  Zap, Lock, Unlock,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { cn } from "@/lib/utils";

// ── Permission catalogue ──────────────────────────────────────────────────────
const PERMISSION_GROUPS = [
  {
    key: "Application",
    icon: Settings,
    color: "text-violet-400",
    bg: "bg-violet-500/10",
    border: "border-violet-500/20",
    items: [
      { slug: "app.view",   label: "View",   desc: "View application details and status" },
      { slug: "app.update", label: "Update", desc: "Edit name, version and toggle active state" },
    ],
  },
  {
    key: "Licenses",
    icon: Key,
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    items: [
      { slug: "app.license.view",   label: "View",   desc: "View all license keys" },
      { slug: "app.license.create", label: "Create", desc: "Generate new license keys" },
      { slug: "app.license.update", label: "Update", desc: "Edit license expiry dates" },
      { slug: "app.license.delete", label: "Delete", desc: "Permanently delete licenses" },
    ],
  },
  {
    key: "Users",
    icon: Users,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    items: [
      { slug: "app.user.view",       label: "View",       desc: "View end-user accounts" },
      { slug: "app.user.create",     label: "Create",     desc: "Manually create accounts" },
      { slug: "app.user.update",     label: "Update",     desc: "Edit user details and status" },
      { slug: "app.user.delete",     label: "Delete",     desc: "Delete user accounts" },
      { slug: "app.user.hwid.reset", label: "Reset HWID", desc: "Clear bound hardware ID" },
    ],
  },
  {
    key: "Subscriptions",
    icon: CreditCard,
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    items: [
      { slug: "app.subscription.view",   label: "View",   desc: "View subscription tiers" },
      { slug: "app.subscription.create", label: "Create", desc: "Create new tiers" },
      { slug: "app.subscription.update", label: "Update", desc: "Rename or modify tiers" },
      { slug: "app.subscription.delete", label: "Delete", desc: "Delete tiers" },
    ],
  },
  {
    key: "Team",
    icon: UsersRound,
    color: "text-rose-400",
    bg: "bg-rose-500/10",
    border: "border-rose-500/20",
    items: [
      { slug: "app.team.view",   label: "View",   desc: "See team members and their permissions" },
      { slug: "app.team.manage", label: "Manage", desc: "Invite, edit and remove members" },
    ],
  },
];

const ALL_SLUGS = PERMISSION_GROUPS.flatMap((g) => g.items.map((i) => i.slug));

// Role presets shown at the top of the permission picker
const ROLE_PRESETS = [
  {
    id: "viewer",
    label: "Viewer",
    icon: Eye,
    desc: "Read-only access across all sections",
    slugs: ["app.view", "app.license.view", "app.user.view", "app.subscription.view", "app.team.view"],
  },
  {
    id: "editor",
    label: "Editor",
    icon: Pencil,
    desc: "View and manage resources, no team control",
    slugs: [
      "app.view", "app.update",
      "app.license.view", "app.license.create", "app.license.update", "app.license.delete",
      "app.user.view", "app.user.create", "app.user.update", "app.user.delete", "app.user.hwid.reset",
      "app.subscription.view", "app.subscription.create", "app.subscription.update", "app.subscription.delete",
      "app.team.view",
    ],
  },
  {
    id: "admin",
    label: "Admin",
    icon: ShieldCheck,
    desc: "Full access including team management",
    slugs: ALL_SLUGS,
  },
];

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

const detectPreset = (selected) => {
  for (const p of ROLE_PRESETS) {
    if (
      p.slugs.length === selected.length &&
      p.slugs.every((s) => selected.includes(s))
    ) return p.id;
  }
  return selected.length === 0 ? "none" : "custom";
};

// ── Professional Permission Picker ────────────────────────────────────────────
function PermissionPicker({ selected, onChange }) {
  const [openGroups, setOpenGroups] = useState(
    Object.fromEntries(PERMISSION_GROUPS.map((g) => [g.key, true]))
  );

  const toggleGroup = (key) =>
    setOpenGroups((p) => ({ ...p, [key]: !p[key] }));

  const toggleSlug = (slug) =>
    onChange(selected.includes(slug) ? selected.filter((s) => s !== slug) : [...selected, slug]);

  const isGroupFull = (group) => group.items.every((i) => selected.includes(i.slug));
  const isGroupPartial = (group) =>
    group.items.some((i) => selected.includes(i.slug)) && !isGroupFull(group);

  const toggleGroupAll = (group) => {
    const slugs = group.items.map((i) => i.slug);
    if (isGroupFull(group)) {
      onChange(selected.filter((s) => !slugs.includes(s)));
    } else {
      onChange([...new Set([...selected, ...slugs])]);
    }
  };

  const applyPreset = (preset) => {
    if (preset.id === "none") { onChange([]); return; }
    onChange([...preset.slugs]);
  };

  const activePreset = detectPreset(selected);

  return (
    <div className="space-y-4">
      {/* Role Presets */}
      <div>
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-2">
          Quick Role
        </p>
        <div className="grid grid-cols-3 gap-2">
          {ROLE_PRESETS.map((preset) => {
            const Icon = preset.icon;
            const isActive = activePreset === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => applyPreset(preset)}
                className={cn(
                  "flex flex-col items-center gap-1.5 px-3 py-3 rounded-xl border text-center transition-all duration-150",
                  isActive
                    ? "bg-primary/15 border-primary/40 text-primary"
                    : "bg-secondary/20 border-border text-muted-foreground hover:border-border/80 hover:text-foreground hover:bg-accent/40"
                )}
              >
                <div className={cn(
                  "w-7 h-7 rounded-lg flex items-center justify-center border transition-colors",
                  isActive ? "bg-primary/20 border-primary/30" : "bg-secondary/40 border-border"
                )}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-semibold">{preset.label}</span>
                <span className="text-[9px] leading-tight opacity-70">{preset.desc}</span>
              </button>
            );
          })}
        </div>
        {activePreset === "custom" && (
          <p className="text-[10px] text-amber-400 mt-2 flex items-center gap-1">
            <Zap className="w-3 h-3" /> Custom configuration
          </p>
        )}
        {activePreset === "none" && (
          <p className="text-[10px] text-destructive/70 mt-2 flex items-center gap-1">
            <Lock className="w-3 h-3" /> No permissions selected
          </p>
        )}
      </div>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-border" />
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Granular</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      {/* Permission Groups */}
      <div className="space-y-2">
        {PERMISSION_GROUPS.map((group) => {
          const GroupIcon = group.icon;
          const full = isGroupFull(group);
          const partial = isGroupPartial(group);
          const isOpen = openGroups[group.key];

          return (
            <div key={group.key} className="rounded-xl border border-border overflow-hidden">
              {/* Group header */}
              <div className="flex items-center gap-3 px-3 py-2.5 bg-card/60">
                <button
                  type="button"
                  onClick={() => toggleGroupAll(group)}
                  className={cn(
                    "w-5 h-5 rounded flex items-center justify-center border shrink-0 transition-all duration-150",
                    full
                      ? "bg-primary border-primary"
                      : partial
                      ? "bg-primary/30 border-primary/50"
                      : "bg-secondary/40 border-border hover:border-primary/40"
                  )}
                >
                  {full && <Check className="w-3 h-3 text-primary-foreground" />}
                  {partial && <div className="w-2 h-0.5 bg-primary rounded" />}
                </button>

                <div className={cn("w-6 h-6 rounded-md flex items-center justify-center border shrink-0", group.bg, group.border)}>
                  <GroupIcon className={cn("w-3 h-3", group.color)} />
                </div>

                <span className="text-xs font-semibold text-foreground flex-1">{group.key}</span>

                <span className="text-[10px] text-muted-foreground mr-1">
                  {group.items.filter((i) => selected.includes(i.slug)).length}/{group.items.length}
                </span>

                <button
                  type="button"
                  onClick={() => toggleGroup(group.key)}
                  className="p-0.5 rounded text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ChevronDown className={cn("w-3.5 h-3.5 transition-transform duration-200", isOpen && "rotate-180")} />
                </button>
              </div>

              {/* Group items */}
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.18 }}
                    className="overflow-hidden"
                  >
                    <div className="divide-y divide-border/50">
                      {group.items.map((item) => {
                        const active = selected.includes(item.slug);
                        return (
                          <button
                            key={item.slug}
                            type="button"
                            onClick={() => toggleSlug(item.slug)}
                            className={cn(
                              "w-full flex items-center gap-3 px-3 py-2 text-left transition-colors",
                              active ? "bg-primary/5" : "hover:bg-accent/30"
                            )}
                          >
                            <div className={cn(
                              "w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-all duration-150",
                              active ? "bg-primary border-primary" : "border-border"
                            )}>
                              {active && <Check className="w-2.5 h-2.5 text-primary-foreground" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <span className={cn(
                                "text-xs font-medium",
                                active ? "text-foreground" : "text-muted-foreground"
                              )}>
                                {item.label}
                              </span>
                              <p className="text-[10px] text-muted-foreground/70 truncate">{item.desc}</p>
                            </div>
                            <span className={cn(
                              "text-[9px] px-1.5 py-0.5 rounded-full border font-mono shrink-0",
                              active
                                ? "bg-primary/10 border-primary/20 text-primary"
                                : "bg-secondary/40 border-border text-muted-foreground/50"
                            )}>
                              {item.slug.split(".").pop()}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Permission Pills (inline table display) ───────────────────────────────────
function PermissionPills({ permissions }) {
  const visible = permissions.slice(0, 3);
  const overflow = permissions.length - 3;

  if (permissions.length === 0) {
    return <span className="text-[10px] text-muted-foreground italic">No permissions</span>;
  }

  return (
    <div className="flex flex-wrap items-center gap-1">
      {visible.map((slug) => {
        const group = PERMISSION_GROUPS.find((g) => g.items.some((i) => i.slug === slug));
        const item  = group?.items.find((i) => i.slug === slug);
        return (
          <span
            key={slug}
            className={cn(
              "inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-medium border",
              group ? `${group.bg} ${group.border} ${group.color}` : "bg-secondary/40 border-border text-muted-foreground"
            )}
          >
            {item?.label ?? slug.split(".").pop()}
          </span>
        );
      })}
      {overflow > 0 && (
        <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-secondary/40 border border-border text-[10px] text-muted-foreground font-medium">
          +{overflow}
        </span>
      )}
    </div>
  );
}

// ── Invite Dialog ─────────────────────────────────────────────────────────────
function InviteDialog({ appId, open, onClose }) {
  const { inviteTeamMember } = useClient();
  const [loading, setLoading]       = useState(false);
  const [email, setEmail]           = useState("");
  const [permissions, setPerms]     = useState(ROLE_PRESETS[0].slugs); // Viewer default

  const reset = () => { setEmail(""); setPerms(ROLE_PRESETS[0].slugs); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) { toast.error("Email is required"); return; }
    if (permissions.length === 0) { toast.error("Select at least one permission"); return; }
    setLoading(true);
    const res = await inviteTeamMember(appId, { email: email.trim(), permissions });
    setLoading(false);
    if (res?.success) {
      toast.success("Team member added successfully!");
      reset();
      onClose();
    } else {
      toast.error(res?.message || "Failed to invite member");
    }
  };

  const handleClose = () => { reset(); onClose(); };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            key="bd"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={handleClose}
          />
          <motion.div
            key="dlg"
            initial={{ opacity: 0, scale: 0.95, y: 14 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 14 }}
            transition={{ duration: 0.18 }}
            className="relative z-10 w-full max-w-xl rounded-2xl border border-border bg-card shadow-2xl shadow-black/50 flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-border shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <UserPlus className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h2 className="text-sm font-bold font-space-grotesk text-foreground">Add Team Member</h2>
                  <p className="text-[11px] text-muted-foreground">Invite a registered user and configure their access</p>
                </div>
              </div>
              <button onClick={handleClose} className="cursor-pointer p-1.5 rounded-lg hover:bg-accent/60 text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
              {/* Scrollable body */}
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
                {/* Email */}
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5">
                    Email address <span className="text-destructive">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="colleague@example.com"
                      autoFocus
                      className="w-full bg-secondary/30 border border-border rounded-lg py-2.5 pl-9 pr-3.5 text-sm text-foreground focus:outline-none focus:border-primary transition-colors placeholder:text-muted-foreground/40"
                    />
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1.5 flex items-center gap-1">
                    <Unlock className="w-3 h-3" />
                    The user must already have an Auth Lagao account.
                  </p>
                </div>

                {/* Permission Picker */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-xs font-semibold text-foreground">
                      Permissions <span className="text-destructive">*</span>
                    </label>
                    <span className="text-[10px] text-muted-foreground">
                      {permissions.length} of {ALL_SLUGS.length} selected
                    </span>
                  </div>
                  <PermissionPicker selected={permissions} onChange={setPerms} />
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-border flex gap-3 shrink-0">
                <button
                  type="button"
                  onClick={handleClose}
                  className="cursor-pointer flex-1 py-2.5 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-accent/60 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || permissions.length === 0}
                  className="cursor-pointer flex-1 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold font-space-grotesk hover:bg-primary/80 transition-colors disabled:opacity-50"
                >
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
  const [loading, setLoading]   = useState(false);
  const [permissions, setPerms] = useState(member?.memberPermissions ?? []);

  useEffect(() => {
    if (member) setPerms(member.memberPermissions ?? []);
  }, [member]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (permissions.length === 0) { toast.error("Select at least one permission"); return; }
    setLoading(true);
    const res = await updateTeamMember(appId, member.id, { permissions });
    setLoading(false);
    if (res?.success) { toast.success("Permissions updated!"); onClose(); }
    else toast.error(res?.message || "Failed to update permissions");
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
            className="relative z-10 w-full max-w-xl rounded-2xl border border-border bg-card shadow-2xl shadow-black/50 flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-border shrink-0">
              <div className="flex items-center gap-3">
                <div className={cn("w-9 h-9 rounded-full border flex items-center justify-center shrink-0 text-sm font-bold font-space-grotesk", avatarColor(member.name))}>
                  {getInitials(member.name)}
                </div>
                <div>
                  <h2 className="text-sm font-bold font-space-grotesk text-foreground">{member.name}</h2>
                  <p className="text-[11px] text-muted-foreground">{member.email}</p>
                </div>
              </div>
              <button onClick={onClose} className="cursor-pointer p-1.5 rounded-lg hover:bg-accent/60 text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-xs font-semibold text-foreground">Permissions</label>
                    <span className="text-[10px] text-muted-foreground">
                      {permissions.length} of {ALL_SLUGS.length} selected
                    </span>
                  </div>
                  <PermissionPicker selected={permissions} onChange={setPerms} />
                </div>
              </div>

              <div className="px-6 py-4 border-t border-border flex gap-3 shrink-0">
                <button
                  type="button"
                  onClick={onClose}
                  className="cursor-pointer flex-1 py-2.5 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-accent/60 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || permissions.length === 0}
                  className="cursor-pointer flex-1 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold font-space-grotesk hover:bg-primary/80 transition-colors disabled:opacity-50"
                >
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

// ── Member Row ────────────────────────────────────────────────────────────────
function MemberRow({ member, appId, canManage, onEdit, onRemove }) {
  const [removeOpen, setRemoveOpen] = useState(false);
  const [removing, setRemoving]     = useState(false);

  const handleRemove = async () => {
    setRemoving(true);
    const res = await onRemove(appId, member.id);
    setRemoving(false);
    if (res?.success) setRemoveOpen(false);
    else toast.error(res?.message || "Failed to remove member");
  };

  const hasFullAccess = ALL_SLUGS.every((s) => member.memberPermissions.includes(s));
  const hasAny = member.memberPermissions.length > 0;

  return (
    <>
      <motion.tr
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="border-b border-border/50 group hover:bg-accent/20 transition-colors"
      >
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

        <td className="py-3.5 px-4 hidden sm:table-cell">
          <span className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold border",
            hasFullAccess ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
            : hasAny      ? "bg-primary/10 text-primary border-primary/20"
                          : "bg-secondary/40 text-muted-foreground border-border"
          )}>
            {hasFullAccess ? <ShieldCheck className="w-3 h-3" /> : hasAny ? <Shield className="w-3 h-3" /> : <ShieldOff className="w-3 h-3" />}
            {hasFullAccess ? "Full Access" : hasAny ? detectPreset(member.memberPermissions) === "custom" ? "Custom" : ROLE_PRESETS.find((p) => p.id === detectPreset(member.memberPermissions))?.label ?? "Custom" : "No Access"}
          </span>
        </td>

        <td className="py-3.5 px-4 hidden lg:table-cell max-w-xs">
          <PermissionPills permissions={member.memberPermissions} />
        </td>

        <td className="py-3.5 px-4 hidden xl:table-cell">
          <span className="text-xs text-muted-foreground">
            {new Date(member.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
          </span>
        </td>

        <td className="py-3.5 px-4">
          {canManage && (
            <div className="flex items-center gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
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

// ── Stat Card ─────────────────────────────────────────────────────────────────
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

// ── Owner Row ─────────────────────────────────────────────────────────────────
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
  const { selectedApp, applications, teamMembers, teamLoading, fetchTeamMembers, removeTeamMember } = useClient();
  const { hasPermission } = useAppAccess();

  const [search, setSearch]         = useState("");
  const [inviteOpen, setInviteOpen] = useState(false);
  const [editMember, setEditMember] = useState(null);

  const isOwner   = selectedApp && (
    selectedApp.ownerId === user?.id ||
    applications.find((a) => a.id === selectedApp.id)?.ownerId === user?.id
  );
  const canManage = isOwner || hasPermission("app.team.manage");

  useEffect(() => {
    if (selectedApp?.id) fetchTeamMembers(selectedApp.id);
  }, [selectedApp?.id, fetchTeamMembers]);

  if (selectedApp && !isOwner && !hasPermission("app.team.view")) {
    return <AccessDenied permission="app.team.view" pageName="Team" />;
  }

  if (!selectedApp) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
        <AlertCircle className="w-10 h-10 text-muted-foreground/40" />
        <p className="text-sm font-medium font-space-grotesk text-foreground">No application selected</p>
        <p className="text-xs text-muted-foreground max-w-xs">Select an application from the sidebar to manage its team.</p>
      </div>
    );
  }

  const filtered = teamMembers.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase())
  );

  const fullAccessCount = teamMembers.filter((m) =>
    ALL_SLUGS.every((s) => m.memberPermissions.includes(s))
  ).length;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
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
        {canManage && (
          <button
            onClick={() => setInviteOpen(true)}
            className="cursor-pointer flex items-center gap-2 px-3.5 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/80 transition-all duration-200 shrink-0 w-fit"
          >
            <UserPlus className="w-3.5 h-3.5" />
            Add Member
          </button>
        )}
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <StatCard label="Total Members" value={teamMembers.length + 1} icon={UsersRound}  color="bg-primary/15 text-primary"          delay={0}    />
        <StatCard label="Collaborators" value={teamMembers.length}     icon={Users}       color="bg-blue-500/15 text-blue-400"        delay={0.05} />
        <StatCard label="Full Access"   value={fullAccessCount}        icon={ShieldCheck} color="bg-emerald-500/15 text-emerald-400"  delay={0.1}  />
      </div>

      {/* Search */}
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
                  <th className="py-3 px-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Role</th>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Permissions</th>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden xl:table-cell">Added</th>
                  <th className="py-3 px-4 w-16" />
                </tr>
              </thead>
              <tbody>
                <OwnerRow user={user} />
                <AnimatePresence>
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={5}>
                        <div className="py-14 flex flex-col items-center gap-3 text-center">
                          <UsersRound className="w-8 h-8 text-muted-foreground/30" />
                          <p className="text-sm font-medium font-space-grotesk text-foreground">
                            {search ? "No matching members" : "No team members yet"}
                          </p>
                          <p className="text-xs text-muted-foreground max-w-xs">
                            {search ? "Try a different name or email."
                              : canManage ? "Add your first collaborator using the button above."
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
                      canManage={canManage}
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

      <InviteDialog       appId={selectedApp.id} open={inviteOpen}    onClose={() => setInviteOpen(false)} />
      <EditPermissionsDialog appId={selectedApp.id} member={editMember} open={!!editMember}    onClose={() => setEditMember(null)} />
    </div>
  );
}

export default function Team() {
  return <TeamContent />;
}
