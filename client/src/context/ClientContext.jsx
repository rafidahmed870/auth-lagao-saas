import { api } from "@/lib/api";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";

const ClientContext = createContext(null);

export function ClientProvider({ children }) {
  // ── Applications ──────────────────────────────────────────────────────────
  const [applications, setApplications] = useState([]);
  const [selectedApp, setSelectedApp] = useState(null);
  const [appsLoading, setAppsLoading] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // ── Nested resources (for selected app) ────────────────────────────────────
  const [licenses, setLicenses] = useState([]);
  const [appUsers, setAppUsers] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [resourceLoading, setResourceLoading] = useState(false);

  // ── Team ──────────────────────────────────────────────────────────────────
  const [teamMembers, setTeamMembers] = useState([]);
  const [permissionCatalogue, setPermissionCatalogue] = useState([]);
  const [teamLoading, setTeamLoading] = useState(false);

  // ── Access control for the currently selected app ─────────────────────────
  // "owner"  → full access (permissions array is irrelevant)
  // "member" → access restricted to memberPermissions array
  // null     → no app selected
  const selectedAppAccess = useMemo(() => {
    if (!selectedApp) return null;
    // The app list returned by the API already carries role + permissions
    const app = applications.find((a) => a.id === selectedApp.id);
    if (!app) return null;
    return {
      role: app.role ?? "owner",           // "owner" | "member"
      permissions: app.permissions ?? [],  // string[]
    };
  }, [selectedApp, applications]);

  /**
   * Returns true if the current user may perform an action on the selected app.
   *   - owners always return true
   *   - members return true only when the slug is in their permissions array
   *   - pass an array to check ANY of the slugs (OR logic)
   */
  const hasPermission = useCallback(
    (slugOrSlugs) => {
      if (!selectedAppAccess) return false;
      if (selectedAppAccess.role === "owner") return true;
      const slugs = Array.isArray(slugOrSlugs) ? slugOrSlugs : [slugOrSlugs];
      return slugs.some((s) => selectedAppAccess.permissions.includes(s));
    },
    [selectedAppAccess],
  );

  // ─────────────────────────────────────────────────────────────────────────
  //  APPLICATIONS
  // ─────────────────────────────────────────────────────────────────────────

  const fetchApplications = useCallback(async () => {
    setAppsLoading(true);
    try {
      const res = await api.get("/applications");
      setApplications(res.data.data || []);
      // Auto-select first app if none selected
      if (!selectedApp && res.data.data?.length > 0) {
        setSelectedApp(res.data.data[0]);
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to fetch applications");
    } finally {
      setAppsLoading(false);
    }
  }, []);

  const createApplication = async (data) => {
    try {
      const res = await api.post("/applications", data);
      if (res.data.success) {
        await fetchApplications();
        return { success: true, data: res.data.data };
      }
    } catch (err) {
      return { success: false, message: err?.response?.data?.message || "Failed to create application" };
    }
  };

  const updateApplication = async (appId, data) => {
    try {
      const res = await api.patch(`/applications/${appId}`, data);
      if (res.data.success) {
        await fetchApplications();
        return { success: true, data: res.data.data };
      }
    } catch (err) {
      return { success: false, message: err?.response?.data?.message || "Failed to update application" };
    }
  };

  const deleteApplication = async (appId) => {
    try {
      const res = await api.delete(`/applications/${appId}`);
      if (res.data.success) {
        if (selectedApp?.id === appId) setSelectedApp(null);
        await fetchApplications();
        return { success: true };
      }
    } catch (err) {
      return { success: false, message: err?.response?.data?.message || "Failed to delete application" };
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  //  LICENSES
  // ─────────────────────────────────────────────────────────────────────────

  const fetchLicenses = useCallback(async (appId) => {
    if (!appId) return;
    setResourceLoading(true);
    try {
      const res = await api.get(`/applications/${appId}/licenses`);
      setLicenses(res.data.data || []);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to fetch licenses");
    } finally {
      setResourceLoading(false);
    }
  }, []);

  const createLicense = async (appId, data) => {
    try {
      const res = await api.post(`/applications/${appId}/licenses`, data);
      if (res.data.success) {
        await fetchLicenses(appId);
        return { success: true, data: res.data.data };
      }
    } catch (err) {
      return { success: false, message: err?.response?.data?.message || "Failed to create license" };
    }
  };

  const deleteLicense = async (appId, licenseId) => {
    try {
      const res = await api.delete(`/applications/${appId}/licenses/${licenseId}`);
      if (res.data.success) {
        await fetchLicenses(appId);
        return { success: true };
      }
    } catch (err) {
      return { success: false, message: err?.response?.data?.message || "Failed to delete license" };
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  //  APP USERS
  // ─────────────────────────────────────────────────────────────────────────

  const fetchAppUsers = useCallback(async (appId) => {
    if (!appId) return;
    setResourceLoading(true);
    try {
      const res = await api.get(`/applications/${appId}/users`);
      setAppUsers(res.data.data || []);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to fetch users");
    } finally {
      setResourceLoading(false);
    }
  }, []);

  const createAppUser = async (appId, data) => {
    try {
      const res = await api.post(`/applications/${appId}/users`, data);
      if (res.data.success) {
        await fetchAppUsers(appId);
        return { success: true, data: res.data.data };
      }
    } catch (err) {
      return { success: false, message: err?.response?.data?.message || "Failed to create user" };
    }
  };

  const deleteAppUser = async (appId, userId) => {
    try {
      const res = await api.delete(`/applications/${appId}/users/${userId}`);
      if (res.data.success) {
        await fetchAppUsers(appId);
        return { success: true };
      }
    } catch (err) {
      return { success: false, message: err?.response?.data?.message || "Failed to delete user" };
    }
  };

  const updateAppUser = async (appId, userId, data) => {
    try {
      const res = await api.patch(`/applications/${appId}/users/${userId}`, data);
      if (res.data.success) {
        await fetchAppUsers(appId);
        return { success: true, data: res.data.data };
      }
    } catch (err) {
      return { success: false, message: err?.response?.data?.message || "Failed to update user" };
    }
  };

  const resetUserHwid = async (appId, userId) => {
    try {
      const res = await api.patch(`/applications/${appId}/users/${userId}/reset-hwid`);
      if (res.data.success) {
        await fetchAppUsers(appId);
        return { success: true };
      }
    } catch (err) {
      return { success: false, message: err?.response?.data?.message || "Failed to reset HWID" };
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  //  SUBSCRIPTIONS
  // ─────────────────────────────────────────────────────────────────────────

  const fetchSubscriptions = useCallback(async (appId) => {
    if (!appId) return;
    setResourceLoading(true);
    try {
      const res = await api.get(`/applications/${appId}/subscriptions`);
      setSubscriptions(res.data.data || []);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to fetch subscriptions");
    } finally {
      setResourceLoading(false);
    }
  }, []);

  const createSubscription = async (appId, data) => {
    try {
      const res = await api.post(`/applications/${appId}/subscriptions`, data);
      if (res.data.success) {
        await fetchSubscriptions(appId);
        return { success: true, data: res.data.data };
      }
    } catch (err) {
      return { success: false, message: err?.response?.data?.message || "Failed to create subscription" };
    }
  };

  const deleteSubscription = async (appId, subId) => {
    try {
      const res = await api.delete(`/applications/${appId}/subscriptions/${subId}`);
      if (res.data.success) {
        await fetchSubscriptions(appId);
        return { success: true };
      }
    } catch (err) {
      return { success: false, message: err?.response?.data?.message || "Failed to delete subscription" };
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  //  TEAM MANAGEMENT
  // ─────────────────────────────────────────────────────────────────────────

  const fetchTeamMembers = useCallback(async (appId) => {
    if (!appId) return;
    setTeamLoading(true);
    try {
      const res = await api.get(`/applications/${appId}/team/members`);
      setTeamMembers(res.data.data || []);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to fetch team members");
    } finally {
      setTeamLoading(false);
    }
  }, []);

  const fetchPermissionCatalogue = useCallback(async (appId) => {
    if (!appId) return;
    try {
      const res = await api.get(`/applications/${appId}/team/permissions`);
      setPermissionCatalogue(res.data.data || []);
    } catch {
      // Non-critical — silently fail; the UI falls back to the hardcoded list
    }
  }, []);

  const inviteTeamMember = async (appId, data) => {
    try {
      const res = await api.post(`/applications/${appId}/team/members`, data);
      if (res.data.success) {
        await fetchTeamMembers(appId);
        return { success: true, data: res.data.data };
      }
    } catch (err) {
      return { success: false, message: err?.response?.data?.message || "Failed to invite member" };
    }
  };

  const updateTeamMember = async (appId, memberId, data) => {
    try {
      const res = await api.patch(`/applications/${appId}/team/members/${memberId}`, data);
      if (res.data.success) {
        await fetchTeamMembers(appId);
        return { success: true, data: res.data.data };
      }
    } catch (err) {
      return { success: false, message: err?.response?.data?.message || "Failed to update permissions" };
    }
  };

  const removeTeamMember = async (appId, memberId) => {
    try {
      const res = await api.delete(`/applications/${appId}/team/members/${memberId}`);
      if (res.data.success) {
        await fetchTeamMembers(appId);
        return { success: true };
      }
    } catch (err) {
      return { success: false, message: err?.response?.data?.message || "Failed to remove member" };
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  //  Bootstrap on mount
  // ─────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  return (
    <ClientContext.Provider
      value={{
        // State
        applications,
        selectedApp,
        setSelectedApp,
        appsLoading,
        sidebarCollapsed,
        setSidebarCollapsed,
        licenses,
        appUsers,
        subscriptions,
        resourceLoading,

        // Applications
        fetchApplications,
        createApplication,
        updateApplication,
        deleteApplication,

        // Licenses
        fetchLicenses,
        createLicense,
        deleteLicense,

        // App Users
        fetchAppUsers,
        createAppUser,
        deleteAppUser,
        updateAppUser,
        resetUserHwid,

        // Subscriptions
        fetchSubscriptions,
        createSubscription,
        deleteSubscription,

        // Team
        teamMembers,
        permissionCatalogue,
        teamLoading,
        fetchTeamMembers,
        fetchPermissionCatalogue,
        inviteTeamMember,
        updateTeamMember,
        removeTeamMember,

        // Access control
        selectedAppAccess,
        hasPermission,
      }}
    >
      {children}
    </ClientContext.Provider>
  );
}

export function useClient() {
  const context = useContext(ClientContext);
  if (!context) {
    throw new Error("useClient must be used within a ClientProvider");
  }
  return context;
}

