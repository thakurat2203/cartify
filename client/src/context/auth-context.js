"use client";

import { createContext, useContext, useEffect, useState } from "react";
import api, { SESSION_EXPIRED_EVENT } from "@/lib/api";

const AuthContext = createContext(null);

async function fetchCurrentUser() {
  const response = await api.get("/api/auth/me");
  return response.data.user;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const handleSessionExpired = () => {
      setUser(null);
    };

    window.addEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired);

    return () => {
      window.removeEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired);
    };
  }, []);

  useEffect(() => {
    const restoreSession = async () => {
      try {
        // The API interceptor refreshes an expired access cookie automatically.
        const currentUser = await fetchCurrentUser();
        setUser(currentUser);
      } catch {
        setUser(null);
      } finally {
        setAuthLoading(false);
      }
    };

    restoreSession();
  }, []);

  const register = async ({ name, email, password }) => {
    const response = await api.post("/api/auth/register", {
      name,
      email,
      password,
    });

    return response.data;
  };

  const login = async ({ email, password }) => {
    const response = await api.post("/api/auth/login", {
      email,
      password,
    });

    setUser(response.data.user);

    return response.data;
  };

  const logout = async () => {
    await api.post("/api/auth/logout");
    setUser(null);
  };

  const updateUser = (nextUser) => {
    setUser(nextUser);
  };

  const clearUser = () => {
    setUser(null);
  };

  const value = {
    user,
    authLoading,
    isAuthenticated: Boolean(user),
    register,
    login,
    logout,
    updateUser,
    clearUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
