import { useClient } from "@/context/ClientContext";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  Plus,
  Shield,
  Activity,
  Copy,
  Check,
  X,
} from "lucide-react";
import { useState } from "react";
import { useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// ── Page meta map ─────────────────────────────────────────────────────────────
const PAGE_META = {
  "/dashboard/overview":     { title: "Overview",      desc: "Your applications at a glance" },
  "/dashboard/licenses":     { title: "Licenses",      desc: "Manage license keys for your application" },
  "/dashboard/users":        { title: "Users",         desc: "Manage users inside your application" },
  "/dashboard/subscriptions":{ title: "Subscriptions", desc: "Manage subscription tiers" },
  "/dashboard/team":         { title: "Team",          desc: "Collaborate with your team" },
};

// ── Create App Dialog ─────────────────────────────────────────────────────────
function CreateAppDialog({ open, onClose }) {
  const { createApplication } = useClient();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    appName: "",
    appDescription: "",
    appVersion: "1.0",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.appName.trim()) {
      toast.error("App name is required");
      return;
    }
    setLoading(true);
    const res = await createApplication(form);
    setLoading(false);
    if (res?.success) {
      toast.success("Application created!");
      setForm({ appName: "", appDescription: "", appVersion: "1.0" });
      onClose();
    } else {
      toast.error(res?.message || "Failed to create application");
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            key="bd"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            key="panel"
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
                  Create New Application
                </h2>
                <p className="text-xs text-muted-foreground mt-1">
                  An RSA-2048 keypair will be auto-generated for secure encryption.
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 -mt-0.5 rounded-md hover:bg-accent/60 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form body */}
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

              {/* Security note */}
              <div className="flex items-start gap-2.5 p-3 rounded-lg bg-primary/5 border border-primary/15">
                <Shield className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Public key will be shown after creation. Private key is stored
                  encrypted at rest using AES-256-GCM.
                </p>
              </div>

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
                  className="flex-1 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-bold font-space-grotesk hover:bg-primary/80 transition-colors disabled:opacity-60"
                >
                  {loading ? "Creating..." : "Create App"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// ── App Key copy badge ────────────────────────────────────────────────────────
function AppKeyBadge({ appKey }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(appKey);
    setCopied(true);
    toast.success("App key copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const short = appKey ? `${appKey.slice(0, 10)}...` : "";

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={handleCopy}
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-border bg-secondary/30 hover:bg-accent/60 transition-all duration-200 group"
        >
          <Shield className="w-3 h-3 text-primary" />
          <span className="text-xs font-mono text-muted-foreground group-hover:text-foreground transition-colors">
            {short}
          </span>
          {copied ? (
            <Check className="w-3 h-3 text-green-400" />
          ) : (
            <Copy className="w-3 h-3 text-muted-foreground/50 group-hover:text-muted-foreground transition-colors" />
          )}
        </button>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="text-xs">
        Click to copy App Key
      </TooltipContent>
    </Tooltip>
  );
}

// ── Main Header ───────────────────────────────────────────────────────────────
export default function ClientHeader({ onMobileMenuToggle }) {
  const location = useLocation();
  const { selectedApp } = useClient();
  const [dialogOpen, setDialogOpen] = useState(false);

  const meta = PAGE_META[location.pathname] || { title: "Dashboard", desc: "" };

  return (
    <>
      <header className="h-14 shrink-0 flex items-center justify-between px-4 sm:px-6 border-b border-border bg-sidebar/80 backdrop-blur-md sticky top-0 z-30">
        {/* Left */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMobileMenuToggle}
            className="lg:hidden p-2 -ml-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent/60 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <h1 className="text-sm font-bold font-space-grotesk text-foreground leading-none">
              {meta.title}
            </h1>
            {meta.desc && (
              <p className="text-[11px] text-muted-foreground mt-0.5 hidden sm:block">
                {meta.desc}
              </p>
            )}
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2">
          {selectedApp?.appKey && <AppKeyBadge appKey={selectedApp.appKey} />}

          {selectedApp && (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-border bg-secondary/30">
                  <div className={cn(
                    "w-1.5 h-1.5 rounded-full",
                    selectedApp.isActive ? "bg-green-400 animate-pulse" : "bg-red-400"
                  )} />
                  <span className="text-xs text-muted-foreground">
                    {selectedApp.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">
                Application status
              </TooltipContent>
            </Tooltip>
          )}

          <button
            onClick={() => setDialogOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/80 transition-all duration-200"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline font-space-grotesk font-semibold">New App</span>
          </button>
        </div>
      </header>

      <CreateAppDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
    </>
  );
}
