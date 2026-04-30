import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Session, User } from "@supabase/supabase-js";
import { getGitHubReturnUrl } from "@/lib/app-url";

interface AuthCtx {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
}
const Ctx = createContext<AuthCtx>({ user: null, session: null, loading: true, signOut: async () => {} });

/**
 * If we're on the Lovable domain because of a GitHub Pages OAuth bounce
 * (`?gh_return=...github.io...`) and we now have a session, forward the user
 * back to GitHub Pages with tokens in the URL hash.
 */
const maybeBounceBackToGitHubPages = (s: Session | null) => {
  if (!s) return false;
  const ret = getGitHubReturnUrl();
  if (!ret) return false;

  const target = new URL(ret);
  const hashParams = new URLSearchParams();
  hashParams.set("access_token", s.access_token);
  hashParams.set("refresh_token", s.refresh_token);
  hashParams.set("token_type", s.token_type || "bearer");
  hashParams.set("expires_in", String(s.expires_in ?? 3600));
  if (s.provider_token) hashParams.set("provider_token", s.provider_token);
  if (s.provider_refresh_token) hashParams.set("provider_refresh_token", s.provider_refresh_token);
  target.hash = hashParams.toString();

  window.location.replace(target.toString());
  return true;
};

/**
 * On GitHub Pages, pick up tokens left in the URL hash by the bounce-back
 * step and install them as the active Supabase session.
 */
const consumeReturnedTokensFromHash = async () => {
  if (typeof window === "undefined") return false;
  if (!window.location.hostname.endsWith(".github.io")) return false;
  if (!window.location.hash || window.location.hash.length < 2) return false;

  const hash = new URLSearchParams(window.location.hash.slice(1));
  const access_token = hash.get("access_token");
  const refresh_token = hash.get("refresh_token");
  if (!access_token || !refresh_token) return false;

  try {
    await supabase.auth.setSession({ access_token, refresh_token });
  } catch (e) {
    console.error("Failed to install returned session", e);
    return false;
  }

  const cleanUrl = window.location.pathname + window.location.search;
  window.history.replaceState({}, "", cleanUrl);
  return true;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      maybeBounceBackToGitHubPages(s);
    });

    (async () => {
      await consumeReturnedTokensFromHash();
      const { data } = await supabase.auth.getSession();
      if (!maybeBounceBackToGitHubPages(data.session)) {
        setSession(data.session);
        setLoading(false);
      }
    })();

    return () => sub.subscription.unsubscribe();
  }, []);

  return (
    <Ctx.Provider value={{
      user: session?.user ?? null,
      session,
      loading,
      signOut: async () => { await supabase.auth.signOut(); },
    }}>{children}</Ctx.Provider>
  );
};

export const useAuth = () => useContext(Ctx);
