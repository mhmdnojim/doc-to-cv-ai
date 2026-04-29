import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CVPreview } from "@/components/cv/CVPreview";
import { AIUploader } from "@/components/cv/AIUploader";
import { CVData, EMPTY_CV, SAMPLE_CV, TEMPLATES, TemplateId } from "@/lib/cv-types";
import { ArrowLeft, Download, FileText, LayoutTemplate, X, Check, Plus, Sparkles, Upload, Trash2, Pencil } from "lucide-react";
import { toast } from "sonner";

const STORAGE_KEY = "cv-builder-data";
const HAS_DATA_KEY = "cv-builder-touched";

const Builder = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTemplate = (searchParams.get("template") as TemplateId) || "modern";
  const [template, setTemplate] = useState<TemplateId>(initialTemplate);
  const [showTemplates, setShowTemplates] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const editableRef = useRef<HTMLDivElement>(null);

  const [data, setData] = useState<CVData>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      const touched = localStorage.getItem(HAS_DATA_KEY);
      if (saved && touched) return JSON.parse(saved);
    } catch {}
    return SAMPLE_CV;
  });

  // Tracks the placeholder text of the most recently added item — used to auto-focus it
  const [pendingFocusText, setPendingFocusText] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  // After data changes, focus & select the freshly added placeholder text
  useEffect(() => {
    if (!pendingFocusText || !editableRef.current) return;
    const t = setTimeout(() => {
      const root = editableRef.current;
      if (!root) return;
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      let node: Node | null;
      while ((node = walker.nextNode())) {
        if (node.textContent?.includes(pendingFocusText)) {
          const range = document.createRange();
          const idx = node.textContent.indexOf(pendingFocusText);
          range.setStart(node, idx);
          range.setEnd(node, idx + pendingFocusText.length);
          const sel = window.getSelection();
          sel?.removeAllRanges();
          sel?.addRange(range);
          const el = node.parentElement;
          if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "center" });
            el.classList.add("just-added-pulse");
            setTimeout(() => el.classList.remove("just-added-pulse"), 1800);
          }
          break;
        }
      }
      setPendingFocusText(null);
    }, 80);
    return () => clearTimeout(t);
  }, [data, pendingFocusText]);

  // Inject "+" buttons next to section headings inside the editable CV
  useEffect(() => {
    const root = editableRef.current;
    if (!root) return;
    const t = setTimeout(() => {
      const headings = root.querySelectorAll<HTMLElement>("h2, h3");
      const sectionMap: Record<string, () => void> = {
        experience: addExperience, "work experience": addExperience, "professional experience": addExperience,
        education: addEducation,
        skills: addSkill, "core competencies": addSkill, stack: addSkill,
        languages: addLanguage,
        projects: addProject,
        contact: addContact, "contact info": addContact, "get in touch": addContact,
      };
      headings.forEach(h => {
        if (h.querySelector("[data-add-btn]")) return;
        const text = (h.textContent || "").trim().toLowerCase().replace(/[\/\\]+/g, "").replace(/^\W+|\W+$/g, "");
        const key = Object.keys(sectionMap).find(k => text.includes(k));
        if (!key) return;
        const btn = document.createElement("button");
        btn.setAttribute("data-add-btn", "1");
        btn.setAttribute("contenteditable", "false");
        btn.title = `Add ${key}`;
        btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>`;
        btn.style.cssText = "display:inline-flex;align-items:center;justify-content:center;width:20px;height:20px;margin-left:8px;border-radius:9999px;background:hsl(var(--primary));color:hsl(var(--primary-foreground));cursor:pointer;border:none;vertical-align:middle;flex-shrink:0;";
        btn.onclick = (ev) => { ev.preventDefault(); ev.stopPropagation(); sectionMap[key](); };
        h.appendChild(btn);
      });
    }, 50);
    return () => clearTimeout(t);
  }, [data, template]);

  const handleTemplateChange = (t: TemplateId) => {
    setTemplate(t);
    setSearchParams({ template: t });
  };

  const handleExport = () => {
    toast.success("Opening print dialog… save as PDF");
    setTimeout(() => {
      const printArea = document.getElementById("cv-print-area");
      if (printArea && editableRef.current) {
        const clone = editableRef.current.cloneNode(true) as HTMLElement;
        clone.querySelectorAll("[data-add-btn]").forEach(el => el.remove());
        printArea.innerHTML = clone.innerHTML;
      }
      window.print();
    }, 200);
  };

  // Update array sections directly
  const addExperience = () => {
    const next = { ...data, experience: [...data.experience, {
      id: Date.now().toString(),
      position: "New Position", company: "Company Name",
      startDate: "2024", endDate: "Present", location: "City",
      description: "Click to edit your role description and key achievements.",
    }]};
    localStorage.setItem(HAS_DATA_KEY, "1");
    setData(next);
  };
  const addEducation = () => {
    const next = { ...data, education: [...data.education, {
      id: Date.now().toString(),
      school: "University Name", degree: "Degree", field: "Field of Study",
      startDate: "2020", endDate: "2024",
    }]};
    localStorage.setItem(HAS_DATA_KEY, "1");
    setData(next);
  };
  const addSkill = () => {
    localStorage.setItem(HAS_DATA_KEY, "1");
    setData({ ...data, skills: [...data.skills, "New skill"] });
  };
  const addLanguage = () => {
    localStorage.setItem(HAS_DATA_KEY, "1");
    setData({ ...data, languages: [...data.languages, { id: Date.now().toString(), name: "Language", level: "Fluent" }] });
  };
  const addProject = () => {
    const next = { ...data, projects: [...data.projects, {
      id: Date.now().toString(),
      name: "Project Name",
      description: "Brief description of the project and its impact.",
      link: "",
    }]};
    localStorage.setItem(HAS_DATA_KEY, "1");
    setData(next);
  };
  const addContact = () => {
    const placeholders: Record<"email" | "phone" | "location" | "website", string> = {
      email: "your.email@example.com",
      phone: "+1 (555) 000-0000",
      location: "City, Country",
      website: "yourwebsite.com",
    };
    const order: Array<"email" | "phone" | "location" | "website"> = ["email", "phone", "location", "website"];
    const next = order.find(f => !data[f]);
    if (!next) {
      toast.info("All contact fields are filled — click any one to edit it.");
      return;
    }
    localStorage.setItem(HAS_DATA_KEY, "1");
    setData({ ...data, [next]: placeholders[next] });
  };

  // Delete helpers
  const touch = () => localStorage.setItem(HAS_DATA_KEY, "1");
  const removeExperience = (id: string) => { touch(); setData({ ...data, experience: data.experience.filter(x => x.id !== id) }); };
  const removeEducation = (id: string) => { touch(); setData({ ...data, education: data.education.filter(x => x.id !== id) }); };
  const removeProject = (id: string) => { touch(); setData({ ...data, projects: data.projects.filter(x => x.id !== id) }); };
  const removeSkill = (i: number) => { touch(); setData({ ...data, skills: data.skills.filter((_, idx) => idx !== i) }); };
  const removeLanguage = (id: string) => { touch(); setData({ ...data, languages: data.languages.filter(x => x.id !== id) }); };
  const clearContact = (field: "email" | "phone" | "location" | "website") => { touch(); setData({ ...data, [field]: "" }); };
  const editContact = (field: "email" | "phone" | "location" | "website", label: string) => {
    const v = prompt(`Edit ${label}:`, (data as any)[field] || "");
    if (v !== null) { touch(); setData({ ...data, [field]: v }); }
  };

  const loadSample = () => {
    localStorage.setItem(HAS_DATA_KEY, "1");
    setData(SAMPLE_CV);
    toast.success("Sample loaded");
  };
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
            <span className="font-semibold text-sm">CV Editor</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={showUpload ? "default" : "outline"}
              size="sm"
              onClick={() => setShowUpload(s => !s)}
            >
              <Upload className="w-4 h-4 mr-2" />
              Import CV
            </Button>
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
        <div className={`grid gap-6 ${showTemplates ? "lg:grid-cols-[260px_1fr]" : "lg:grid-cols-1"}`}>
          {/* Templates sidebar */}
          {showTemplates && (
            <aside className="lg:sticky lg:top-20 lg:self-start lg:max-h-[calc(100vh-6rem)] overflow-y-auto rounded-xl border border-border bg-card p-3">
              <div className="flex items-center justify-between mb-3 px-1">
                <h3 className="font-semibold text-sm">Templates</h3>
                <button onClick={() => setShowTemplates(false)} className="text-muted-foreground hover:text-foreground">
                  <X className="w-4 h-4" />
                </button>
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

          {/* Editable preview area */}
          <div className="space-y-4">
            {/* Import section */}
            {showUpload && (
              <div className="rounded-xl border border-border bg-card p-4 relative">
                <button
                  onClick={() => setShowUpload(false)}
                  className="absolute top-3 right-3 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <h3 className="font-semibold text-sm">Import from existing CV</h3>
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                  Upload a PDF, DOCX, or TXT — AI will extract all fields and fill your CV automatically.
                </p>
                <AIUploader onExtracted={(d) => {
                  localStorage.setItem(HAS_DATA_KEY, "1");
                  setData(d);
                  setShowUpload(false);
                }} />
              </div>
            )}

            {/* Floating add-section toolbar */}
            <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-card p-3">
              <span className="text-xs font-medium text-muted-foreground mr-1">Add to CV:</span>
              <Button size="sm" variant="outline" onClick={addExperience}><Plus className="w-3 h-3 mr-1" />Experience</Button>
              <Button size="sm" variant="outline" onClick={addEducation}><Plus className="w-3 h-3 mr-1" />Education</Button>
              <Button size="sm" variant="outline" onClick={addSkill}><Plus className="w-3 h-3 mr-1" />Skill</Button>
              <Button size="sm" variant="outline" onClick={addLanguage}><Plus className="w-3 h-3 mr-1" />Language</Button>
              <Button size="sm" variant="outline" onClick={addProject}><Plus className="w-3 h-3 mr-1" />Project</Button>
              <span className="ml-auto flex items-center gap-2 text-xs">
                <button onClick={loadSample} className="text-primary hover:underline">Load sample</button>
                <span className="text-muted-foreground">·</span>
                <button onClick={clearAll} className="text-muted-foreground hover:text-destructive">Clear all</button>
              </span>
            </div>

            <p className="text-xs text-muted-foreground text-center">
              ✨ Click any text to edit · Hover any item for delete · Use + buttons on each section heading to add
            </p>

            {/* Editable CV preview */}
            <div className="flex justify-center">
              <div
                className="rounded-xl shadow-elegant overflow-hidden bg-white origin-top scale-[0.6] sm:scale-[0.7] lg:scale-[0.8] xl:scale-90"
                style={{ transformOrigin: "top center" }}
              >
                <div
                  ref={editableRef}
                  contentEditable
                  suppressContentEditableWarning
                  spellCheck
                  className="editable-cv outline-none focus:outline-none [&_*:focus]:outline-2 [&_*:focus]:outline-primary [&_*:focus]:outline-dashed [&_*:focus]:outline-offset-2"
                >
                  <CVPreview data={data} template={template} />
                </div>
              </div>
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
