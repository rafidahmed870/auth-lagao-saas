import { useClient } from "@/context/ClientContext";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useAppAccess } from "@/hooks/use-app-access";
import AccessDenied from "@/components/dashboard/AccessDenied";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users as UsersIcon,
  Plus,
  Trash2,
  CalendarClock,
  AlertCircle,
  Search,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  UserX,
  Mail,
  Edit2,
  X,
  Cpu,
  ShieldCheck,
  ShieldOff,
  RotateCcw,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { cn } from "@/lib/utils";

// ── Helpers ───────────────────────────────────────────────────────────────────
const isExpired = (date) => date && new Date(date) < new Date();
const formatDate = (date) =>
  date
    ? new Date(date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "—";

// ── HWID Lock Toggle (inline in table row) ────────────────────────────────────
function HwidCell({ user, appId, canWrite = true }) {
  const { updateAppUser, resetUserHwid } = useClient();
  const [toggling, setToggling] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [resetting, setResetting] = useState(false);

  const handleToggle = async (e) => {
    e.stopPropagation();
    setToggling(true);
    const res = await updateAppUser(appId, user.id, { hwidLocked: !user.hwidLocked });
    setToggling(false);
    if (!res?.success) toast.error(res?.message || "Failed to update HWID lock");
    else toast.success(user.hwidLocked ? "Device lock disabled" : "Device lock enabled");
  };

  const handleReset = async () => {
    setResetting(true);
    const res = await resetUserHwid(appId, user.id);
    setResetting(false);
    if (!res?.success) toast.error(res?.message || "Failed to reset HWID");
    else { toast.success("HWID cleared — user can bind a new device"); setResetOpen(false); }
  };

  return (
    <>
      <div className="flex items-center gap-1.5">
        {/* Lock toggle */}
        <button
          onClick={handleToggle}
          disabled={toggling || !canWrite}
          title={
            !canWrite
              ? "You don't have permission to change device lock"
              : user.hwidLocked
              ? "Device lock ON — click to disable"
              : "Device lock OFF — click to enable"
          }
          className={cn(
            "cursor-pointer flex items-center gap-1.5 px-2 py-1 rounded-md border text-[10px] font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed",
            user.hwidLocked
              ? "bg-blue-500/10 border-blue-500/25 text-blue-400 hover:bg-blue-500/20"
              : "bg-secondary/40 border-border text-muted-foreground hover:bg-accent/60"
          )}
        >
          {toggling ? (
            <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
          ) : user.hwidLocked ? (
            <ShieldCheck className="w-3 h-3" />
          ) : (
            <ShieldOff className="w-3 h-3" />
          )}
          <span className="hidden sm:inline">{user.hwidLocked ? "Locked" : "Unlocked"}</span>
        </button>

        {/* Reset HWID — only shown when lock is on AND a device is bound AND user has write permission */}
        {canWrite && user.hwidLocked && user.hwid && (
          <button
            onClick={(e) => { e.stopPropagation(); setResetOpen(true); }}
            title="Reset bound device (clear HWID)"
            className="cursor-pointer inline-flex items-center gap-1 rounded-full border border-orange-300/40 bg-orange-300/10 px-2 py-1 text-[11px] font-semibold text-orange-600 hover:bg-orange-300/20 transition-all duration-200"
          >
            <RotateCcw className="w-3 h-3" />
            Reset Device
          </button>
        )}
      </div>

      {/* Reset HWID confirm */}
      <ConfirmDialog
        open={resetOpen}
        onOpenChange={setResetOpen}
        title="Reset Device Lock"
        description={`This will clear the bound hardware ID for "${user.username}". They can bind a new device on their next login.`}
        confirmLabel="Reset HWID"
        variant="destructive"
        loading={resetting}
        onConfirm={handleReset}
      />
    </>
  );
}

// ── Create / Edit User Modal ──────────────────────────────────────────────────
function UserModal({ appId, editUser, onClose, onSuccess }) {
  const { createAppUser, updateAppUser } = useClient();
  const isEdit = !!editUser;
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(
    isEdit
      ? {
          username: editUser.username,
          email: editUser.email || "",
          password: "",
          isActive: editUser.isActive,
          hwidLocked: editUser.hwidLocked ?? false,
          expiresAt: editUser.expiresAt
            ? new Date(editUser.expiresAt).toISOString().split("T")[0]
            : "",
        }
      : {
          username: "",
          email: "",
          password: "",
          hwidLocked: false,
          expiresAt: (() => {
            const d = new Date();
            d.setFullYear(d.getFullYear() + 1);
            return d.toISOString().split("T")[0];
          })(),
        }
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username.trim()) { toast.error("Username is required"); return; }
    if (!isEdit && !form.password.trim()) { toast.error("Password is required"); return; }
    if (!form.expiresAt) { toast.error("Expiry date is required"); return; }

    setLoading(true);
    const payload = {
      username: form.username,
      email: form.email || null,
      hwidLocked: form.hwidLocked,
      expiresAt: new Date(form.expiresAt).toISOString(),
      ...(form.password ? { password: form.password } : {}),
      ...(isEdit ? { isActive: form.isActive } : {}),
    };

    const res = isEdit
      ? await updateAppUser(appId, editUser.id, payload)
      : await createAppUser(appId, payload);

    setLoading(false);
    if (res?.success) {
      toast.success(isEdit ? "User updated!" : "User created!");
      onSuccess?.();
      onClose();
    } else {
      toast.error(res?.message || "Operation failed");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="relative z-10 w-full max-w-lg rounded-2xl border border-border bg-card shadow-2xl shadow-black/40"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border">
          <h2 className="text-base font-bold font-space-grotesk text-foreground">
            {isEdit ? "Edit User" : "Add New User"}
          </h2>
          <button
            onClick={onClose}
            className="cursor-pointer p-1.5 rounded-md hover:bg-accent/60 text-muted-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Username + Password */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1.5">
                Username <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                value={form.username}
                onChange={(e) => setForm((p) => ({ ...p, username: e.target.value }))}
                placeholder="john_doe"
                className="w-full bg-secondary/30 border border-border rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-primary transition-colors"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1.5">
                Password {!isEdit && <span className="text-destructive">*</span>}
              </label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                placeholder={isEdit ? "Leave blank to keep" : "••••••••"}
                className="w-full bg-secondary/30 border border-border rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-primary transition-colors"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1.5">
              Email
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
              placeholder="john@example.com"
              className="w-full bg-secondary/30 border border-border rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          {/* Expiry + Status (edit only) */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1.5">
                Expires At <span className="text-destructive">*</span>
              </label>
              <input
                type="date"
                value={form.expiresAt}
                onChange={(e) => setForm((p) => ({ ...p, expiresAt: e.target.value }))}
                className="w-full bg-secondary/30 border border-border rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-primary transition-colors"
              />
            </div>
            {isEdit && (
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1.5">
                  Account Status
                </label>
                <button
                  type="button"
                  onClick={() => setForm((p) => ({ ...p, isActive: !p.isActive }))}
                  className={cn(
                    "cursor-pointer w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg border text-sm transition-colors",
                    form.isActive
                      ? "bg-green-500/10 border-green-500/20 text-green-400"
                      : "bg-destructive/10 border-destructive/20 text-destructive"
                  )}
                >
                  {form.isActive ? (
                    <><UserCheck className="w-3.5 h-3.5" /> Active</>
                  ) : (
                    <><UserX className="w-3.5 h-3.5" /> Banned</>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* HWID Lock toggle — full-width card */}
          <div
            className={cn(
              "flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all duration-200 select-none",
              form.hwidLocked
                ? "bg-blue-500/8 border-blue-500/25"
                : "bg-secondary/20 border-border hover:bg-secondary/30"
            )}
            onClick={() => setForm((p) => ({ ...p, hwidLocked: !p.hwidLocked }))}
          >
            <div className="flex items-start gap-3">
              <div className={cn(
                "mt-0.5 p-2 rounded-lg border",
                form.hwidLocked
                  ? "bg-blue-500/15 border-blue-500/25 text-blue-400"
                  : "bg-secondary/40 border-border text-muted-foreground"
              )}>
                <Cpu className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-medium font-space-grotesk text-foreground">
                  Device Lock (HWID)
                </p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                  {form.hwidLocked
                    ? "Enabled — user's login is bound to their hardware ID. First login locks the device."
                    : "Disabled — user can log in from any device."}
                </p>
              </div>
            </div>

            {/* Toggle pill */}
            <div className={cn(
              "relative w-10 h-5.5 rounded-full border transition-all duration-300 shrink-0 ml-4",
              form.hwidLocked ? "bg-blue-500 border-blue-400" : "bg-secondary border-border"
            )}>
              <div className={cn(
                "absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-300",
                form.hwidLocked ? "translate-x-5" : "translate-x-0.5"
              )} />
            </div>
          </div>

          {/* Show current HWID in edit mode */}
          {isEdit && (
            <div className="flex items-start gap-2.5 p-3 rounded-lg bg-secondary/20 border border-border">
              <Cpu className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-medium text-muted-foreground mb-0.5">
                  Bound Device ID
                </p>
                <code className="text-[11px] font-mono text-foreground/70 break-all">
                  {editUser.hwid || "No device bound yet"}
                </code>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer flex-1 py-2.5 rounded-lg border border-border text-sm hover:bg-accent/60 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="cursor-pointer flex-1 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold font-space-grotesk hover:bg-primary/80 transition-colors disabled:opacity-60"
            >
              {loading
                ? isEdit ? "Saving..." : "Creating..."
                : isEdit ? "Save Changes" : "Create User"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// ── User table row ────────────────────────────────────────────────────────────
function UserRow({ user, appId, onDelete, onEdit, canWrite = true }) {
  const { resetUserHwid } = useClient();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [resetting, setResetting] = useState(false);
  const expired = isExpired(user.expiresAt);

  const handleDelete = async () => {
    setDeleting(true);
    const res = await onDelete(appId, user.id);
    setDeleting(false);
    if (res?.success) {
      setDeleteOpen(false);
    } else {
      toast.error(res?.message || "Failed to delete user");
    }
  };

  const handleReset = async () => {
    setResetting(true);
    const res = await resetUserHwid(appId, user.id);
    setResetting(false);
    if (!res?.success) {
      toast.error(res?.message || "Failed to reset device ID");
    } else {
      toast.success("Device ID reset successfully");
      setResetOpen(false);
    }
  };

  return (
    <>
      <motion.tr
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="border-b border-border/50 group hover:bg-accent/20 transition-colors"
      >
        {/* User info */}
        <td className="py-3 px-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-primary/15 border border-primary/20 flex items-center justify-center shrink-0">
              <span className="text-xs font-bold text-primary font-space-grotesk">
                {user.username?.charAt(0)?.toUpperCase()}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium font-space-grotesk text-foreground truncate">
                {user.username}
              </p>
              {user.email && (
                <div className="flex items-center gap-1 mt-0.5">
                  <Mail className="w-2.5 h-2.5 text-muted-foreground" />
                  <p className="text-[10px] text-muted-foreground truncate">{user.email}</p>
                </div>
              )}
            </div>
          </div>
        </td>

        {/* Account status */}
        <td className="py-3 px-4">
          <span className={cn(
            "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border",
            !user.isActive || expired
              ? "bg-destructive/10 text-destructive border-destructive/20"
              : "bg-green-500/10 text-green-400 border-green-500/20"
          )}>
            <span className={cn("w-1 h-1 rounded-full", !user.isActive || expired ? "bg-destructive" : "bg-green-400")} />
            {!user.isActive ? "Banned" : expired ? "Expired" : "Active"}
          </span>
        </td>

        {/* HWID lock — interactive inline toggle */}
        <td className="py-3 px-4 hidden md:table-cell">
          <HwidCell user={user} appId={appId} canWrite={canWrite} />
        </td>

        {/* Expiry */}
        <td className="py-3 px-4 hidden sm:table-cell">
          <div className="flex items-center gap-1.5">
            <CalendarClock className={cn("w-3 h-3", expired ? "text-destructive" : "text-muted-foreground")} />
            <span className={cn("text-xs", expired ? "text-destructive" : "text-muted-foreground")}>
              {formatDate(user.expiresAt)}
            </span>
          </div>
        </td>

        {/* Created */}
        <td className="py-3 px-4 hidden lg:table-cell">
          <span className="text-xs text-muted-foreground">{formatDate(user.createdAt)}</span>
        </td>

        {/* Row actions */}
        <td className="py-3 px-4">
          {canWrite && (
            <div className="flex items-center gap-1 transition-all">
              {user.hwidLocked && (
                <button
                  onClick={() => setResetOpen(true)}
                  className="cursor-pointer p-1.5 rounded-md text-muted-foreground hover:text-orange-400 hover:bg-orange-400/10 transition-all duration-200"
                  title="Reset bound device ID"
                  aria-label="Reset bound device ID"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                onClick={() => onEdit(user)}
                className="cursor-pointer p-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all duration-200"
                title="Edit user"
                aria-label="Edit user"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setDeleteOpen(true)}
                className="cursor-pointer p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-200"
                title="Delete user"
                aria-label="Delete user"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </td>
      </motion.tr>

      {/* Delete confirm */}
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete User"
        description={`This will permanently delete "${user.username}" and all associated data. This action cannot be undone.`}
        confirmLabel="Delete User"
        variant="destructive"
        loading={deleting}
        onConfirm={handleDelete}
      />

      {/* Reset HWID confirm */}
      <ConfirmDialog
        open={resetOpen}
        onOpenChange={setResetOpen}
        title="Reset Device ID"
        description={`This will clear the bound device ID for "${user.username}" so they can login from a new device.`}
        confirmLabel="Reset Device ID"
        variant="destructive"
        loading={resetting}
        onConfirm={handleReset}
      />
    </>
  );
}

// ── Users page ────────────────────────────────────────────────────────────────
const PAGE_SIZE = 10;

function UsersContent() {
  const { selectedApp, appUsers, fetchAppUsers, deleteAppUser, resourceLoading } = useClient();
  const { hasPermission } = useAppAccess();
  const canWrite = hasPermission(["app.user.create", "app.user.update", "app.user.delete", "app.user.hwid.reset"]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editUser, setEditUser] = useState(null);

  useEffect(() => {
    if (selectedApp?.id) fetchAppUsers(selectedApp.id);
  }, [selectedApp?.id, fetchAppUsers]);

  // Permission gate
  if (selectedApp && !hasPermission("app.user.view")) {
    return <AccessDenied permission="app.user.view" pageName="Users" />;
  }

  const filtered = appUsers.filter(
    (u) =>
      u.username.toLowerCase().includes(search.toLowerCase()) ||
      (u.email || "").toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const activeCount  = appUsers.filter((u) => u.isActive && !isExpired(u.expiresAt)).length;
  const expiredCount = appUsers.filter((u) => isExpired(u.expiresAt)).length;
  const lockedCount  = appUsers.filter((u) => u.hwidLocked).length;

  if (!selectedApp) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
        <AlertCircle className="w-10 h-10 text-muted-foreground/40" />
        <p className="text-sm font-medium font-space-grotesk text-foreground">No application selected</p>
        <p className="text-xs text-muted-foreground max-w-xs">
          Select an application from the sidebar to manage its users.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-5xl mx-auto">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-base font-bold font-space-grotesk text-foreground">
            {selectedApp.appName} — Users
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {appUsers.length} user{appUsers.length !== 1 ? "s" : ""} · {activeCount} active · {expiredCount} expired
          </p>
        </div>
        {canWrite && (
          <button
            onClick={() => { setEditUser(null); setModalOpen(true); }}
            className="cursor-pointer flex items-center gap-2 px-3.5 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/80 transition-all duration-200"
          >
            <Plus className="w-3.5 h-3.5" />
            Add User
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Total",        value: appUsers.length, color: "text-foreground" },
          { label: "Active",       value: activeCount,     color: "text-green-400" },
          { label: "Expired",      value: expiredCount,    color: "text-destructive" },
          { label: "Device Locked",value: lockedCount,     color: "text-blue-400" },
        ].map((stat) => (
          <div key={stat.label} className="rounded-lg border border-border bg-card/40 p-3 text-center">
            <p className={cn("text-xl font-bold font-space-grotesk", stat.color)}>{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search by username or email..."
          className="w-full bg-secondary/30 border border-border rounded-lg py-2 pl-9 pr-4 text-sm focus:outline-none focus:border-primary transition-colors"
        />
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-card/40 overflow-hidden">
        {resourceLoading ? (
          <div className="p-8 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : paginated.length === 0 ? (
          <div className="p-12 flex flex-col items-center gap-3 text-center">
            <UsersIcon className="w-8 h-8 text-muted-foreground/30" />
            <p className="text-sm font-medium font-space-grotesk text-foreground">
              {search ? "No matching users" : "No users yet"}
            </p>
            <p className="text-xs text-muted-foreground">
              {search ? "Try a different search." : "Add your first user above."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-card/60">
                  <th className="py-3 px-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">User</th>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">
                    <div className="flex items-center gap-1.5">
                      <Cpu className="w-3 h-3" />
                      Device Lock
                    </div>
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Expires</th>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Created</th>
                  <th className="py-3 px-4 w-16" />
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {paginated.map((user) => (
                    <UserRow
                      key={user.id}
                      user={user}
                      appId={selectedApp.id}
                      onDelete={deleteAppUser}
                      onEdit={(u) => { setEditUser(u); setModalOpen(true); }}
                      canWrite={canWrite}
                    />
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Page {page} of {totalPages} · {filtered.length} results
          </p>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="cursor-pointer p-1.5 rounded-md border border-border hover:bg-accent/60 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="cursor-pointer p-1.5 rounded-md border border-border hover:bg-accent/60 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {modalOpen && (
          <UserModal
            appId={selectedApp.id}
            editUser={editUser}
            onClose={() => { setModalOpen(false); setEditUser(null); }}
            onSuccess={() => fetchAppUsers(selectedApp.id)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Users() {
  return <UsersContent />;
}
