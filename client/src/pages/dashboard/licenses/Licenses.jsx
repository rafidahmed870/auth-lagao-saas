import { useClient } from "@/context/ClientContext";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useAppAccess } from "@/hooks/use-app-access";
import AccessDenied from "@/components/dashboard/AccessDenied";
import { motion, AnimatePresence } from "framer-motion";
import {
  Key,
  Plus,
  Trash2,
  Copy,
  Check,
  CalendarClock,
  AlertCircle,
  Search,
  ChevronLeft,
  ChevronRight,
  Edit2,
  X,
  RefreshCw,
  Settings2,
  MoreHorizontal,
  CreditCard,
  ChevronDown,
  Cpu,
  ShieldCheck,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";

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

const nextYear = () => {
  const d = new Date();
  d.setFullYear(d.getFullYear() + 1);
  return d.toISOString().split("T")[0];
};

// Auto-generate a license key preview (same logic as server)
const generateKeyPreview = (prefix, suffix) => {
  const seg = () => Math.random().toString(16).slice(2, 6).toUpperCase();
  const core = `${seg()}-${seg()}-${seg()}-${seg()}`;
  const parts = [];
  if (prefix?.trim()) parts.push(prefix.trim().toUpperCase());
  parts.push(core);
  if (suffix?.trim()) parts.push(suffix.trim().toUpperCase());
  return parts.join("-");
};

// ── 3-dot dropdown menu ───────────────────────────────────────────────────────
function MoreMenu({ items }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={(e) => { e.stopPropagation(); setOpen((v) => !v); }}
        className={cn(
          "cursor-pointer p-1.5 rounded-md transition-all duration-150",
          open
            ? "bg-accent/60 text-foreground"
            : "text-muted-foreground hover:text-foreground hover:bg-accent/60"
        )}
        aria-label="More actions"
      >
        <MoreHorizontal className="w-4 h-4" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: -4 }}
            transition={{ duration: 0.12 }}
            className="absolute right-0 top-full mt-1 z-50 min-w-[140px] rounded-xl border border-border bg-card shadow-xl shadow-black/30 overflow-hidden"
          >
            {items.map((item, i) => (
              <button
                key={i}
                onClick={(e) => { e.stopPropagation(); setOpen(false); item.onClick(); }}
                disabled={item.disabled}
                className={cn(
                  "w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed",
                  item.variant === "destructive"
                    ? "text-destructive hover:bg-destructive/10"
                    : "text-foreground hover:bg-accent/60"
                )}
              >
                {item.icon && <item.icon className="w-3.5 h-3.5 shrink-0" />}
                {item.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Subscription Picker ───────────────────────────────────────────────────────
function SubscriptionPicker({ value, onChange, subscriptions }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const selected = subscriptions.find((s) => s.id === value) || null;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border text-sm transition-all duration-200 text-left",
          open
            ? "border-primary bg-secondary/40 shadow-sm shadow-primary/10"
            : "border-border bg-secondary/30 hover:border-border/80 hover:bg-secondary/40"
        )}
      >
        <CreditCard className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
        <span className={cn("flex-1 truncate", selected ? "text-foreground" : "text-muted-foreground/60")}>
          {selected ? selected.name : "None — no subscription"}
        </span>
        <ChevronDown className={cn("w-3.5 h-3.5 text-muted-foreground transition-transform duration-200 shrink-0", open && "rotate-180")} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.13 }}
            className="absolute left-0 right-0 top-full mt-1.5 z-50 rounded-xl border border-border bg-card shadow-xl shadow-black/30 overflow-hidden"
          >
            <button
              type="button"
              onClick={() => { onChange(""); setOpen(false); }}
              className={cn(
                "w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm transition-colors text-left",
                !value ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
              )}
            >
              <div className={cn("w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0", !value ? "border-primary bg-primary" : "border-border")}>
                {!value && <div className="w-2 h-2 rounded-full bg-white" />}
              </div>
              <span>None — no subscription</span>
            </button>
            {subscriptions.length > 0 && <div className="border-t border-border/50" />}
            {subscriptions.map((sub) => {
              const isSelected = value === sub.id;
              return (
                <button
                  key={sub.id}
                  type="button"
                  onClick={() => { onChange(sub.id); setOpen(false); }}
                  className={cn(
                    "w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm transition-colors text-left",
                    isSelected ? "bg-primary/10 text-primary" : "text-foreground hover:bg-accent/60"
                  )}
                >
                  <div className={cn("w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0", isSelected ? "border-primary bg-primary" : "border-border")}>
                    {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                  <span className="flex-1 truncate font-medium">{sub.name}</span>
                </button>
              );
            })}
            {subscriptions.length === 0 && (
              <div className="px-3.5 py-3 text-xs text-muted-foreground text-center">No subscription tiers yet</div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Toggle Row ────────────────────────────────────────────────────────────────
function ToggleRow({ icon: Icon, title, description, value, onChange, color = "primary" }) {
  const colors = {
    primary: { on: "bg-primary/8 border-primary/30", icon: "bg-primary/15 border-primary/25 text-primary", pill: "bg-primary border-primary/60" },
    blue:    { on: "bg-blue-500/8 border-blue-500/25", icon: "bg-blue-500/15 border-blue-500/25 text-blue-400", pill: "bg-blue-500 border-blue-400" },
  };
  const c = colors[color] || colors.primary;
  return (
    <div
      className={cn(
        "flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all duration-200 select-none",
        value ? c.on : "bg-secondary/20 border-border hover:bg-secondary/30"
      )}
      onClick={() => onChange(!value)}
    >
      <div className="flex items-start gap-3">
        <div className={cn("mt-0.5 p-1.5 rounded-lg border", value ? c.icon : "bg-secondary/40 border-border text-muted-foreground")}>
          <Icon className="w-3.5 h-3.5" />
        </div>
        <div>
          <p className="text-xs font-medium font-space-grotesk text-foreground">{title}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5 leading-relaxed">{description}</p>
        </div>
      </div>
      <div className={cn("relative w-9 h-5 rounded-full border transition-all duration-300 shrink-0 ml-3", value ? c.pill : "bg-secondary border-border")}>
        <div className={cn("absolute top-0.5 w-3.5 h-3.5 rounded-full bg-white shadow-sm transition-all duration-300", value ? "translate-x-4" : "translate-x-0.5")} />
      </div>
    </div>
  );
}

// ── Create License Dialog ─────────────────────────────────────────────────────
function CreateLicenseDialog({ appId, open, onClose, onCreated }) {
  const { createLicense, subscriptions, fetchSubscriptions, selectedApp } = useClient();
  const [loading, setLoading] = useState(false);
  const [customize, setCustomize] = useState(false);
  const [form, setForm] = useState({
    key: "",
    prefix: "",
    suffix: "",
    appSubscriptionId: "",
    hwidLocked: false,
    isOneTimeLogin: false,
    expiresAt: nextYear(),
  });
  const [preview, setPreview] = useState(() => generateKeyPreview("", ""));

  // Ensure subscriptions loaded
  useEffect(() => {
    if (selectedApp?.id && subscriptions.length === 0) {
      fetchSubscriptions(selectedApp.id);
    }
  }, [selectedApp?.id, subscriptions.length, fetchSubscriptions]);

  const regenerate = (prefix = form.prefix, suffix = form.suffix) => {
    setPreview(generateKeyPreview(prefix, suffix));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.expiresAt) { toast.error("Expiry date is required"); return; }
    if (customize && form.key.trim() && form.key.trim().length < 4) {
      toast.error("Custom key must be at least 4 characters");
      return;
    }

    setLoading(true);
    const payload = {
      expiresAt: new Date(form.expiresAt).toISOString(),
      appSubscriptionId: form.appSubscriptionId || null,
      hwidLocked: form.hwidLocked,
      isOneTimeLogin: form.isOneTimeLogin,
      ...(customize && form.key.trim()
        ? { key: form.key.trim() }
        : { prefix: form.prefix.trim(), suffix: form.suffix.trim() }),
    };

    const res = await createLicense(appId, payload);
    setLoading(false);
    if (res?.success) {
      toast.success("License created!");
      setForm({ key: "", prefix: "", suffix: "", appSubscriptionId: "", hwidLocked: false, isOneTimeLogin: false, expiresAt: nextYear() });
      setPreview(generateKeyPreview("", ""));
      setCustomize(false);
      onClose();
      onCreated?.();
    } else {
      toast.error(res?.message || "Failed to create license");
    }
  };

  useEffect(() => {
    if (open) {
      setForm({ key: "", prefix: "", suffix: "", appSubscriptionId: "", hwidLocked: false, isOneTimeLogin: false, expiresAt: nextYear() });
      setPreview(generateKeyPreview("", ""));
      setCustomize(false);
    }
  }, [open]);

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
            className="relative z-10 w-full max-w-md rounded-2xl border border-border bg-card shadow-2xl shadow-black/50"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-border">
              <div>
                <h2 className="text-base font-bold font-space-grotesk text-foreground">Add License Key</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Key is auto-generated. Customize below if needed.</p>
              </div>
              <button onClick={onClose} className="cursor-pointer p-1.5 rounded-md hover:bg-accent/60 text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">

              {/* Auto-generated preview */}
              {!customize && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-medium text-muted-foreground">Generated Key Preview</label>
                    <button
                      type="button"
                      onClick={() => regenerate()}
                      className="cursor-pointer flex items-center gap-1 text-[10px] text-primary hover:text-primary/80 transition-colors"
                    >
                      <RefreshCw className="w-2.5 h-2.5" />
                      Regenerate
                    </button>
                  </div>
                  <div className="flex items-center gap-2 w-full bg-secondary/30 border border-border rounded-lg py-2.5 px-3.5">
                    <code className="flex-1 text-xs font-mono text-foreground/80 truncate">{preview}</code>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1.5">
                    The actual key is generated on the server — this is only a preview of the format.
                  </p>
                </div>
              )}

              {/* Customize toggle */}
              <div
                className={cn(
                  "flex items-center justify-between p-3.5 rounded-xl border cursor-pointer select-none transition-all duration-200",
                  customize ? "bg-primary/8 border-primary/30" : "bg-secondary/20 border-border hover:bg-secondary/30"
                )}
                onClick={() => setCustomize((v) => !v)}
              >
                <div className="flex items-center gap-2.5">
                  <Settings2 className={cn("w-4 h-4", customize ? "text-primary" : "text-muted-foreground")} />
                  <div>
                    <p className="text-xs font-medium text-foreground">Customize Key</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {customize ? "Add a prefix/suffix or enter a fully custom key" : "Click to add prefix, suffix, or enter a custom key"}
                    </p>
                  </div>
                </div>
                <div className={cn(
                  "relative w-9 h-5 rounded-full border transition-all duration-300 shrink-0",
                  customize ? "bg-primary border-primary/60" : "bg-secondary border-border"
                )}>
                  <div className={cn(
                    "absolute top-0.5 w-3.5 h-3.5 rounded-full bg-white shadow-sm transition-all duration-300",
                    customize ? "translate-x-4" : "translate-x-0.5"
                  )} />
                </div>
              </div>

              {/* Customize fields */}
              <AnimatePresence>
                {customize && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.15 }}
                    className="overflow-hidden space-y-3"
                  >
                    {/* Prefix + Suffix side by side */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1.5">Prefix</label>
                        <input
                          type="text"
                          value={form.prefix}
                          onChange={(e) => {
                            const v = e.target.value.replace(/[^A-Za-z0-9_-]/g, "").slice(0, 20);
                            setForm((p) => ({ ...p, prefix: v }));
                            regenerate(v, form.suffix);
                          }}
                          placeholder="e.g. PROD"
                          className="w-full bg-secondary/30 border border-border rounded-lg py-2 px-3 text-sm font-mono focus:outline-none focus:border-primary transition-colors placeholder:text-muted-foreground/40"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1.5">Suffix</label>
                        <input
                          type="text"
                          value={form.suffix}
                          onChange={(e) => {
                            const v = e.target.value.replace(/[^A-Za-z0-9_-]/g, "").slice(0, 20);
                            setForm((p) => ({ ...p, suffix: v }));
                            regenerate(form.prefix, v);
                          }}
                          placeholder="e.g. 2025"
                          className="w-full bg-secondary/30 border border-border rounded-lg py-2 px-3 text-sm font-mono focus:outline-none focus:border-primary transition-colors placeholder:text-muted-foreground/40"
                        />
                      </div>
                    </div>

                    {/* Preview with prefix/suffix applied */}
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1.5">Preview</label>
                      <div className="flex items-center gap-2 w-full bg-secondary/20 border border-border rounded-lg py-2 px-3">
                        <code className="flex-1 text-[11px] font-mono text-foreground/70 truncate">{preview}</code>
                        <button
                          type="button"
                          onClick={() => regenerate()}
                          className="cursor-pointer text-muted-foreground hover:text-primary transition-colors shrink-0"
                          title="Regenerate preview"
                        >
                          <RefreshCw className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* Divider */}
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-px bg-border" />
                      <span className="text-[10px] text-muted-foreground">or enter a fully custom key</span>
                      <div className="flex-1 h-px bg-border" />
                    </div>

                    {/* Full custom key override */}
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1.5">Custom Key</label>
                      <input
                        type="text"
                        value={form.key}
                        onChange={(e) => setForm((p) => ({ ...p, key: e.target.value }))}
                        placeholder="MY-KEY-XXXX-XXXX (overrides prefix/suffix)"
                        className="w-full bg-secondary/30 border border-border rounded-lg py-2.5 px-3.5 text-sm font-mono text-foreground focus:outline-none focus:border-primary transition-colors placeholder:text-muted-foreground/40"
                      />
                      {form.key.trim() && (
                        <p className="text-[10px] text-primary mt-1">Custom key will be used as-is.</p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Subscription Picker */}
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                  Subscription Tier
                </label>
                <SubscriptionPicker
                  value={form.appSubscriptionId}
                  onChange={(v) => setForm((p) => ({ ...p, appSubscriptionId: v }))}
                  subscriptions={subscriptions}
                />
              </div>

              {/* Toggles */}
              <div className="space-y-2">
                <ToggleRow
                  icon={Cpu}
                  title="Device Lock (HWID)"
                  description={form.hwidLocked ? "First device to activate this key will be locked to it." : "Key can be activated from any device."}
                  value={form.hwidLocked}
                  onChange={(v) => setForm((p) => ({ ...p, hwidLocked: v }))}
                  color="blue"
                />
                <ToggleRow
                  icon={ShieldCheck}
                  title="One-Time Login"
                  description={form.isOneTimeLogin ? "User can access only one time." : "Users can access multiple time."}
                  value={form.isOneTimeLogin}
                  onChange={(v) => setForm((p) => ({ ...p, isOneTimeLogin: v }))}
                  color="primary"
                />
              </div>

              {/* Expiry */}
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                  Expires At <span className="text-destructive">*</span>
                </label>
                <input
                  type="date"
                  value={form.expiresAt}
                  onChange={(e) => setForm((p) => ({ ...p, expiresAt: e.target.value }))}
                  className="w-full bg-secondary/30 border border-border rounded-lg py-2.5 px-3.5 text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
                />
              </div>

              {/* Footer */}
              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="cursor-pointer flex-1 py-2.5 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-accent/60 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="cursor-pointer flex-1 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold font-space-grotesk hover:bg-primary/80 transition-colors disabled:opacity-60"
                >
                  {loading ? "Creating…" : "Create License"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// ── Edit License Dialog (update expiry) ───────────────────────────────────────
function EditLicenseDialog({ appId, license, open, onClose, onUpdated }) {
  const [loading, setLoading] = useState(false);
  const [expiresAt, setExpiresAt] = useState(
    license ? new Date(license.expiresAt).toISOString().split("T")[0] : nextYear()
  );

  // Sync when license changes
  useEffect(() => {
    if (license) setExpiresAt(new Date(license.expiresAt).toISOString().split("T")[0]);
  }, [license]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!expiresAt) { toast.error("Expiry date is required"); return; }
    setLoading(true);
    try {
      const res = await api.patch(`/applications/${appId}/licenses/${license.id}`, {
        expiresAt: new Date(expiresAt).toISOString(),
      });
      if (res.data.success) {
        toast.success("License updated!");
        onUpdated?.();
        onClose();
      } else {
        toast.error(res.data.message || "Failed to update");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update license");
    } finally {
      setLoading(false);
    }
  };

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
            className="relative z-10 w-full max-w-sm rounded-2xl border border-border bg-card shadow-2xl shadow-black/50"
          >
            <div className="flex items-center justify-between px-6 py-5 border-b border-border">
              <h2 className="text-base font-bold font-space-grotesk text-foreground">Edit License</h2>
              <button onClick={onClose} className="cursor-pointer p-1.5 rounded-md hover:bg-accent/60 text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Show the key (read-only) */}
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">License Key</label>
                <div className="w-full bg-secondary/20 border border-border rounded-lg py-2.5 px-3.5 text-sm font-mono text-muted-foreground truncate">
                  {license?.key}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                  New Expiry Date <span className="text-destructive">*</span>
                </label>
                <input
                  type="date"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                  autoFocus
                  className="w-full bg-secondary/30 border border-border rounded-lg py-2.5 px-3.5 text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
                />
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

// ── License Row ───────────────────────────────────────────────────────────────
function LicenseRow({ license, appId, onDelete, onEdit, canWrite = true }) {
  const [copied, setCopied] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const expired = isExpired(license.expiresAt);

  const handleCopy = () => {
    navigator.clipboard.writeText(license.key);
    setCopied(true);
    toast.success("License key copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDelete = async () => {
    setDeleting(true);
    const res = await onDelete(appId, license.id);
    setDeleting(false);
    if (res?.success) {
      setDeleteOpen(false);
    } else {
      toast.error(res?.message || "Failed to delete license");
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
        {/* Key */}
        <td className="py-3 px-4">
          <div className="flex items-center gap-2">
            <code className="text-xs font-mono text-foreground/80 truncate max-w-45 sm:max-w-xs">
              {license.key}
            </code>
            <button
              onClick={handleCopy}
              className="cursor-pointer shrink-0 text-muted-foreground hover:text-primary transition-colors sm:opacity-0 sm:group-hover:opacity-100"
            >
              {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
            </button>
          </div>
        </td>

        {/* Expiry */}
        <td className="py-3 px-4 hidden sm:table-cell">
          <div className="flex items-center gap-1.5">
            <CalendarClock className="w-3 h-3 text-muted-foreground" />
            <span className={cn("text-xs", expired ? "text-destructive" : "text-muted-foreground")}>
              {formatDate(license.expiresAt)}
            </span>
          </div>
        </td>

        {/* Status */}
        <td className="py-3 px-4">
          <span className={cn(
            "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border",
            expired
              ? "bg-destructive/10 text-destructive border-destructive/20"
              : "bg-green-500/10 text-green-400 border-green-500/20"
          )}>
            <span className={cn("w-1 h-1 rounded-full", expired ? "bg-destructive" : "bg-green-400")} />
            {expired ? "Expired" : "Valid"}
          </span>
        </td>

        {/* Created */}
        <td className="py-3 px-4 hidden lg:table-cell">
          <span className="text-xs text-muted-foreground">{formatDate(license.createdAt)}</span>
        </td>

        {/* Actions */}
        <td className="py-3 px-4">
          {canWrite && (
            <MoreMenu items={[
              { label: "Copy Key",    icon: Copy,   onClick: handleCopy },
              { label: "Edit Expiry", icon: Edit2,  onClick: () => onEdit(license) },
              { label: "Delete",      icon: Trash2, onClick: () => setDeleteOpen(true), variant: "destructive" },
            ]} />
          )}
        </td>
      </motion.tr>

      {/* Delete confirm */}
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete License"
        description="This will permanently delete the license key. This action cannot be undone."
        confirmLabel="Delete"
        variant="destructive"
        loading={deleting}
        onConfirm={handleDelete}
      />
    </>
  );
}

// ── Licenses page content ─────────────────────────────────────────────────────
const PAGE_SIZE = 10;

function LicensesContent() {
  const { selectedApp, licenses, fetchLicenses, deleteLicense, resourceLoading } = useClient();
  const { hasPermission } = useAppAccess();
  const canWrite = hasPermission(["app.license.create", "app.license.update", "app.license.delete"]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);
  const [editLicense, setEditLicense] = useState(null);

  useEffect(() => {
    if (selectedApp?.id) fetchLicenses(selectedApp.id);
  }, [selectedApp?.id, fetchLicenses]);

  // Permission gate — must have at least view permission
  if (selectedApp && !hasPermission("app.license.view")) {
    return <AccessDenied permission="app.license.view" pageName="Licenses" />;
  }

  const filtered = licenses.filter((l) =>
    l.key.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  if (!selectedApp) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
        <AlertCircle className="w-10 h-10 text-muted-foreground/40" />
        <p className="text-sm font-medium font-space-grotesk text-foreground">No application selected</p>
        <p className="text-xs text-muted-foreground max-w-xs">
          Select an application from the sidebar to manage its licenses.
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
            {selectedApp.appName} — Licenses
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {licenses.length} license{licenses.length !== 1 ? "s" : ""} total
          </p>
        </div>
        {canWrite && (
          <button
            onClick={() => setCreateOpen(true)}
            className="cursor-pointer flex items-center gap-2 px-3.5 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/80 transition-all duration-200 w-fit"
          >
            <Plus className="w-3.5 h-3.5" />
            Add License
          </button>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search license keys…"
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
            <Key className="w-8 h-8 text-muted-foreground/30" />
            <p className="text-sm font-medium font-space-grotesk text-foreground">
              {search ? "No matching licenses" : "No licenses yet"}
            </p>
            <p className="text-xs text-muted-foreground">
              {search ? "Try a different search term." : "Add your first license key above."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-card/60">
                  <th className="py-3 px-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Key</th>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Expires</th>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Created</th>
                  <th className="py-3 px-4 w-16" />
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {paginated.map((license) => (
                    <LicenseRow
                      key={license.id}
                      license={license}
                      appId={selectedApp.id}
                      onDelete={deleteLicense}
                      onEdit={(l) => setEditLicense(l)}
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

      {/* Dialogs */}
      <CreateLicenseDialog
        appId={selectedApp.id}
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={() => fetchLicenses(selectedApp.id)}
      />
      <EditLicenseDialog
        appId={selectedApp.id}
        license={editLicense}
        open={!!editLicense}
        onClose={() => setEditLicense(null)}
        onUpdated={() => fetchLicenses(selectedApp.id)}
      />
    </div>
  );
}

export default function Licenses() {
  return <LicensesContent />;
}
