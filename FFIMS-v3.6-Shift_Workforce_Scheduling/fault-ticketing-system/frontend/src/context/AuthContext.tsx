import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api, type AuthUser } from "@/lib/api";

const STORAGE_KEY = "ffims-auth-session";

interface AuthContextValue {
  initializing: boolean;
  isAuthenticated: boolean;
  login: (credentials: { email: string; password: string }) => Promise<AuthUser>;
  logout: () => void;
  token: string;
  user: AuthUser | null;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const readStoredSession = () => {
  if (typeof window === "undefined") {
    return { token: "", user: null as AuthUser | null };
  }

  try {
    const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "{}");
    return {
      token: parsed.token || "",
      user: (parsed.user as AuthUser | null) || null,
    };
  } catch {
    return { token: "", user: null as AuthUser | null };
  }
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState(readStoredSession);
  const [initializing, setInitializing] = useState(Boolean(readStoredSession().token));

  useEffect(() => {
    if (!session.token) {
      setInitializing(false);
      return;
    }

    let active = true;

    api
      .getMe(session.token)
      .then((user) => {
        if (!active) {
          return;
        }

        const nextSession = {
          token: session.token,
          user,
        };

        setSession(nextSession);
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextSession));
      })
      .catch(() => {
        if (!active) {
          return;
        }

        setSession({ token: "", user: null });
        window.localStorage.removeItem(STORAGE_KEY);
      })
      .finally(() => {
        if (active) {
          setInitializing(false);
        }
      });

    return () => {
      active = false;
    };
  }, [session.token]);

  const login = async (credentials: { email: string; password: string }) => {
    const data = await api.login(credentials);
    const nextSession = {
      token: data.token,
      user: data.user,
    };

    setSession(nextSession);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextSession));
    setInitializing(false);
    return data.user;
  };

  const logout = () => {
    setSession({ token: "", user: null });
    window.localStorage.removeItem(STORAGE_KEY);
  };

  const value = useMemo(
    () => ({
      initializing,
      isAuthenticated: Boolean(session.token),
      login,
      logout,
      token: session.token,
      user: session.user,
    }),
    [initializing, session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
