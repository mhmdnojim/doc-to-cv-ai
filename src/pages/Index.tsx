import { Link, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { TEMPLATES, SAMPLE_CV, TemplateId } from "@/lib/cv-types";
import { CVPreview } from "@/components/cv/CVPreview";
import { FileText, Search, Sparkles, Wand2, Upload, Star, ImagePlus, Users } from "lucide-react";
import { TemplateUploadDialog } from "@/components/cv/TemplateUploadDialog";
import { useAuth } from "@/hooks/useAuth";
import { AuthPill } from "@/components/AuthPill";
import { supabase } from "@/integrations/supabase/client";

interface CommunityTpl { id: string; name: string; html: string; }

const CATEGORIES: { label: string; icon: string; ids: TemplateId[] | "all" }[] = [
  { label: "All",          icon: "✨", ids: "all" },
  { label: "Professional", icon: "💼", ids: ["professional", "corporate", "executive", "classic"] },
  { label: "Creative",     icon: "🎨", ids: ["creative", "designer", "bold", "photo"] },
  { label: "Modern",       icon: "⚡", ids: ["modern", "tech", "professional", "photo"] },
  { label: "Minimal",      icon: "◻️", ids: ["minimal", "compact", "elegant", "classic"] },
  { label: "Academic",     icon: "🎓", ids: ["academic", "classic", "elegant", "executive"] },
];

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [showUpload, setShowUpload] = useState(false);
  const [activeCat, setActiveCat] = useState("All");

  const filtered = useMemo(() => {
    const cat = CATEGORIES.find(c => c.label === activeCat);
    let list = TEMPLATES;
    if (cat && cat.ids !== "all") list = list.filter(t => (cat.ids as TemplateId[]).includes(t.id));
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(t => t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q));
    }
    return list;
  }, [activeCat, query]);

  const onSearch = (e: React.FormEvent) => e.preventDefault();


  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="sticky top-0 z-40 backdrop-blur-xl bg-background/70 border-b border-border">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <AuthPill />
          </div>
        </div>
      </nav>

      {/* Hero — Templates header (Canva-style) */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-br from-cyan-100 via-violet-100 to-fuchsia-200"
        />
        <div aria-hidden className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full bg-violet-300/40 blur-3xl" />
        <div aria-hidden className="absolute -bottom-40 -left-20 w-[500px] h-[500px] rounded-full bg-cyan-300/40 blur-3xl" />

        <div className="container relative pt-16 pb-12">
          <div className="absolute top-6 right-6 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full bg-white/80 border border-white text-violet-700 shadow-sm">
              <Sparkles className="w-3.5 h-3.5" /> AI Powered
            </span>
          </div>

          <h1 className="text-center text-6xl sm:text-7xl font-bold tracking-tight text-slate-900">
            Templates
          </h1>

          <form onSubmit={onSearch} className="mt-10 max-w-3xl mx-auto">
            <div className="relative">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search hundreds of CV templates"
                className="w-full h-14 pl-14 pr-4 rounded-2xl bg-white border-2 border-primary/40 focus:border-primary outline-none shadow-soft text-base placeholder:text-muted-foreground"
              />
            </div>
          </form>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {CATEGORIES.map(c => (
              <button
                key={c.label}
                onClick={() => setActiveCat(c.label)}
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full border transition-base text-sm font-medium ${
                  activeCat === c.label
                    ? "bg-white border-primary text-primary shadow-soft"
                    : "bg-white/70 border-white/80 text-slate-700 hover:bg-white"
                }`}
              >
                <span>{c.icon}</span> {c.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Filtered templates grid */}
      <section className="container py-14">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold">{activeCat === "All" ? "All templates" : `${activeCat} templates`}</h2>
            <p className="text-muted-foreground mt-1">{filtered.length} {filtered.length === 1 ? "design" : "designs"} — pick one to start.</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {/* Permanent Create-new-template card */}
          <button
            onClick={() => setShowUpload(true)}
            className="group text-left"
            aria-label="Create new template from screenshot"
          >
            <div className="aspect-[210/297] rounded-xl overflow-hidden border-2 border-dashed border-primary/40 bg-gradient-to-br from-violet-50 via-white to-cyan-50 shadow-soft group-hover:shadow-elegant group-hover:border-primary transition-base relative flex flex-col items-center justify-center p-6 text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-glow mb-4">
                <ImagePlus className="w-8 h-8 text-primary-foreground" />
              </div>
              <h3 className="font-semibold text-base text-slate-900">Create new template</h3>
              <p className="text-xs text-muted-foreground mt-2 px-2">
                Upload a screenshot of any CV and AI will recreate it as a template.
              </p>
              <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-primary">
                <Sparkles className="w-3.5 h-3.5" /> AI powered
              </span>
            </div>
            <div className="mt-3">
              <h3 className="font-semibold text-sm">Your template</h3>
              <p className="text-xs text-muted-foreground line-clamp-1">Upload a screenshot to begin</p>
            </div>
          </button>

          {filtered.length === 0 ? (
            <div className="col-span-full text-center py-20 text-muted-foreground">No templates match your search.</div>
          ) : (
            filtered.map(t => (
              <button
                key={t.id}
                onClick={() => navigate(`/builder?template=${t.id}`)}
                className="group text-left"
              >
                <div className="aspect-[210/297] rounded-xl overflow-hidden border border-border bg-white shadow-soft group-hover:shadow-elegant transition-base relative">
                  <div className="absolute inset-0 origin-top-left scale-[0.32]">
                    <CVPreview data={SAMPLE_CV} template={t.id} />
                  </div>
                  <div className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-base">
                    <Star className="w-3.5 h-3.5 text-amber-500" />
                  </div>
                </div>
                <div className="mt-3">
                  <h3 className="font-semibold text-sm">{t.name}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-1">{t.description}</p>
                </div>
              </button>
            ))
          )}
        </div>
      </section>

      <footer className="border-t border-border py-8">
        <div className="container text-center text-sm text-muted-foreground">With US — make your CV count</div>
      </footer>

      <TemplateUploadDialog
        open={showUpload}
        onOpenChange={setShowUpload}
        onCreated={(id) => { if (id) navigate(`/builder?template=${id}`); }}
      />
      
    </div>
  );
};

export default Index;
