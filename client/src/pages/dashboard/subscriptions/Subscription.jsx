import { useClient } from "@/context/ClientContext";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { motion, AnimatePresence } from "framer-motion";
import {
  CreditCard,
  Plus,
  Trash2,
  AlertCircle,
  Search,
  Edit2,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";

const formatDate = (date) =>
  date
    ? new Date(date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "—";

// ── Subscription card ─────────────────────────────────────────────────────────
function SubCard({ sub, appId, onDelete, onEdit }) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!window.confirm(`Delete subscription "${sub.name}"?`)) return;
    setDeleting(true);
    const res = await onDelete(appId, sub.id);
    if (!res?.success) {
      toast.error(res?.message || "Failed to delete");
      setDeleting(false);
    }
  };

  // Color cycling for cards
  const colors = [
    "bg-blue-500/10 border-blue-500/20 text-blue-400",
    "bg-purple-500/10 border-purple-500/20 text-purple-400",
    "bg-green-500/10 border-green-500/20 text-green-400",
    "bg-orange-500/10 border-orange-500/20 text-orange-400",
    "bg-pink-500/10 border-pink-500/20 text-pink-400",
  ];
  const colorClass = colors[sub.name.charCodeAt(0) % colors.length];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="rounded-xl border border-border bg-card/40 p-5 flex flex-col gap-4 group hover:bg-card/60 transition-colors"
    >
      {/* Icon + Name */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3">
          <div className={cn("p-2.5 rounded-lg border", colorClass)}>
            <CreditCard className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold font-space-grotesk text-foreground">
              {sub.name}
            </h3>
            <p className="text-[10px] text-muted-foreground">
              Created {formatDate(sub.createdAt)}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(sub)}
            className="p-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ID */}
      <div className="flex items-center gap-2 p-2.5 rounded-lg bg-secondary/30 border border-border">
        <code className="text-[10px] font-mono text-muted-foreground truncate">
          ID: {sub.id}
        </code>
      </div>
    </motion.div>
  );
}

// ── Subscription modal ─────────────────────────────────────────────────────────
function SubModal({ appId, editSub, onClose, onSuccess }) {
  const { createSubscription } = useClient();
  const isEdit = !!editSub;
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(editSub?.name || "");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Subscription name is required");
      return;
    }
    setLoading(true);

    let res;
    if (isEdit) {
      try {
        const r = await api.patch(`/applications/${appId}/subscriptions/${editSub.id}`, { name });
        res = { success: r.data.success };
      } catch (err) {
        res = { success: false, message: err?.response?.data?.message };
      }
    } else {
      res = await createSubscription(appId, { name });
    }

    setLoading(false);
    if (res?.success) {
      toast.success(isEdit ? "Subscription updated!" : "Subscription created!");
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
        className="relative z-10 w-full max-w-sm rounded-2xl border border-border bg-card shadow-2xl shadow-black/40 p-6"
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold font-space-grotesk text-foreground">
            {isEdit ? "Edit Subscription" : "New Subscription"}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-md hover:bg-accent/60 text-muted-foreground transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1.5">
              Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Basic, Pro, Enterprise"
              className="w-full bg-secondary/30 border border-border rounded-lg py-2.5 px-3.5 text-sm focus:outline-none focus:border-primary transition-colors"
              autoFocus
            />
          </div>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-lg border border-border text-sm hover:bg-accent/60 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="flex-1 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm hover:bg-primary/80 transition-colors disabled:opacity-60">
              {loading ? "Saving..." : (isEdit ? "Save" : "Create")}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// ── Subscription page content ─────────────────────────────────────────────────
function SubscriptionContent() {
  const {
    selectedApp,
    subscriptions,
    fetchSubscriptions,
    deleteSubscription,
    resourceLoading,
  } = useClient();
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editSub, setEditSub] = useState(null);

  useEffect(() => {
    if (selectedApp?.id) fetchSubscriptions(selectedApp.id);
  }, [selectedApp?.id, fetchSubscriptions]);

  const filtered = subscriptions.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  if (!selectedApp) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
        <AlertCircle className="w-10 h-10 text-muted-foreground/40" />
        <p className="text-sm font-medium font-space-grotesk text-foreground">No application selected</p>
        <p className="text-xs text-muted-foreground max-w-xs">
          Select an application from the sidebar to manage its subscriptions.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-base font-bold font-space-grotesk text-foreground">
            {selectedApp.appName} — Subscriptions
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {subscriptions.length} subscription tier{subscriptions.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={() => { setEditSub(null); setModalOpen(true); }}
          className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/80 transition-all duration-200"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Subscription
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search subscriptions..."
          className="w-full bg-secondary/30 border border-border rounded-lg py-2 pl-9 pr-4 text-sm focus:outline-none focus:border-primary transition-colors"
        />
      </div>

      {/* Grid */}
      {resourceLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="rounded-xl border border-border bg-card/40 p-5 h-32 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 flex flex-col items-center gap-3 text-center border border-border rounded-xl bg-card/40">
          <CreditCard className="w-8 h-8 text-muted-foreground/30" />
          <p className="text-sm font-medium font-space-grotesk text-foreground">
            {search ? "No matching subscriptions" : "No subscriptions yet"}
          </p>
          <p className="text-xs text-muted-foreground">
            {search ? "Try a different search." : "Create your first subscription tier above."}
          </p>
        </div>
      ) : (
        <motion.div layout className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {filtered.map((sub) => (
              <SubCard
                key={sub.id}
                sub={sub}
                appId={selectedApp.id}
                onDelete={deleteSubscription}
                onEdit={(s) => { setEditSub(s); setModalOpen(true); }}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {modalOpen && (
          <SubModal
            appId={selectedApp.id}
            editSub={editSub}
            onClose={() => { setModalOpen(false); setEditSub(null); }}
            onSuccess={() => fetchSubscriptions(selectedApp.id)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Subscription() {
  return <SubscriptionContent />;
}


