import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { api } from "../lib/api";

const AuthCtx = createContext(null);

const readUser = () => {
  try {
    const raw = localStorage.getItem("auth_user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export function AuthProvider({ children }) {
  const [user, setUserState] = useState(readUser);
  // null | "login" | "signup" | "forgot"
  const [authModal, setAuthModal] = useState(null);

  const setUser = useCallback((u) => {
    setUserState(u);
    try {
      if (u) localStorage.setItem("auth_user", JSON.stringify(u));
      else localStorage.removeItem("auth_user");
    } catch {
      /* storage unavailable */
    }
  }, []);

  const saveSession = useCallback(
    (token, u) => {
      try {
        localStorage.setItem("auth_token", token);
      } catch {
        /* storage unavailable */
      }
      setUser(u);
    },
    [setUser]
  );

  const logout = useCallback(() => {
    try {
      localStorage.removeItem("auth_token");
    } catch {
      /* storage unavailable */
    }
    setUser(null);
  }, [setUser]);

  // Refresh the profile once on load; drop the session if the token expired.
  useEffect(() => {
    if (!readUser()) return;
    api("/api/me", { auth: true })
      .then((d) => d.user && setUser(d.user))
      .catch((e) => e.status === 401 && logout());
  }, [setUser, logout]);

  // "open-login" is still fired by some admin components; "auth-expired" comes from lib/api on a 401.
  useEffect(() => {
    const open = () => setAuthModal("login");
    const expired = () => {
      logout();
      setAuthModal("login");
    };
    window.addEventListener("open-login", open);
    window.addEventListener("auth-expired", expired);
    return () => {
      window.removeEventListener("open-login", open);
      window.removeEventListener("auth-expired", expired);
    };
  }, [logout]);

  return (
    <AuthCtx.Provider value={{ user, setUser, saveSession, logout, authModal, openAuth: setAuthModal, isAdmin: user?.role === "admin" }}>
      {children}
    </AuthCtx.Provider>
  );
}

export const useAuth = () => useContext(AuthCtx);
