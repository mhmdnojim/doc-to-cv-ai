import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { TEMPLATES } from "@/lib/cv-types";
import { Sparkles, Upload, FileText, Download, Wand2, ArrowRight, CheckCircle2 } from "lucide-react";

const Index = () => {
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

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero pointer-events-none" />
        <div className="container relative pt-20 pb-24 text-center max-w-4xl">
          <div className="inline-flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full bg-accent text-accent-foreground border border-border mb-6">
            <Sparkles className="w-3.5 h-3.5" /> AI-powered CV builder
          </div>
          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight leading-[1.05]">
            Build a CV that <span className="text-gradient">opens doors</span>
          </h1>
          <p className="mt-5 text-lg text-muted-foreground max-w-2xl mx-auto">
            Choose from beautiful templates, fill in your details, or upload an existing CV — our AI will do the heavy lifting.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link to="/builder"><Button size="lg" className="bg-gradient-primary shadow-glow">
              <Wand2 className="w-4 h-4 mr-2" /> Start building
            </Button></Link>
            <Link to="/templates"><Button size="lg" variant="outline">
              Browse templates <ArrowRight className="w-4 h-4 ml-2" />
            </Button></Link>
          </div>

          <div className="mt-10 flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
            {["6 stunning templates", "AI extraction from PDF/DOCX", "One-click PDF export"].map(f => (
              <div key={f} className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-success" /> {f}</div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="container py-20">
        <h2 className="text-3xl font-bold text-center mb-12">Three ways to start</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: Upload, title: "Upload existing CV", desc: "Drop a PDF or DOCX. AI extracts everything in seconds.", color: "from-indigo-500 to-violet-500" },
            { icon: Wand2, title: "Fill in manually", desc: "Use our intuitive editor with live preview.", color: "from-pink-500 to-orange-500" },
            { icon: Download, title: "Export to PDF", desc: "Print-ready, ATS-friendly documents.", color: "from-emerald-500 to-cyan-500" },
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

      {/* Templates teaser */}
      <section className="container pb-24">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold">Pick your style</h2>
            <p className="text-muted-foreground mt-1">6 professional templates, all customizable.</p>
          </div>
          <Link to="/templates"><Button variant="outline">See all <ArrowRight className="w-4 h-4 ml-2" /></Button></Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
          {TEMPLATES.map(t => (
            <Link key={t.id} to={`/builder?template=${t.id}`} className="group">
              <div className="aspect-[3/4] rounded-xl border border-border bg-card overflow-hidden shadow-soft group-hover:shadow-elegant transition-base relative">
                <div className={`absolute inset-x-0 top-0 h-2 bg-gradient-to-r ${t.accent}`} />
                <div className="p-5 pt-7">
                  <div className="h-3 w-24 bg-foreground/80 rounded-sm mb-2" />
                  <div className="h-2 w-32 bg-muted-foreground/40 rounded-sm mb-4" />
                  <div className="space-y-1.5">
                    {[...Array(8)].map((_, i) => <div key={i} className="h-1.5 bg-muted rounded-sm" style={{ width: `${60 + Math.random() * 40}%` }} />)}
                  </div>
                </div>
              </div>
              <h3 className="font-medium mt-3">{t.name}</h3>
              <p className="text-xs text-muted-foreground">{t.description}</p>
            </Link>
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
