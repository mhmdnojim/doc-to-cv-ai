import { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Eye, EyeOff, Trash2, ShieldCheck, Loader2, Search, ExternalLink, UserPlus } from "lucide-react";
import { toast } from "sonner";

interface AdminTemplate {
  id: string;
  name: string;
  user_id: string;
  is_public: boolean;
  is_disabled: boolean;
  disabled_reason: string | null;
  screenshot_url: string | null;
  created_at: string;
}

interface AdminUser {
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  is_admin: boolean;
}

const Admin = () => {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: roleLoading } = useIsAdmin();
  const navigate = useNavigate();

  const [templates, setTemplates] = useState<AdminTemplate[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<"templates" | "users">("templates");

  const load = useCallback(async () => {
    const [{ data: tpls }, { data: profiles }, { data: roles }] = await Promise.all([
      supabase.from("user_templates").select("id,name,user_id,is_public,is_disabled,disabled_reason,screenshot_url,created_at").order("created_at", { ascending: false }),
      supabase.from("profiles").select("user_id,display_name,avatar_url"),
      supabase.from("user_roles").select("user_id,role"),
    ]);
    setTemplates(tpls || []);
    const adminIds = new Set((roles || []).filter(r => r.role === "admin").map(r => r.user_id));
    setUsers((profiles || []).map(p => ({ ...p, is_admin: adminIds.has(p.user_id) })));
  }, []);

  useEffect(() => {
    if (isAdmin) load();
  }, [isAdmin, load]);

  if (authLoading || roleLoading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;
  }
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center space-y-3">
          <h1 className="text-2xl font-bold">Admin only</h1>
          <p className="text-muted-foreground">Please sign in with an admin account.</p>
          <Link to="/auth"><Button>Sign in</Button></Link>
        </div>
      </div>
    );
  }
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center space-y-3 max-w-md">
          <ShieldCheck className="w-10 h-10 mx-auto text-muted-foreground" />
          <h1 className="text-2xl font-bold">No admin access</h1>
          <p className="text-muted-foreground text-sm">Your account doesn't have admin privileges. Ask an existing admin to grant you the role.</p>
          <Link to="/"><Button variant="outline">Go home</Button></Link>
        </div>
      </div>
    );
  }

  const toggleDisabled = async (t: AdminTemplate) => {
    setBusyId(t.id);
    const next = !t.is_disabled;
    let reason: string | null = t.disabled_reason;
    if (next) {
      const r = window.prompt("Reason (optional):", "");
      reason = r ?? null;
    } else {
      reason = null;
    }
    const { error } = await supabase.from("user_templates").update({ is_disabled: next, disabled_reason: reason }).eq("id", t.id);
    setBusyId(null);
    if (error) return toast.error(error.message);
    toast.success(next ? "Template disabled" : "Template enabled");
    load();
  };

  const remove = async (t: AdminTemplate) => {
    if (!confirm(`Permanently delete "${t.name}"?`)) return;
    setBusyId(t.id);
    const { error } = await supabase.from("user_templates").delete().eq("id", t.id);
    setBusyId(null);
    if (error) return toast.error(error.message);
    toast.success("Template deleted");
    load();
  };

  const toggleAdmin = async (u: AdminUser) => {
    setBusyId(u.user_id);
    if (u.is_admin) {
      if (u.user_id === user.id && !confirm("Remove your own admin access?")) { setBusyId(null); return; }
      const { error } = await supabase.from("user_roles").delete().eq("user_id", u.user_id).eq("role", "admin");
      setBusyId(null);
      if (error) return toast.error(error.message);
      toast.success("Admin removed");
    } else {
      const { error } = await supabase.from("user_roles").insert({ user_id: u.user_id, role: "admin" });
      setBusyId(null);
      if (error) return toast.error(error.message);
      toast.success("Admin granted");
    }
    load();
  };

  const filteredTemplates = templates.filter(t =>
    !search || t.name.toLowerCase().includes(search.toLowerCase()) || t.user_id.includes(search)
  );
  const filteredUsers = users.filter(u =>
    !search || (u.display_name || "").toLowerCase().includes(search.toLowerCase()) || u.user_id.includes(search)
  );
  const userMap = Object.fromEntries(users.map(u => [u.user_id, u]));

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur sticky top-0 z-10">
        <div className="container py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link to="/" className="text-muted-foreground hover:text-foreground"><ArrowLeft className="w-5 h-5" /></Link>
            <div>
              <h1 className="font-bold text-lg flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-primary" /> Admin control panel</h1>
              <p className="text-xs text-muted-foreground">Moderate community templates and admin roles</p>
            </div>
          </div>
          <div className="relative w-64">
            <Search className="w-4 h-4 absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search…" className="pl-8 h-9" />
          </div>
        </div>
        <div className="container flex gap-1 -mb-px">
          {(["templates", "users"] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-base capitalize ${tab === t ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}
            >
              {t} ({t === "templates" ? templates.length : users.length})
            </button>
          ))}
        </div>
      </header>

      <main className="container py-6">
        {tab === "templates" ? (
          <div className="space-y-2">
            {filteredTemplates.length === 0 ? (
              <p className="text-center text-muted-foreground py-12">No templates found.</p>
            ) : filteredTemplates.map(t => {
              const owner = userMap[t.user_id];
              return (
                <div key={t.id} className={`flex items-center gap-4 p-3 rounded-lg border border-border bg-card ${t.is_disabled ? "opacity-60" : ""}`}>
                  <div className="w-12 h-16 rounded bg-muted overflow-hidden shrink-0 flex items-center justify-center text-[9px] text-muted-foreground">
                    {t.screenshot_url ? <span>📄</span> : <span>—</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium truncate">{t.name}</h3>
                      {t.is_disabled && <span className="text-[10px] uppercase tracking-wide bg-destructive/10 text-destructive px-1.5 py-0.5 rounded">Disabled</span>}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      by {owner?.display_name || `user ${t.user_id.slice(0, 8)}`} · {new Date(t.created_at).toLocaleDateString()}
                    </p>
                    {t.disabled_reason && <p className="text-xs text-destructive mt-0.5">Reason: {t.disabled_reason}</p>}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button size="sm" variant="ghost" onClick={() => navigate(`/builder?template=${t.id}`)} title="Open in builder">
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => toggleDisabled(t)} disabled={busyId === t.id} title={t.is_disabled ? "Enable" : "Disable"}>
                      {busyId === t.id ? <Loader2 className="w-4 h-4 animate-spin" /> : t.is_disabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => remove(t)} disabled={busyId === t.id} title="Delete">
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredUsers.length === 0 ? (
              <p className="text-center text-muted-foreground py-12">No users found.</p>
            ) : filteredUsers.map(u => (
              <div key={u.user_id} className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card">
                <div className="w-9 h-9 rounded-full bg-muted overflow-hidden shrink-0">
                  {u.avatar_url ? <img src={u.avatar_url} alt="" className="w-full h-full object-cover" /> : null}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium truncate">{u.display_name || "Unnamed user"}</p>
                    {u.is_admin && <span className="text-[10px] uppercase tracking-wide bg-primary/10 text-primary px-1.5 py-0.5 rounded">Admin</span>}
                  </div>
                  <p className="text-xs text-muted-foreground font-mono truncate">{u.user_id}</p>
                </div>
                <Button size="sm" variant={u.is_admin ? "outline" : "default"} onClick={() => toggleAdmin(u)} disabled={busyId === u.user_id}>
                  {busyId === u.user_id ? <Loader2 className="w-4 h-4 animate-spin" /> : <><UserPlus className="w-4 h-4 mr-1.5" /> {u.is_admin ? "Revoke admin" : "Make admin"}</>}
                </Button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Admin;
