"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { AuthUser } from "@learning/shared";
import { getToken, setToken as persistToken, clearToken } from "./auth-client";
import { authFetch } from "./api";

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (user: AuthUser, token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!getToken()) {
      setLoading(false);
      return;
    }
    authFetch<AuthUser>("/api/auth/me")
      .then(setUser)
      .catch(() => clearToken())
      .finally(() => setLoading(false));
  }, []);

  function login(nextUser: AuthUser, token: string) {
    persistToken(token);
    setUser(nextUser);
  }

  function logout() {
    clearToken();
    setUser(null);
  }

  return <AuthContext.Provider value={{ user, loading, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
