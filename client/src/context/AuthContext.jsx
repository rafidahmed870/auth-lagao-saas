import { api } from "@/lib/api";
import { createContext, useCallback, useContext, useEffect, useState } from "react";

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
        return { success: false, message: error.response.data.message };
    } finally {
        setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, register, login, logout }}>
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

