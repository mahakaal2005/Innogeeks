import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  createClient,
  type Session,
  type SupabaseClient,
} from "@supabase/supabase-js";
import { setAuthTokenGetter } from "@workspace/api-client-react";
import { getPublicConfig } from "@workspace/api-client-react";

interface AdminAuthState {
  /** True until we've fetched config + restored any existing session. */
  loading: boolean;
  /** Null when Supabase isn't configured on the server. */
  configured: boolean;
  session: Session | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthState | null>(null);

let clientPromise: Promise<SupabaseClient | null> | null = null;

// Lazily build a Supabase client using config served by the API (no build-time
// env vars needed). Memoised so we only fetch config + construct once.
function getSupabaseClient(): Promise<SupabaseClient | null> {
  if (!clientPromise) {
    clientPromise = (async () => {
      try {
        const config = await getPublicConfig();
        if (!config.supabaseUrl || !config.supabaseAnonKey) return null;
        return createClient(config.supabaseUrl, config.supabaseAnonKey, {
          auth: {
            persistSession: true,
            autoRefreshToken: true,
            storageKey: "innogeeks-admin-auth",
          },
        });
      } catch {
        return null;
      }
    })();
  }
  return clientPromise;
}

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [configured, setConfigured] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const sessionRef = useRef<Session | null>(null);

  // Keep custom-fetch's bearer token in sync with the current session so the
  // generated API hooks automatically attach the admin's JWT.
  useEffect(() => {
    setAuthTokenGetter(() => sessionRef.current?.access_token ?? null);
    return () => setAuthTokenGetter(null);
  }, []);

  useEffect(() => {
    let unsub: (() => void) | undefined;
    (async () => {
      const client = await getSupabaseClient();
      if (!client) {
        setConfigured(false);
        setLoading(false);
        return;
      }
      setConfigured(true);
      const { data } = await client.auth.getSession();
      sessionRef.current = data.session;
      setSession(data.session);
      const { data: listener } = client.auth.onAuthStateChange((_e, s) => {
        sessionRef.current = s;
        setSession(s);
      });
      unsub = () => listener.subscription.unsubscribe();
      setLoading(false);
    })();
    return () => unsub?.();
  }, []);

  const value = useMemo<AdminAuthState>(
    () => ({
      loading,
      configured,
      session,
      async signIn(email, password) {
        const client = await getSupabaseClient();
        if (!client) throw new Error("Login is not configured on the server.");
        const { error } = await client.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      },
      async signOut() {
        const client = await getSupabaseClient();
        await client?.auth.signOut();
      },
    }),
    [loading, configured, session],
  );

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth(): AdminAuthState {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) {
    throw new Error("useAdminAuth must be used within an AdminAuthProvider");
  }
  return ctx;
}
