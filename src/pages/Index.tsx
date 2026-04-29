import { Link, useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { TEMPLATES, SAMPLE_CV, TemplateId } from "@/lib/cv-types";
import { CVPreview } from "@/components/cv/CVPreview";
import { FileText, Search, Sparkles, Wand2, Upload, Star } from "lucide-react";

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
  const [query, setQuery] = useState("");
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
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center shadow-glow">
              <FileText className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-semibold tracking-tight">Resumé</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link to="/templates"><Button variant="ghost" size="sm">Templates</Button></Link>
            <Link to="/builder"><Button size="sm" className="bg-gradient-primary shadow-glow">Build my CV</Button></Link>
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

      {/* Explore templates — colored category cards */}
      <section className="container py-16">
        <h2 className="text-3xl font-bold mb-8">Explore templates</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {EXPLORE.map(card => (
            <button
              key={card.id}
              onClick={() => navigate(`/builder?template=${card.id}`)}
              className={`group relative h-44 rounded-2xl bg-gradient-to-br ${card.bg} p-6 text-left overflow-hidden hover:shadow-elegant transition-base`}
            >
              <h3 className="text-xl font-bold text-slate-900 relative z-10">{card.title}</h3>
              <div className="absolute -bottom-6 -right-4 w-32 h-44 rounded-xl bg-white shadow-elegant rotate-6 group-hover:rotate-3 transition-base overflow-hidden">
                <div className="absolute inset-0 origin-top-left scale-[0.16]">
                  <CVPreview data={SAMPLE_CV} template={card.id as any} />
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* All templates grid */}
      <section className="container pb-20">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold">All templates</h2>
            <p className="text-muted-foreground mt-1">{TEMPLATES.length} professional designs — pick one to start.</p>
          </div>
          <Link to="/templates"><Button variant="outline">View gallery</Button></Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {TEMPLATES.map(t => (
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
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="container pb-24">
        <h2 className="text-3xl font-bold text-center mb-10">Three ways to start</h2>
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {[
            { icon: Upload, title: "Upload existing CV", desc: "Drop a PDF or DOCX. AI extracts everything in seconds.", color: "from-indigo-500 to-violet-500" },
            { icon: Wand2,  title: "Fill in manually",   desc: "Use our intuitive editor with live preview.",        color: "from-pink-500 to-orange-500" },
            { icon: FileText, title: "Export to PDF",    desc: "Print-ready, ATS-friendly documents.",               color: "from-emerald-500 to-cyan-500" },
          ].map(({ icon: Icon, title, desc, color }) => (
            <div key={title} className="rounded-2xl border border-border bg-card p-6 shadow-soft hover:shadow-elegant transition-base">
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-4`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-semibold text-lg">{title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-border py-8">
        <div className="container text-center text-sm text-muted-foreground">Built with ❤️ — make every application count.</div>
      </footer>
    </div>
  );
};

export default Index;
