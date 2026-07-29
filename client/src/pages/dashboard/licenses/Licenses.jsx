import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useClient } from "@/context/ClientContext";
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
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { cn } from "@/lib/utils";

// ── Helpers ──────────────────────────────────────────────────────────────────
const isExpired = (date) => date && new Date(date) < new Date();

const formatDate = (date) =>
  date
    ? new Date(date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "—";

// ── License Row ───────────────────────────────────────────────────────────────
function LicenseRow({ license, appId, onDelete }) {
  const [copied, setCopied] = useState(false);
  const expired = isExpired(license.expiresAt);

  const handleCopy = () => {
    navigator.clipboard.writeText(license.key);
    setCopied(true);
    toast.success("License key copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this license? This cannot be undone.")) return;
    const res = await onDelete(appId, license.id);
    if (!res?.success) toast.error(res?.message || "Failed to delete license");
  };

  return (
    <motion.tr
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="border-b border-border/50 group hover:bg-accent/20 transition-colors"
    >
      {/* Key */}
      <td className="py-3 px-4">
        <div className="flex items-center gap-2">
          <code className="text-xs font-mono text-foreground/80 truncate max-w-[180px] sm:max-w-xs">
            {license.key}
          </code>
          <button
            onClick={handleCopy}
            className="shrink-0 text-muted-foreground hover:text-primary transition-colors opacity-0 group-hover:opacity-100"
          >
            {copied ? (
              <Check className="w-3 h-3 text-green-400" />
            ) : (
              <Copy className="w-3 h-3" />
            )}
          </button>
        </div>
      </td>

      {/* Expiry */}
      <td className="py-3 px-4 hidden sm:table-cell">
        <div className="flex items-center gap-1.5">
          <CalendarClock className="w-3 h-3 text-muted-foreground" />
          <span
            className={cn(
              "text-xs",
              expired ? "text-destructive" : "text-muted-foreground"
            )}
          >
            {formatDate(license.expiresAt)}
          </span>
        </div>
      </td>

      {/* Status */}
      <td className="py-3 px-4">
        <span
          className={cn(
            "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border",
            expired
              ? "bg-destructive/10 text-destructive border-destructive/20"
              : "bg-green-500/10 text-green-400 border-green-500/20"
          )}
        >
          <span className={cn("w-1 h-1 rounded-full", expired ? "bg-destructive" : "bg-green-400")} />
          {expired ? "Expired" : "Valid"}
        </span>
      </td>

      {/* Created */}
      <td className="py-3 px-4 hidden lg:table-cell">
        <span className="text-xs text-muted-foreground">
          {formatDate(license.createdAt)}
        </span>
      </td>

      {/* Actions */}
      <td className="py-3 px-4">
        <button
          onClick={handleDelete}
          className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-200 opacity-0 group-hover:opacity-100"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </td>
    </motion.tr>
  );
}

// ── Create License Form ────────────────────────────────────────────────────────
function CreateLicensePanel({ appId, onCreated }) {
  const { createLicense } = useClient();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ key: "", expiresAt: "" });

  // Default expiry = 1 year from now
  const defaultExpiry = () => {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 1);
    return d.toISOString().split("T")[0];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.key.trim() || !form.expiresAt) {
      toast.error("Key and expiry are required");
      return;
    }
    setLoading(true);
    const res = await createLicense(appId, {
      key: form.key,
      expiresAt: new Date(form.expiresAt).toISOString(),
    });
    setLoading(false);
    if (res?.success) {
      toast.success("License created!");
      setForm({ key: "", expiresAt: "" });
      setOpen(false);
      onCreated?.();
    } else {
      toast.error(res?.message || "Failed to create license");
    }
  };

  return (
    <div>
      <button
        onClick={() => setOpen((p) => !p)}
        className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/80 transition-all duration-200"
      >
        <Plus className="w-3.5 h-3.5" />
        Add License
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <form
              onSubmit={handleSubmit}
              className="mt-4 p-4 rounded-xl border border-primary/20 bg-primary/5 space-y-3"
            >
              <h4 className="text-sm font-bold font-space-grotesk text-foreground">
                New License Key
              </h4>
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">
                    License Key *
                  </label>
                  <input
                    type="text"
                    value={form.key}
                    onChange={(e) => setForm((p) => ({ ...p, key: e.target.value }))}
                    placeholder="XXXX-XXXX-XXXX-XXXX"
                    className="w-full bg-secondary/30 border border-border rounded-lg py-2 px-3 text-sm font-mono focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">
                    Expires At *
                  </label>
                  <input
                    type="date"
                    value={form.expiresAt || defaultExpiry()}
                    onChange={(e) => setForm((p) => ({ ...p, expiresAt: e.target.value }))}
                    className="w-full bg-secondary/30 border border-border rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="flex-1 py-2 rounded-lg border border-border text-xs hover:bg-accent/60 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2 rounded-lg bg-primary text-primary-foreground text-xs hover:bg-primary/80 transition-colors disabled:opacity-60"
                >
                  {loading ? "Creating..." : "Create License"}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Licenses page content ─────────────────────────────────────────────────────
const PAGE_SIZE = 10;

function LicensesContent() {
  const { selectedApp, licenses, fetchLicenses, deleteLicense, resourceLoading } =
    useClient();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (selectedApp?.id) fetchLicenses(selectedApp.id);
  }, [selectedApp?.id, fetchLicenses]);

  const filtered = licenses.filter((l) =>
    l.key.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  if (!selectedApp) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
        <AlertCircle className="w-10 h-10 text-muted-foreground/40" />
        <p className="text-sm font-medium font-space-grotesk text-foreground">
          No application selected
        </p>
        <p className="text-xs text-muted-foreground max-w-xs">
          Select an application from the sidebar to manage its licenses.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-base font-bold font-space-grotesk text-foreground">
            {selectedApp.appName} — Licenses
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {licenses.length} license{licenses.length !== 1 ? "s" : ""} total
          </p>
        </div>
        <CreateLicensePanel
          appId={selectedApp.id}
          onCreated={() => fetchLicenses(selectedApp.id)}
        />
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search license keys..."
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
                  <th className="py-3 px-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Key
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden sm:table-cell">
                    Expires
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Status
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">
                    Created
                  </th>
                  <th className="py-3 px-4 w-12" />
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
              className="p-1.5 rounded-md border border-border hover:bg-accent/60 transition-colors disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-1.5 rounded-md border border-border hover:bg-accent/60 transition-colors disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Licenses() {
  return (
    <DashboardLayout>
      <LicensesContent />
    </DashboardLayout>
  );
}


