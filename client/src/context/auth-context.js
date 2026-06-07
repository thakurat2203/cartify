"use client";

import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";
const TOKEN_KEY = "auth_token";

const AuthContext = createContext(null);

async function fetchCurrentUser(authToken) {
  const response = await axios.get(`${API_BASE}/api/auth/me`, {
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  });

  return response.data.user;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      const storedToken = localStorage.getItem(TOKEN_KEY);

      if (!storedToken) {
        setAuthLoading(false);
        return;
      }

      try {
        // Revalidate the stored token before trusting it as the active session.
        const currentUser = await fetchCurrentUser(storedToken);
        setToken(storedToken);
        setUser(currentUser);
      } catch (err) {
        localStorage.removeItem(TOKEN_KEY);
        setToken(null);
        setUser(null);
      } finally {
        setAuthLoading(false);
      }
    };

    restoreSession();
  }, []);

  const register = async ({ name, email, password }) => {
    // Registration returns the created user; login still happens on the login page.
    const response = await axios.post(`${API_BASE}/api/auth/register`, {
      name,
      email,
      password,
    });

    return response.data;
  };

  const login = async ({ email, password }) => {
    // After successful login, persist the token so refreshes can restore the session.
    const response = await axios.post(`${API_BASE}/api/auth/login`, {
      email,
      password,
    });

    const nextToken = response.data.token;
    localStorage.setItem(TOKEN_KEY, nextToken);
    setToken(nextToken);
    setUser(response.data.user);

    return response.data;
  };

  const logout = () => {
    // Clearing both storage and state immediately updates protected navigation.
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    authLoading,
    isAuthenticated: Boolean(user && token),
    register,
    login,
    logout,
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
