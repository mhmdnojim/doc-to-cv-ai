import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CVForm } from "@/components/cv/CVForm";
import { CVPreview } from "@/components/cv/CVPreview";
import { AIUploader } from "@/components/cv/AIUploader";
import { CVData, EMPTY_CV, SAMPLE_CV, TEMPLATES, TemplateId } from "@/lib/cv-types";
import { ArrowLeft, Download, Sparkles, FileText, LayoutTemplate, X, Check } from "lucide-react";
import { toast } from "sonner";

const STORAGE_KEY = "cv-builder-data";
const HAS_DATA_KEY = "cv-builder-touched";

const Builder = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTemplate = (searchParams.get("template") as TemplateId) || "modern";
  const [template, setTemplate] = useState<TemplateId>(initialTemplate);
  const [showTemplates, setShowTemplates] = useState(false);

  const [data, setData] = useState<CVData>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      const touched = localStorage.getItem(HAS_DATA_KEY);
      if (saved && touched) return JSON.parse(saved);
    } catch {}
    // First visit: prefill with sample so the chosen template is visible
    return SAMPLE_CV;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  // Mark data as user-touched once they edit
  const handleDataChange = (next: CVData) => {
    localStorage.setItem(HAS_DATA_KEY, "1");
    setData(next);
  };

  const handleTemplateChange = (t: TemplateId) => {
    setTemplate(t);
    setSearchParams({ template: t });
  };

  const handleExport = () => {
    toast.success("Opening print dialog… save as PDF");
    setTimeout(() => window.print(), 200);
  };

  const loadSample = () => { handleDataChange(SAMPLE_CV); toast.success("Sample data loaded"); };
  const clearAll = () => {
    if (confirm("Clear all data?")) {
      localStorage.removeItem(HAS_DATA_KEY);
      setData(EMPTY_CV);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-soft">
      {/* Top bar */}
      <nav className="sticky top-0 z-40 backdrop-blur-xl bg-background/80 border-b border-border print:hidden">
        <div className="container flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 text-sm hover:text-primary transition-base">
            <ArrowLeft className="w-4 h-4" /> Home
          </Link>
          <div className="flex items-center gap-3">
            <FileText className="w-4 h-4 text-primary" />
            <span className="font-semibold text-sm">CV Builder</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={showTemplates ? "default" : "outline"}
              size="sm"
              onClick={() => setShowTemplates(s => !s)}
            >
              <LayoutTemplate className="w-4 h-4 mr-2" />
              Templates
            </Button>
            <Button onClick={handleExport} className="bg-gradient-primary shadow-glow">
              <Download className="w-4 h-4 mr-2" /> Export PDF
            </Button>
          </div>
        </div>
      </nav>

      <div className="container py-6 print:hidden">
        <div
          className={`grid gap-6 ${
            showTemplates
              ? "lg:grid-cols-[260px_380px_1fr]"
              : "lg:grid-cols-[420px_1fr]"
          }`}
        >
          {/* Templates sidebar (toggleable) */}
          {showTemplates && (
            <aside className="lg:sticky lg:top-20 lg:self-start lg:max-h-[calc(100vh-6rem)] overflow-y-auto rounded-xl border border-border bg-card p-3">
              <div className="flex items-center justify-between mb-3 px-1">
                <h3 className="font-semibold text-sm">Templates</h3>
                <button onClick={() => setShowTemplates(false)} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {TEMPLATES.map(t => {
                  const active = t.id === template;
                  return (
                    <button
                      key={t.id}
                      onClick={() => handleTemplateChange(t.id)}
                      className={`group relative rounded-lg overflow-hidden border-2 transition-base ${
                        active ? "border-primary shadow-glow" : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div className="aspect-[210/297] bg-white relative overflow-hidden">
                        <div className="absolute inset-0 origin-top-left scale-[0.13]">
                          <CVPreview data={data} template={t.id} />
                        </div>
                      </div>
                      <div className="px-2 py-1.5 text-[11px] font-medium text-left bg-card flex items-center justify-between">
                        <span className="truncate">{t.name}</span>
                        {active && <Check className="w-3 h-3 text-primary shrink-0" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </aside>
          )}

          {/* Form column */}
          <div className="space-y-4 lg:sticky lg:top-20 lg:self-start lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto pr-1">
            <AIUploader onExtracted={(d) => { localStorage.setItem(HAS_DATA_KEY, "1"); setData(d); }} />

            <div className="flex items-center gap-2 text-xs">
              <button onClick={loadSample} className="text-primary hover:underline inline-flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Load sample
              </button>
              <span className="text-muted-foreground">·</span>
              <button onClick={clearAll} className="text-muted-foreground hover:text-destructive">Clear all</button>
            </div>

            <CVForm data={data} onChange={handleDataChange} />
          </div>

          {/* Preview */}
          <div className="flex justify-center">
            <div className="rounded-xl shadow-elegant overflow-hidden bg-white origin-top scale-[0.6] sm:scale-[0.7] lg:scale-[0.8] xl:scale-90" style={{ transformOrigin: "top center" }}>
              <CVPreview data={data} template={template} />
            </div>
          </div>
        </div>
      </div>

      {/* Print-only area */}
      <div id="cv-print-area" className="hidden print:block">
        <CVPreview data={data} template={template} />
      </div>
    </div>
  );
};

export default Builder;
