import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { LoginDialog } from "@/components/auth/LoginDialog";
import loginCube from "@/assets/login-cube.png";

/**
 * Shared login/avatar pill used in the top nav of every page.
 * - Signed out: shows the login cube icon + "Log in" → opens LoginDialog
 * - Signed in:  shows the user's avatar + name → click signs the user out
 */
export function AuthPill() {
  const { user, signOut } = useAuth();
  const [showLogin, setShowLogin] = useState(false);

  const avatar =
    (user?.user_metadata as any)?.avatar_url ||
    (user?.user_metadata as any)?.picture;
  const displayName =
    (user?.user_metadata as any)?.full_name ||
    (user?.user_metadata as any)?.name ||
    user?.email?.split("@")[0];

  return (
    <>
      <button
        onClick={() => (user ? signOut() : setShowLogin(true))}
        title={user ? `Sign out ${displayName}` : "Log in"}
        aria-label={user ? "Sign out" : "Log in"}
        className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full border border-border hover:shadow-glow hover:border-primary/40 transition-base bg-card"
      >
        <span className="w-8 h-8 rounded-full overflow-hidden bg-muted flex items-center justify-center shrink-0">
          {user && avatar ? (
            <img
              src={avatar}
              alt={displayName || "User"}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <img src={loginCube} alt="Log in" className="w-full h-full object-cover" />
          )}
        </span>
        <span className="text-sm font-medium truncate max-w-[140px]">
          {user ? displayName : "Log in"}
        </span>
      </button>
      <LoginDialog open={showLogin} onOpenChange={setShowLogin} />
    </>
  );
}
