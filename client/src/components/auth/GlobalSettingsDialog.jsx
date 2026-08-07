import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, User, Lock, Link2, ChevronRight, Loader2, Check } from "lucide-react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

import { useAuth } from "@/context/AuthContext";

/* ── tiny helpers ──────────────────────────────────────────── */

function Field({ label, children, hint }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-medium text-muted-foreground">{label}</label>
      {children}
      {hint && <p className="text-[11px] text-muted-foreground/70">{hint}</p>}
    </div>
  );
}

function TextInput({ className = "", ...props }) {
  return (
    <input
      {...props}
      className={`w-full bg-secondary/30 border border-border rounded-md px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    />
  );
}

function SaveButton({ loading, done }) {
  return (
    <button
      type="submit"
      disabled={loading || done}
      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-semibold font-space-grotesk hover:bg-primary/80 transition-colors disabled:opacity-60 cursor-pointer"
    >
      {loading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : done ? (
        <Check className="w-3.5 h-3.5" />
      ) : null}
      {loading ? "Saving…" : done ? "Saved" : "Save"}
    </button>
  );
}

/* ── section shell ─────────────────────────────────────────── */
function Section({ title, children }) {
  return (
    <div className="border-b border-border last:border-0">
      <div className="px-5 py-4">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          {title}
        </p>
        {children}
      </div>
    </div>
  );
}

/* ── NAV tabs ──────────────────────────────────────────────── */
const TABS = [
  { id: "profile",  label: "Profile",  icon: User  },
  { id: "security", label: "Security", icon: Lock  },
  { id: "accounts", label: "Accounts", icon: Link2 },
];

/* ══════════════════════════════════════════════════════════════
   TAB PANELS
═══════════════════════════════════════════════════════════════ */

/* ── Profile tab ───────────────────────────────────────────── */
function ProfileTab() {
  const { user, updateName, updateEmail } = useAuth();

  const [name, setName]       = useState(user?.name  || "");
  const [nameBusy, setNameBusy]   = useState(false);
  const [nameDone, setNameDone]   = useState(false);

  const [email, setEmail]     = useState(user?.email || "");
  const [emailPass, setEmailPass] = useState("");
  const [emailBusy, setEmailBusy] = useState(false);
  const [emailDone, setEmailDone] = useState(false);

  // sync if user object updates externally
  useEffect(() => { if (user?.name)  setName(user.name);  }, [user?.name]);
  useEffect(() => { if (user?.email) setEmail(user.email); }, [user?.email]);

  const handleName = async (e) => {
    e.preventDefault();
    if (name.trim() === user?.name) return;
    setNameBusy(true);
    const res = await updateName(name.trim());
    setNameBusy(false);
    if (res?.success) {
      toast.success(res.message);
      setNameDone(true);
      setTimeout(() => setNameDone(false), 2000);
    } else {
      toast.error(res?.message || "Failed to update name");
    }
  };

  const handleEmail = async (e) => {
    e.preventDefault();
    if (!emailPass) { toast.error("Enter your current password to change email"); return; }
    setEmailBusy(true);
    const res = await updateEmail(email.trim(), emailPass);
    setEmailBusy(false);
    if (res?.success) {
      toast.success(res.message);
      setEmailPass("");
      setEmailDone(true);
      setTimeout(() => setEmailDone(false), 2000);
    } else {
      toast.error(res?.message || "Failed to update email");
    }
  };

  return (
    <div className="divide-y divide-border">
      {/* Name */}
      <form onSubmit={handleName} className="px-5 py-4 space-y-3">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Display name
        </p>
        <Field label="Full name">
          <TextInput
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            minLength={3}
            maxLength={50}
            required
          />
        </Field>
        <div className="flex justify-end">
          <SaveButton loading={nameBusy} done={nameDone} />
        </div>
      </form>

      {/* Email */}
      <form onSubmit={handleEmail} className="px-5 py-4 space-y-3">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Email address
        </p>
        <Field label="Email">
          <TextInput
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
          />
        </Field>
        <Field label="Confirm with current password" hint="Required to verify it's you">
          <TextInput
            type="password"
            value={emailPass}
            onChange={(e) => setEmailPass(e.target.value)}
            placeholder="Current password"
          />
        </Field>
        <div className="flex justify-end">
          <SaveButton loading={emailBusy} done={emailDone} />
        </div>
      </form>
    </div>
  );
}

/* ── Security tab ──────────────────────────────────────────── */
function SecurityTab({ onPasswordChanged }) {
  const { updatePassword } = useAuth();
  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.newPassword !== form.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    setBusy(true);
    const res = await updatePassword(form.currentPassword, form.newPassword, form.confirmPassword);
    setBusy(false);
    if (res?.success) {
      toast.success(res.message);
      onPasswordChanged(); // dialog closes, AuthContext already cleared user
    } else {
      toast.error(res?.message || "Failed to update password");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="divide-y divide-border">
      <div className="px-5 py-4 space-y-3">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Change password
        </p>
        <Field label="Current password">
          <TextInput
            type="password"
            value={form.currentPassword}
            onChange={set("currentPassword")}
            placeholder="Current password"
            required
          />
        </Field>
        <Field label="New password" hint="Minimum 6 characters">
          <TextInput
            type="password"
            value={form.newPassword}
            onChange={set("newPassword")}
            placeholder="New password"
            minLength={6}
            required
          />
        </Field>
        <Field label="Confirm new password">
          <TextInput
            type="password"
            value={form.confirmPassword}
            onChange={set("confirmPassword")}
            placeholder="Confirm new password"
            required
          />
        </Field>
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:justify-between">
          <p className="text-[11px] text-muted-foreground/70">
            You'll be logged out after changing your password.
          </p>
          <SaveButton loading={busy} done={false} />
        </div>
      </div>
    </form>
  );
}

/* ── Accounts tab ──────────────────────────────────────────── */
function AccountsTab() {
  const { user, googleLogin, discordLogin, removeOAuth } = useAuth();
  const [busy, setBusy] = useState({ google: false, discord: false });

  const providers = [
    {
      key: "google",
      label: "Google",
      connected: !!user?.googleId,
      connect: googleLogin,
    },
    {
      key: "discord",
      label: "Discord",
      connected: !!user?.discordId,
      connect: discordLogin,
    },
  ];

  const handleToggle = async (provider) => {
    const p = providers.find((x) => x.key === provider);
    if (!p) return;

    if (!p.connected) {
      p.connect(); // redirect to OAuth
      return;
    }

    setBusy((b) => ({ ...b, [provider]: true }));
    const res = await removeOAuth(provider);
    setBusy((b) => ({ ...b, [provider]: false }));
    if (res?.success) {
      toast.success(res.message);
    } else {
      toast.error(res?.message || "Failed to unlink account");
    }
  };

  return (
    <div className="divide-y divide-border">
      <div className="px-5 py-4 space-y-2">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Connected accounts
        </p>
        {providers.map(({ key, label, connected }) => (
          <div
            key={key}
            className="flex items-center justify-between py-2.5"
          >
            <div>
              <p className="text-sm font-medium text-foreground">{label}</p>
              <p className="text-[11px] text-muted-foreground">
                {connected ? `${label} account is linked` : `Link your ${label} account`}
              </p>
            </div>
            <button
              type="button"
              disabled={busy[key]}
              onClick={() => handleToggle(key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer disabled:opacity-60 ${
                connected
                  ? "border border-border text-muted-foreground hover:border-destructive hover:text-destructive"
                  : "bg-primary text-primary-foreground hover:bg-primary/80"
              }`}
            >
              {busy[key] ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : connected ? (
                <Check className="w-3 h-3" />
              ) : (
                <Link2 className="w-3 h-3" />
              )}
              {connected ? "Connected" : "Connect"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   MAIN DIALOG
═══════════════════════════════════════════════════════════════ */

export default function GlobalSettingsDialog({ open, onOpenChange }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState("profile");
  const overlayRef = useRef(null);

  // reset to profile tab whenever dialog opens
  useEffect(() => { if (open) setTab("profile"); }, [open]);

  const handlePasswordChanged = () => {
    onOpenChange(false);
    navigate("/login");
  };

  const TabContent = {
    profile:  <ProfileTab />,
    security: <SecurityTab onPasswordChanged={handlePasswordChanged} />,
    accounts: <AccountsTab />,
  }[tab];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={overlayRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[80] flex items-center justify-center px-3 py-4 sm:py-6 bg-black/60 backdrop-blur-sm"
          onClick={(e) => { if (e.target === overlayRef.current) onOpenChange(false); }}
        >
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            className="w-full max-w-[680px] overflow-hidden rounded-xl border border-border bg-card shadow-2xl shadow-black/40 flex flex-col"
            style={{ maxHeight: "90vh" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
              <div>
                <h2 className="text-sm font-semibold text-foreground font-space-grotesk">
                  Account settings
                </h2>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {user?.email}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent/60 transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body: sidebar nav + content */}
            <div className="flex flex-col sm:flex-row flex-1 overflow-hidden">

              {/* ── Mobile: horizontal top tab bar ── */}
              <nav className="sm:hidden flex shrink-0 border-b border-border bg-background/40 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {TABS.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setTab(id)}
                    className={`flex items-center gap-2 px-4 py-3 text-xs font-medium whitespace-nowrap transition-colors cursor-pointer border-b-2 ${
                      tab === id
                        ? "border-primary text-foreground"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    {label}
                  </button>
                ))}
              </nav>

              {/* ── Desktop: vertical left nav ── */}
              <nav className="hidden sm:flex flex-col w-40 shrink-0 border-r border-border py-2 bg-background/40">
                {TABS.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setTab(id)}
                    className={`w-full flex items-center justify-between px-4 py-2.5 text-xs font-medium transition-colors cursor-pointer ${
                      tab === id
                        ? "text-foreground bg-accent/60"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent/40"
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <Icon className="w-3.5 h-3.5 shrink-0" />
                      {label}
                    </span>
                    {tab === id && <ChevronRight className="w-3 h-3 opacity-50" />}
                  </button>
                ))}
              </nav>

              {/* Right content */}
              <div className="flex-1 overflow-y-auto">
                {TabContent}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
