import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { TEMPLATES, SAMPLE_CV } from "@/lib/cv-types";
import { CVPreview } from "@/components/cv/CVPreview";
import { ArrowLeft } from "lucide-react";
import { AuthPill } from "@/components/AuthPill";

const Templates = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-40 backdrop-blur-xl bg-background/70 border-b border-border">
        <div className="container flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 text-sm"><ArrowLeft className="w-4 h-4" /> Back</Link>
          <h1 className="font-semibold">Templates</h1>
          <div className="w-16" />
        </div>
      </nav>

      <div className="container py-12">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h1 className="text-4xl font-bold tracking-tight">Choose your template</h1>
          <p className="text-muted-foreground mt-3">Click any template to start building. You can switch styles anytime.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {TEMPLATES.map(t => (
            <div key={t.id} className="group cursor-pointer" onClick={() => navigate(`/builder?template=${t.id}`)}>
              <div className="rounded-xl overflow-hidden border border-border bg-card shadow-soft group-hover:shadow-elegant transition-base">
                <div className="aspect-[210/297] overflow-hidden bg-muted relative">
                  <div className="absolute inset-0 origin-top-left scale-[0.38] sm:scale-[0.42]">
                    <CVPreview data={SAMPLE_CV} template={t.id} />
                  </div>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">{t.name}</h3>
                  <p className="text-xs text-muted-foreground">{t.description}</p>
                </div>
                <Button size="sm" variant="outline" className="opacity-0 group-hover:opacity-100 transition-base">Use</Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Templates;
