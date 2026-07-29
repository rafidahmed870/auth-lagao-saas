import { useAuth } from "@/context/AuthContext";
import { useClient } from "@/context/ClientContext";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Key,
  Users,
  CreditCard,
  UsersRound,
  ChevronRight,
  ChevronLeft,
  PlusCircle,
  Check,
  ChevronsUpDown,
  LogOut,
  Shield,
  X,
} from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

// ── Nav items definition ──────────────────────────────────────────────────────
const NAV_ITEMS = [
  {
    label: "Overview",
    icon: LayoutDashboard,
    href: "/dashboard/overview",
  },
  {
    label: "Licenses",
    icon: Key,
    href: "/dashboard/licenses",
  },
  {
    label: "Users",
    icon: Users,
    href: "/dashboard/users",
  },
  {
    label: "Subscriptions",
    icon: CreditCard,
    href: "/dashboard/subscriptions",
  },
  {
    label: "Team",
    icon: UsersRound,
    href: "/dashboard/team",
    badge: "Soon",
  },
];

// ── App Selector Dropdown ─────────────────────────────────────────────────────
function AppSelector({ collapsed }) {
  const { applications, selectedApp, setSelectedApp, appsLoading } = useClient();
  const [open, setOpen] = useState(false);

  const handleSelect = (app) => {
    setSelectedApp(app);
    setOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((p) => !p)}
        className={cn(
          "w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg border border-border bg-card/60",
          "hover:bg-accent/60 transition-all duration-200 text-left group",
          collapsed && "justify-center px-2"
        )}
        title={collapsed ? (selectedApp?.appName || "Select App") : undefined}
      >
        {/* App Icon */}
        <div className="shrink-0 w-7 h-7 rounded-md bg-primary/15 border border-primary/20 flex items-center justify-center">
          <Shield className="w-3.5 h-3.5 text-primary" />
        </div>

        {!collapsed && (
          <>
            <div className="flex-1 min-w-0">
              {appsLoading ? (
                <div className="h-3 w-20 bg-muted rounded animate-pulse" />
              ) : selectedApp ? (
                <>
                  <p className="text-xs font-semibold text-foreground truncate font-space-grotesk">
                    {selectedApp.appName}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    v{selectedApp.appVersion}
                  </p>
                </>
              ) : (
                <p className="text-xs text-muted-foreground">Select application</p>
              )}
            </div>
            <ChevronsUpDown className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
          </>
        )}
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className={cn(
              "absolute z-50 top-full mt-1.5 w-56 rounded-xl border border-border bg-card shadow-xl shadow-black/30",
              collapsed ? "left-12" : "left-0 right-0 w-auto"
            )}
          >
            <div className="p-1.5 max-h-52 overflow-y-auto">
              {applications.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-3">
                  No applications yet
                </p>
              ) : (
                applications.map((app) => (
                  <button
                    key={app.id}
                    onClick={() => handleSelect(app)}
                    className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-accent/60 transition-colors text-left"
                  >
                    <div className="w-6 h-6 rounded-md bg-primary/15 border border-primary/20 flex items-center justify-center shrink-0">
                      <Shield className="w-3 h-3 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground truncate font-space-grotesk">
                        {app.appName}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        v{app.appVersion}
                      </p>
                    </div>
                    {selectedApp?.id === app.id && (
                      <Check className="w-3.5 h-3.5 text-primary shrink-0" />
                    )}
                  </button>
                ))
              )}
            </div>
            <div className="border-t border-border p-1.5">
              <Link
                to="/dashboard/overview"
                onClick={() => setOpen(false)}
                className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg hover:bg-accent/60 transition-colors text-xs text-primary"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                New Application
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Nav Item ─────────────────────────────────────────────────────────────────
function NavItem({ item, collapsed }) {
  const location = useLocation();
  const isActive = location.pathname === item.href;
  const Icon = item.icon;

  return (
    <Link
      to={item.href}
      title={collapsed ? item.label : undefined}
      className={cn(
        "relative flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group",
        collapsed ? "justify-center px-2.5" : "",
        isActive
          ? "bg-primary/15 text-primary border border-primary/20"
          : "text-muted-foreground hover:text-foreground hover:bg-accent/60"
      )}
    >
      {/* Active indicator bar */}
      {isActive && (
        <motion.div
          layoutId="activeIndicator"
          className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-primary rounded-r-full"
        />
      )}

      <Icon
        className={cn(
          "shrink-0 transition-colors",
          collapsed ? "w-5 h-5" : "w-4 h-4",
          isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
        )}
      />

      {!collapsed && (
        <span className="text-sm font-medium flex-1">{item.label}</span>
      )}

      {!collapsed && item.badge && (
        <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-primary/15 text-primary font-semibold border border-primary/20">
          {item.badge}
        </span>
      )}

      {/* Tooltip for collapsed */}
      {collapsed && (
        <div className="absolute left-full ml-3 px-2.5 py-1.5 rounded-md bg-card border border-border text-xs text-foreground whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-150 shadow-lg z-50">
          {item.label}
          {item.badge && (
            <span className="ml-1.5 text-[9px] text-primary">{item.badge}</span>
          )}
        </div>
      )}
    </Link>
  );
}

// ── Main Sidebar ─────────────────────────────────────────────────────────────
export default function ClientSidebar({ mobileOpen, onMobileClose }) {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    const res = await logout();
    if (res?.success) {
      toast.success(res.message);
      navigate("/login");
    } else {
      toast.error(res?.message || "Logout failed");
    }
  };

  const sidebarContent = (isMobile = false) => (
    <div className="flex flex-col h-full">
      {/* ── Header ─────────────────────────────── */}
      <div
        className={cn(
          "flex items-center border-b border-border",
          collapsed && !isMobile ? "justify-center px-3 py-4" : "px-4 py-4 gap-3"
        )}
      >
        {(!collapsed || isMobile) && (
          <Link to="/" className="flex items-center gap-2 flex-1 min-w-0">
            <img
              src="/auth-lagao-web.png"
              alt="Auth Lagao"
              className="h-8 object-contain"
            />
          </Link>
        )}

        {collapsed && !isMobile && (
          <Link to="/" className="flex items-center justify-center">
            <img src="/auth-lagao-web.png" alt="Auth Lagao" className="h-7 w-7 object-contain" />
          </Link>
        )}

        {/* Mobile close */}
        {isMobile && (
          <button
            onClick={onMobileClose}
            className="shrink-0 p-1 rounded-md hover:bg-accent/60 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* ── App Selector ───────────────────────── */}
      <div className={cn("px-3 pt-4 pb-2", collapsed && !isMobile && "px-2")}>
        <AppSelector collapsed={collapsed && !isMobile} />
      </div>

      {/* ── Divider ────────────────────────────── */}
      <div className="mx-3 h-px bg-border my-2" />

      {/* ── Navigation ─────────────────────────── */}
      <nav className={cn("flex-1 overflow-y-auto px-3 py-1 space-y-0.5", collapsed && !isMobile && "px-2")}>
        {NAV_ITEMS.map((item) => (
          <NavItem
            key={item.href}
            item={item}
            collapsed={collapsed && !isMobile}
          />
        ))}
      </nav>

      {/* ── Bottom: User & Logout ───────────────── */}
      <div className={cn("border-t border-border p-3 space-y-1", collapsed && !isMobile && "px-2")}>
        {/* User info */}
        {(!collapsed || isMobile) ? (
          <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg bg-card/40">
            <div className="w-7 h-7 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0">
              <span className="text-xs font-bold text-primary font-space-grotesk">
                {user?.name?.charAt(0)?.toUpperCase() || "U"}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-foreground truncate font-space-grotesk">
                {user?.name}
              </p>
              <p className="text-[10px] text-muted-foreground truncate">
                {user?.email}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center" title={user?.name}>
              <span className="text-xs font-bold text-primary font-space-grotesk">
                {user?.name?.charAt(0)?.toUpperCase() || "U"}
              </span>
            </div>
          </div>
        )}

        {/* Logout button */}
        <button
          onClick={handleLogout}
          disabled={loading}
          className={cn(
            "w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-200 group",
            collapsed && !isMobile && "justify-center px-2"
          )}
          title={collapsed && !isMobile ? "Logout" : undefined}
        >
          <LogOut className="w-4 h-4 shrink-0 group-hover:text-destructive transition-colors" />
          {(!collapsed || isMobile) && (
            <span className="text-sm">Logout</span>
          )}
          {/* Tooltip */}
          {collapsed && !isMobile && (
            <div className="absolute left-full ml-3 px-2.5 py-1.5 rounded-md bg-card border border-border text-xs text-foreground whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-150 shadow-lg z-50">
              Logout
            </div>
          )}
        </button>
      </div>

      {/* ── Collapse Toggle (desktop only) ─────── */}
      {!isMobile && (
        <button
          onClick={() => setCollapsed((p) => !p)}
          className="absolute -right-3 top-20 z-10 w-6 h-6 rounded-full bg-card border border-border flex items-center justify-center hover:bg-accent transition-all duration-200 shadow-md"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="w-3 h-3 text-muted-foreground" />
          ) : (
            <ChevronLeft className="w-3 h-3 text-muted-foreground" />
          )}
        </button>
      )}
    </div>
  );

  return (
    <>
      {/* ── Desktop Sidebar ─────────────────────────────────────────────────── */}
      <motion.aside
        animate={{ width: collapsed ? 64 : 240 }}
        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
        className="relative hidden lg:flex flex-col h-screen bg-sidebar border-r border-sidebar-border shrink-0 overflow-hidden"
        style={{ willChange: "width" }}
      >
        {sidebarContent(false)}
      </motion.aside>

      {/* ── Mobile Overlay + Drawer ──────────────────────────────────────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
              onClick={onMobileClose}
            />

            {/* Drawer */}
            <motion.aside
              key="drawer"
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
              className="fixed top-0 left-0 bottom-0 z-50 w-72 flex flex-col bg-sidebar border-r border-sidebar-border lg:hidden overflow-hidden"
            >
              {sidebarContent(true)}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}


