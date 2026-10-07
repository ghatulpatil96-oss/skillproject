"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { Role } from "@/lib/types";

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  college?: string;
  gradYear?: number;
  company?: string;
  verifiedRecruiter?: boolean;
};

const SessionCtx = createContext<{
  user: SessionUser | null;
  loading: boolean;
  refresh: () => Promise<void>;
}>({ user: null, loading: true, refresh: async () => {} });

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    try {
      const res = await fetch("/api/auth/me", { cache: "no-store" });
      const data = (await res.json()) as { user: SessionUser | null };
      setUser(data.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
    // Re-sync session whenever auth changes (login/signup/logout dispatch this).
    // `detail` carries the user for an instant header update, then we confirm
    // against the server.
    const onSession = (e: Event) => {
      // detail = user object on login/signup, null on logout, undefined = just re-fetch
      const detail = (e as CustomEvent).detail as SessionUser | null | undefined;
      if (detail !== undefined) setUser(detail);
      void refresh();
    };
    window.addEventListener("sb-session", onSession);
    return () => window.removeEventListener("sb-session", onSession);
  }, []);

  return <SessionCtx.Provider value={{ user, loading, refresh }}>{children}</SessionCtx.Provider>;
}

export function useSession() {
  return useContext(SessionCtx);
}
