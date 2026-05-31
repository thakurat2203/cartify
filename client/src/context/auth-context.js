"use client";

import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

// API configuration and storage keys
const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";
const TOKEN_KEY = "auth_token";

// Create context for authentication state
const AuthContext = createContext(null);

// Fetch current user details from backend using token
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

  // Restore session from localStorage on application mount
  useEffect(() => {
    const restoreSession = async () => {
      const storedToken = localStorage.getItem(TOKEN_KEY);

      if (!storedToken) {
        setAuthLoading(false);
        return;
      }

      try {
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

  // Register a new user account
  const register = async ({ name, email, password }) => {
    const response = await axios.post(`${API_BASE}/api/auth/register`, {
      name,
      email,
      password,
    });

    return response.data;
  };

  // Log in an existing user and persist the session
  const login = async ({ email, password }) => {
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

  // Log out the current user and clear stored tokens
  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  };

  // Provide state and methods to the rest of the app
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

// Hook to access auth state from any component
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
