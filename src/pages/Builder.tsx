import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CVForm } from "@/components/cv/CVForm";
import { CVPreview } from "@/components/cv/CVPreview";
import { AIUploader } from "@/components/cv/AIUploader";
import { CVData, EMPTY_CV, SAMPLE_CV, TEMPLATES, TemplateId } from "@/lib/cv-types";
import { ArrowLeft, Download, Sparkles, FileText } from "lucide-react";
import { toast } from "sonner";

const STORAGE_KEY = "cv-builder-data";

const Builder = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTemplate = (searchParams.get("template") as TemplateId) || "modern";
  const [template, setTemplate] = useState<TemplateId>(initialTemplate);
  const [data, setData] = useState<CVData>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : EMPTY_CV;
    } catch { return EMPTY_CV; }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  const handleTemplateChange = (t: TemplateId) => {
    setTemplate(t);
    setSearchParams({ template: t });
  };

  const handleExport = () => {
    toast.success("Opening print dialog… save as PDF");
    setTimeout(() => window.print(), 200);
  };

  const loadSample = () => { setData(SAMPLE_CV); toast.success("Sample data loaded"); };
  const clearAll = () => { if (confirm("Clear all data?")) setData(EMPTY_CV); };

  return (
    <div className="min-h-screen bg-gradient-soft">
      {/* Top bar — hidden on print */}
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
            <Select value={template} onValueChange={(v) => handleTemplateChange(v as TemplateId)}>
              <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
              <SelectContent>
                {TEMPLATES.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button onClick={handleExport} className="bg-gradient-primary shadow-glow">
              <Download className="w-4 h-4 mr-2" /> Export PDF
            </Button>
          </div>
        </div>
      </nav>

      <div className="container py-6 print:hidden">
        <div className="grid lg:grid-cols-[420px_1fr] gap-6">
          {/* Left: form */}
          <div className="space-y-4 lg:sticky lg:top-20 lg:self-start lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto pr-1">
            <AIUploader onExtracted={setData} />

            <div className="flex items-center gap-2 text-xs">
              <button onClick={loadSample} className="text-primary hover:underline inline-flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Load sample
              </button>
              <span className="text-muted-foreground">·</span>
              <button onClick={clearAll} className="text-muted-foreground hover:text-destructive">Clear all</button>
            </div>

            <CVForm data={data} onChange={setData} />
          </div>

          {/* Right: preview */}
          <div className="flex justify-center">
            <div className="rounded-xl shadow-elegant overflow-hidden bg-white origin-top scale-[0.7] sm:scale-[0.8] lg:scale-90 xl:scale-100" style={{ transformOrigin: "top center" }}>
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
