import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useClient } from "@/context/ClientContext";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Key,
  Users,
  CreditCard,
  Shield,
  Activity,
  PlusCircle,
  Trash2,
  Copy,
  Check,
  ArrowRight,
  AlertCircle,
  X,
  Pencil,
  Power,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { cn } from "@/lib/utils";

// ── Create App Dialog ─────────────────────────────────────────────────────────
function AppFormDialog({ open, onClose, initialData = null }) {
  const { createApplication, updateApplication } = useClient();
  const isEdit = !!initialData;

  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    appName: initialData?.appName ?? "",
    appDescription: initialData?.appDescription ?? "",
    appVersion: initialData?.appVersion ?? "1.0",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.appName.trim()) {
      toast.error("App name is required");
      return;
    }
    setLoading(true);
    const res = isEdit
      ? await updateApplication(initialData.id, form)
      : await createApplication(form);
    setLoading(false);

    if (res?.success) {
      toast.success(isEdit ? "Application updated!" : "Application created!");
      onClose();
    } else {
      toast.error(res?.message || (isEdit ? "Failed to update" : "Failed to create"));
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            key="dialog"
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ duration: 0.2 }}
            className="relative z-10 w-full max-w-md rounded-2xl border border-border bg-card shadow-2xl shadow-black/50"
          >
            {/* Header */}
            <div className="flex items-start justify-between p-6 pb-4 border-b border-border">
              <div>
                <h2 className="text-base font-bold font-space-grotesk text-foreground">
                  {isEdit ? "Edit Application" : "Create New Application"}
                </h2>
                <p className="text-xs text-muted-foreground mt-1">
                  {isEdit
                    ? "Update your application details."
                    : "An X25519 keypair will be auto-generated for your app."}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 -mt-0.5 rounded-md hover:bg-accent/60 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                  App Name <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  value={form.appName}
                  onChange={(e) => setForm((p) => ({ ...p, appName: e.target.value }))}
                  placeholder="My Awesome App"
                  autoFocus
                  className="w-full bg-secondary/30 border border-border rounded-lg py-2.5 px-3.5 text-sm text-foreground focus:outline-none focus:border-primary transition-colors placeholder:text-muted-foreground/50"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                  Description
                </label>
                <textarea
                  value={form.appDescription}
                  onChange={(e) => setForm((p) => ({ ...p, appDescription: e.target.value }))}
                  placeholder="What does your app do?"
                  rows={3}
                  className="w-full bg-secondary/30 border border-border rounded-lg py-2.5 px-3.5 text-sm text-foreground focus:outline-none focus:border-primary transition-colors resize-none placeholder:text-muted-foreground/50"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                  Version
                </label>
                <input
                  type="text"
                  value={form.appVersion}
                  onChange={(e) => setForm((p) => ({ ...p, appVersion: e.target.value }))}
                  placeholder="1.0"
                  className="w-full bg-secondary/30 border border-border rounded-lg py-2.5 px-3.5 text-sm text-foreground focus:outline-none focus:border-primary transition-colors placeholder:text-muted-foreground/50"
                />
              </div>

              {!isEdit && (
                <div className="flex items-start gap-2.5 p-3 rounded-lg bg-primary/5 border border-primary/15">
                  <Shield className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Your app's public key will be shown after creation. The
                    private key is encrypted at rest with AES-256-GCM.
                  </p>
                </div>
              )}

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2.5 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-accent/60 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/80 transition-colors disabled:opacity-60 font-space-grotesk"
                >
                  {loading
                    ? isEdit ? "Saving..." : "Creating..."
                    : isEdit ? "Save Changes" : "Create App"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// ── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({ label, value, icon: Icon, color, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="rounded-xl border border-border bg-card/60 p-5 flex items-start justify-between"
    >
      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
          {label}
        </p>
        <p className="text-2xl font-bold font-space-grotesk text-foreground">
          {value}
        </p>
      </div>
      <div className={cn("p-2.5 rounded-lg", color)}>
        <Icon className="w-4 h-4" />
      </div>
    </motion.div>
  );
}

// ── Application card ──────────────────────────────────────────────────────────
function AppCard({ app, onSelect, onDelete, onToggleActive, onEdit, isSelected }) {
  const [copied, setCopied] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [toggling, setToggling] = useState(false);

  const handleCopy = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(app.appKey);
    setCopied(true);
    toast.success("App Key copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (!window.confirm(`Delete "${app.appName}"? This cannot be undone.`)) return;
    setDeleting(true);
    const res = await onDelete(app.id);
    if (!res?.success) {
      toast.error(res?.message || "Failed to delete");
      setDeleting(false);
    }
  };

  const handleToggle = async (e) => {
    e.stopPropagation();
    setToggling(true);
    const res = await onToggleActive(app.id, !app.isActive);
    if (!res?.success) {
      toast.error(res?.message || "Failed to update status");
    }
    setToggling(false);
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    onEdit(app);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.25 }}
      onClick={() => onSelect(app)}
      className={cn(
        "relative rounded-xl border p-5 cursor-pointer transition-all duration-200 group",
        isSelected
          ? "border-primary/40 bg-card/80 shadow-lg shadow-primary/10"
          : "border-border bg-card/40 hover:border-border/80 hover:bg-card/60"
      )}
    >
      {/* Selected indicator */}
      {isSelected && (
        <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-primary animate-pulse" />
      )}

      {/* App header */}
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-primary/15 border border-primary/20 flex items-center justify-center shrink-0">
          <Shield className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold font-space-grotesk text-foreground truncate">
            {app.appName}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">v{app.appVersion}</p>
        </div>
      </div>

      {/* Description */}
      {app.appDescription && (
        <p className="text-xs text-muted-foreground leading-relaxed mb-4 line-clamp-2">
          {app.appDescription}
        </p>
      )}

      {/* App Key row */}
      <div className="flex items-center gap-2 p-2.5 rounded-lg bg-secondary/30 border border-border mb-4">
        <Key className="w-3 h-3 text-primary shrink-0" />
        <code className="flex-1 text-[10px] font-mono text-muted-foreground truncate">
          {app.appKey}
        </code>
        <button
          onClick={handleCopy}
          className="text-muted-foreground hover:text-primary transition-colors"
        >
          {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
        </button>
      </div>

      {/* Footer — status + actions always visible */}
      <div className="flex items-center justify-between pt-1">
        {/* Active / Inactive badge */}
        <div className="flex items-center gap-1.5">
          <div
            className={cn(
              "w-1.5 h-1.5 rounded-full",
              app.isActive ? "bg-green-400" : "bg-red-400"
            )}
          />
          <span className="text-xs text-muted-foreground">
            {app.isActive ? "Active" : "Inactive"}
          </span>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          {/* Edit */}
          <button
            onClick={handleEdit}
            title="Edit application"
            className="p-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all duration-150"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>

          {/* Toggle active/inactive */}
          <button
            onClick={handleToggle}
            disabled={toggling}
            title={app.isActive ? "Disable application" : "Enable application"}
            className={cn(
              "p-1.5 rounded-md transition-all duration-150 disabled:opacity-50",
              app.isActive
                ? "text-muted-foreground hover:text-yellow-400 hover:bg-yellow-400/10"
                : "text-muted-foreground hover:text-green-400 hover:bg-green-400/10"
            )}
          >
            <Power className="w-3.5 h-3.5" />
          </button>

          {/* Delete */}
          <button
            onClick={handleDelete}
            disabled={deleting}
            title="Delete application"
            className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-150 disabled:opacity-50"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ── Add New App card ──────────────────────────────────────────────────────────
function AddAppCard({ onClick }) {
  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.25 }}
      onClick={onClick}
      className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border/60 bg-card/20 p-5 hover:border-primary/40 hover:bg-card/40 transition-all duration-200 text-muted-foreground hover:text-foreground w-full min-h-[200px] group"
    >
      <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
        <PlusCircle className="w-5 h-5 text-primary" />
      </div>
      <div className="text-center">
        <p className="text-sm font-medium font-space-grotesk text-foreground">New Application</p>
        <p className="text-xs text-muted-foreground mt-0.5">Click to create</p>
      </div>
    </motion.button>
  );
}

// ── Quick link card ────────────────────────────────────────────────────────────
function QuickLink({ label, desc, icon: Icon, href, color }) {
  return (
    <Link
      to={href}
      className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card/40 hover:bg-card/60 hover:border-border/80 transition-all duration-200 group"
    >
      <div className={cn("p-2 rounded-lg", color)}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold font-space-grotesk text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
      <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all duration-200" />
    </Link>
  );
}

// ── Overview page content ──────────────────────────────────────────────────────
function OverviewContent() {
  const { user } = useAuth();
  const {
    applications,
    selectedApp,
    setSelectedApp,
    appsLoading,
    deleteApplication,
    updateApplication,
  } = useClient();

  const [createOpen, setCreateOpen] = useState(false);
  const [editApp, setEditApp] = useState(null); // app object being edited

  const handleToggleActive = async (appId, isActive) => {
    return await updateApplication(appId, { isActive });
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">

      {/* Welcome bar */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
      >
        <div>
          <h2 className="text-xl font-bold font-space-grotesk text-foreground">
            Welcome back, {user?.name?.split(" ")[0]} 👋
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Here's what's happening with your applications.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground px-3 py-1.5 rounded-lg border border-border bg-card/40">
          <Activity className="w-3 h-3 text-green-400" />
          All systems operational
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Applications"  value={applications.length}                              icon={LayoutDashboard} color="bg-primary/15 text-primary"          delay={0}    />
        <StatCard label="Active Apps"   value={applications.filter((a) => a.isActive).length}   icon={Activity}        color="bg-green-500/15 text-green-400"      delay={0.05} />
        <StatCard label="Total"         value={applications.length}                              icon={Shield}          color="bg-blue-500/15 text-blue-400"        delay={0.1}  />
        <StatCard label="Inactive"      value={applications.filter((a) => !a.isActive).length}  icon={AlertCircle}     color="bg-yellow-500/15 text-yellow-400"    delay={0.15} />
      </div>

      {/* Quick Access — above the grid */}
      <div>
        <h3 className="text-sm font-bold font-space-grotesk text-foreground mb-3">
          Quick Access
        </h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <QuickLink label="Licenses"      desc="Manage license keys"   icon={Key}      href="/dashboard/licenses"      color="bg-blue-500/15 text-blue-400"    />
          <QuickLink label="Users"         desc="Manage app users"      icon={Users}    href="/dashboard/users"         color="bg-purple-500/15 text-purple-400" />
          <QuickLink label="Subscriptions" desc="Manage tiers"          icon={CreditCard} href="/dashboard/subscriptions" color="bg-green-500/15 text-green-400" />
          <QuickLink label="Team"          desc="Invite collaborators"  icon={Users}    href="/dashboard/team"          color="bg-orange-500/15 text-orange-400" />
        </div>
      </div>

      {/* Selected app banner */}
      <AnimatePresence>
        {selectedApp && (
          <motion.div
            key={selectedApp.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="rounded-xl border border-primary/20 bg-primary/5 p-4 flex flex-col sm:flex-row sm:items-center gap-4"
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-9 h-9 rounded-lg bg-primary/15 border border-primary/20 flex items-center justify-center shrink-0">
                <Shield className="w-4 h-4 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Currently selected app</p>
                <p className="text-sm font-bold font-space-grotesk text-foreground truncate">
                  {selectedApp.appName}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link
                to="/dashboard/licenses"
                className="text-xs px-3 py-1.5 rounded-lg bg-primary/15 border border-primary/20 text-primary hover:bg-primary/25 transition-colors"
              >
                View Licenses
              </Link>
              <Link
                to="/dashboard/users"
                className="text-xs px-3 py-1.5 rounded-lg border border-border bg-card/40 hover:bg-card/60 transition-colors text-foreground"
              >
                View Users
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Applications grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold font-space-grotesk text-foreground">
            Your Applications
          </h3>
          <span className="text-xs text-muted-foreground">{applications.length} total</span>
        </div>

        {appsLoading ? (
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="rounded-xl border border-border bg-card/40 p-5 h-52 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {applications.map((app) => (
              <AppCard
                key={app.id}
                app={app}
                onSelect={setSelectedApp}
                onDelete={deleteApplication}
                onToggleActive={handleToggleActive}
                onEdit={(a) => setEditApp(a)}
                isSelected={selectedApp?.id === app.id}
              />
            ))}
            <AddAppCard onClick={() => setCreateOpen(true)} />
          </div>
        )}
      </div>

      {/* Create dialog */}
      <AppFormDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
      />

      {/* Edit dialog */}
      <AppFormDialog
        open={!!editApp}
        onClose={() => setEditApp(null)}
        initialData={editApp}
      />
    </div>
  );
}

export default function Overview() {
  return (
    <DashboardLayout>
      <OverviewContent />
    </DashboardLayout>
  );
}
