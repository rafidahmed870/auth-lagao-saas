import { api } from "@/lib/api";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { server } from "@/lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    try {
      const res = await api.get("/auth/account");
      setUser(res.data.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const register = async (name, email, password) => {
    setLoading(true);
    try {
      const response = await api.post("/auth/register", {
        name,
        email,
        password,
      });
      if (response.data.success) {
        //await fetchUser();
        return { success: true, message: response.data.message };
      }
    } catch (error) {
      return { success: false, message: error.response.data.message };
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    setLoading(true);
    try {
        const response = await api.post("/auth/login", { email, password });
        if (response.data.success) {
            await fetchUser();
            return { success: true, message: response.data.message };
        }
    } catch (error) {
        return { success: false, message: error.response.data.message };
    } finally {
        setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      const response = await api.post("/auth/logout");
      if (response.data.success) {
        setUser(null);
        return { success: true, message: response.data.message };
      }
    } catch (error) {
      return { success: false, message: error.response?.data?.message || "Logout failed" };
    } finally {
      setLoading(false);
    }
  };

  const oauthRedirect = (provider) => {
    window.location.href = `${server}/auth/${provider}`;
  };

  const googleLogin = () => oauthRedirect("google");
  const discordLogin = () => oauthRedirect("discord");

  const updateName = async (name) => {
    try {
      const res = await api.patch("/auth/account/name", { name });
      if (res.data.success) {
        setUser(res.data.user);
        return { success: true, message: res.data.message };
      }
    } catch (error) {
      return { success: false, message: error.response?.data?.message || "Failed to update name" };
    }
  };

  const updateEmail = async (email, currentPassword) => {
    try {
      const res = await api.patch("/auth/account/email", { email, currentPassword });
      if (res.data.success) {
        setUser(res.data.user);
        return { success: true, message: res.data.message };
      }
    } catch (error) {
      return { success: false, message: error.response?.data?.message || "Failed to update email" };
    }
  };

  const updatePassword = async (currentPassword, newPassword, confirmPassword) => {
    try {
      const res = await api.patch("/auth/account/password", { currentPassword, newPassword, confirmPassword });
      if (res.data.success) {
        // Backend clears cookies and bumps tokenVersion — log user out locally
        setUser(null);
        return { success: true, message: res.data.message };
      }
    } catch (error) {
      return { success: false, message: error.response?.data?.message || "Failed to update password" };
    }
  };

  const removeOAuth = async (provider) => {
    try {
      const res = await api.delete(`/auth/account/oauth/${provider}`);
      if (res.data.success) {
        setUser(res.data.user);
        return { success: true, message: res.data.message };
      }
    } catch (error) {
      return { success: false, message: error.response?.data?.message || "Failed to unlink account" };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        register,
        login,
        logout,
        googleLogin,
        discordLogin,
        updateName,
        updateEmail,
        updatePassword,
        removeOAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

