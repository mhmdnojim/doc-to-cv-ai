import { useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { toast } from "sonner";
import { Loader2, ArrowLeft } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

type View = "choose" | "email";

export const LoginDialog = ({ open, onOpenChange }: Props) => {
  const [view, setView] = useState<View>("choose");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [busy, setBusy] = useState(false);

  const reset = () => { setView("choose"); setEmail(""); setPassword(""); setMode("signin"); };

  const handleClose = (v: boolean) => { if (!busy) { onOpenChange(v); if (!v) reset(); } };

  const handleOAuth = async (provider: "google" | "apple") => {
    setBusy(true);
    try {
      const result = await lovable.auth.signInWithOAuth(provider, { redirect_uri: window.location.origin });
      if (result.error) throw result.error;
      if (!result.redirected) {
        toast.success("Signed in!");
        onOpenChange(false);
      }
    } catch (err: any) {
      toast.error(err?.message || `${provider} sign-in failed`);
    } finally {
      setBusy(false);
    }
  };

  const handleEmailContinue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setView("email");
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        toast.success("Account created — you're signed in!");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back!");
      }
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err?.message || "Authentication failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md p-0 overflow-hidden">
        <div className="p-7">
          <DialogTitle className="text-2xl font-bold tracking-tight text-slate-900">
            Log in or create account
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground mt-1.5">
            Build beautiful CVs in minutes with AI-powered templates.
          </DialogDescription>

          {view === "choose" ? (
            <form onSubmit={handleEmailContinue} className="mt-6 space-y-4">
              <div>
                <Label htmlFor="login-email" className="text-sm font-semibold text-slate-900">
                  Email <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="login-email"
                  type="email"
                  placeholder="name@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={busy}
                  className="mt-1.5 h-11"
                />
              </div>

              <Button
                type="submit"
                disabled={busy || !email}
                className="w-full h-11 bg-[#0a3a82] hover:bg-[#072d66] text-white font-semibold"
              >
                Continue
              </Button>

              <div className="relative my-2">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border" /></div>
                <div className="relative flex justify-center text-xs"><span className="bg-card px-3 text-muted-foreground">or</span></div>
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={() => handleOAuth("google")}
                disabled={busy}
                className="w-full h-11 justify-center border-slate-300 hover:bg-slate-50 font-semibold text-slate-800"
              >
                <svg className="w-5 h-5 mr-3" viewBox="0 0 48 48" aria-hidden>
                  <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/>
                  <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
                  <path fill="#4CAF50" d="M24 44c5.2 0 9.8-2 13.4-5.2l-6.2-5.2C29.2 35 26.7 36 24 36c-5.2 0-9.7-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/>
                  <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.1 5.6l6.2 5.2C41.2 35.4 44 30.1 44 24c0-1.3-.1-2.4-.4-3.5z"/>
                </svg>
                Continue with Google
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => handleOAuth("apple")}
                disabled={busy}
                className="w-full h-11 justify-center border-slate-300 hover:bg-slate-50 font-semibold text-slate-800"
              >
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M16.365 1.43c0 1.14-.493 2.27-1.177 3.08-.744.9-1.99 1.57-2.987 1.57-.12 0-.23-.02-.3-.03-.01-.06-.04-.22-.04-.39 0-1.15.572-2.27 1.206-2.98.804-.94 2.142-1.64 3.248-1.68.03.13.05.28.05.43zm4.565 17.09c-.61 1.37-1.36 2.74-2.5 2.76-1.13.03-1.49-.66-2.78-.66-1.29 0-1.69.63-2.76.69-1.11.04-1.96-1.48-2.59-2.84-1.27-2.74-2.25-7.74.94-11.13 1.58-1.66 4.4-2.71 6.32-2.74 1.07-.02 2.08.71 2.74.71.65 0 1.87-.88 3.16-.75.54.02 2.06.22 3.04 1.65-.08.05-1.81 1.05-1.79 3.14.02 2.5 2.2 3.34 2.22 3.35-.02.06-.34 1.18-1.13 2.34z"/>
                </svg>
                Continue with Apple
              </Button>

              <p className="text-xs text-center text-muted-foreground pt-2">
                By continuing, you agree to our Terms and Privacy Policy.
              </p>
            </form>
          ) : (
            <form onSubmit={handleEmailSubmit} className="mt-6 space-y-4">
              <button
                type="button"
                onClick={() => setView("choose")}
                disabled={busy}
                className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>

              <div>
                <Label htmlFor="email-locked" className="text-sm font-semibold text-slate-900">Email</Label>
                <Input id="email-locked" value={email} disabled className="mt-1.5 h-11 bg-muted" />
              </div>

              <div>
                <Label htmlFor="password" className="text-sm font-semibold text-slate-900">
                  Password <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={6}
                  required
                  autoFocus
                  disabled={busy}
                  className="mt-1.5 h-11"
                  placeholder={mode === "signup" ? "Create a password (min 6 chars)" : "Enter your password"}
                />
              </div>

              <Button
                type="submit"
                disabled={busy || !password}
                className="w-full h-11 bg-[#0a3a82] hover:bg-[#072d66] text-white font-semibold"
              >
                {busy && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {mode === "signup" ? "Create account" : "Sign in"}
              </Button>

              <p className="text-sm text-center text-muted-foreground">
                {mode === "signup" ? "Already have an account? " : "New here? "}
                <button
                  type="button"
                  onClick={() => setMode(mode === "signup" ? "signin" : "signup")}
                  className="text-primary hover:underline font-medium"
                >
                  {mode === "signup" ? "Sign in" : "Create an account"}
                </button>
              </p>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
