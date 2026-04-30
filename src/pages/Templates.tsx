import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { TEMPLATES, SAMPLE_CV } from "@/lib/cv-types";
import { CVPreview } from "@/components/cv/CVPreview";
import { ArrowLeft, Sparkles, Users } from "lucide-react";
import { AuthPill } from "@/components/AuthPill";
import { supabase } from "@/integrations/supabase/client";

interface CommunityTpl { id: string; name: string; html: string; }

const Templates = () => {
  const navigate = useNavigate();
  const [community, setCommunity] = useState<CommunityTpl[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("user_templates")
        .select("id,name,html")
        .eq("is_public", true)
        .eq("is_disabled", false)
        .order("created_at", { ascending: false })
        .limit(60);
      setCommunity(data || []);
      setLoading(false);
    })();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-40 backdrop-blur-xl bg-background/70 border-b border-border">
        <div className="container flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 text-sm"><ArrowLeft className="w-4 h-4" /> Back</Link>
          <h1 className="font-semibold">Templates</h1>
          <AuthPill />
        </div>
      </nav>

      <div className="container py-12 space-y-16">
        <section>
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
        </section>

        <section>
          <div className="flex items-end justify-between mb-8 gap-4 flex-wrap">
            <div>
              <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                <Users className="w-6 h-6 text-primary" /> Community templates
              </h2>
              <p className="text-muted-foreground mt-1 text-sm">
                AI-generated from screenshots by the community. Free for everyone to use.
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={() => navigate("/builder")}>
              <Sparkles className="w-4 h-4 mr-1.5" /> Create your own
            </Button>
          </div>

          {loading ? (
            <div className="text-sm text-muted-foreground">Loading community templates…</div>
          ) : community.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-10 text-center">
              <p className="text-sm text-muted-foreground">
                No community templates yet. Be the first — open the builder and use <strong>“Create from screenshot”</strong>.
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {community.map(t => (
                <div key={t.id} className="group cursor-pointer" onClick={() => navigate(`/builder?template=${t.id}`)}>
                  <div className="rounded-xl overflow-hidden border border-border bg-card shadow-soft group-hover:shadow-elegant transition-base">
                    <div className="aspect-[210/297] overflow-hidden bg-muted relative">
                      <div className="absolute inset-0 origin-top-left scale-[0.38] sm:scale-[0.42]">
                        <CVPreview data={SAMPLE_CV} template="modern" userTemplateHtml={t.html} />
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold truncate">{t.name}</h3>
                      <p className="text-xs text-muted-foreground">Community · AI-generated</p>
                    </div>
                    <Button size="sm" variant="outline" className="opacity-0 group-hover:opacity-100 transition-base">Use</Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Templates;
