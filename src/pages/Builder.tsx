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

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  const handleTemplateChange = (t: TemplateId) => {
    setTemplate(t);
    setSearchParams({ template: t });
  };

  const handleExport = () => {
    toast.success("Opening print dialog… save as PDF");
    // Sync editable DOM into print area so manual text edits are preserved
    setTimeout(() => {
      const printArea = document.getElementById("cv-print-area");
      if (printArea && editableRef.current) {
        printArea.innerHTML = editableRef.current.innerHTML;
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
    const skill = prompt("Enter a skill:");
    if (skill) { localStorage.setItem(HAS_DATA_KEY, "1"); setData({ ...data, skills: [...data.skills, skill] }); }
  };
  const addLanguage = () => {
    const name = prompt("Language name:");
    if (!name) return;
    const level = prompt("Level (Native, Fluent, Intermediate...)") || "Fluent";
    localStorage.setItem(HAS_DATA_KEY, "1");
    setData({ ...data, languages: [...data.languages, { id: Date.now().toString(), name, level }] });
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

            {/* Manage items panel */}
            <div className="rounded-xl border border-border bg-card p-4 space-y-4">
              <div className="flex items-center gap-2">
                <Pencil className="w-4 h-4 text-primary" />
                <h3 className="font-semibold text-sm">Manage CV items</h3>
                <span className="text-xs text-muted-foreground">— remove or edit any element</span>
              </div>

              {/* Contact */}
              <div>
                <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Contact</h4>
                <div className="flex flex-wrap gap-2">
                  {(["email","phone","location","website"] as const).map(f => {
                    const val = (data as any)[f] as string;
                    return val ? (
                      <span key={f} className="inline-flex items-center gap-1.5 text-xs bg-muted px-2 py-1 rounded-md group">
                        <button onClick={() => editContact(f, f)} className="hover:text-primary">{val}</button>
                        <button onClick={() => clearContact(f)} className="text-muted-foreground hover:text-destructive">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ) : (
                      <button key={f} onClick={() => editContact(f, f)} className="text-xs px-2 py-1 rounded-md border border-dashed border-border text-muted-foreground hover:text-primary hover:border-primary">
                        + {f}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Skills */}
              <div>
                <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Skills ({data.skills.length})</h4>
                <div className="flex flex-wrap gap-1.5">
                  {data.skills.map((s, i) => (
                    <span key={i} className="inline-flex items-center gap-1 text-xs bg-primary/10 text-primary px-2 py-1 rounded-md">
                      {s}
                      <button onClick={() => removeSkill(i)} className="hover:text-destructive"><X className="w-3 h-3" /></button>
                    </span>
                  ))}
                  <button onClick={addSkill} className="text-xs px-2 py-1 rounded-md border border-dashed border-border text-muted-foreground hover:text-primary hover:border-primary inline-flex items-center gap-1">
                    <Plus className="w-3 h-3" /> Add skill
                  </button>
                </div>
              </div>

              {/* Languages */}
              <div>
                <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Languages ({data.languages.length})</h4>
                <div className="flex flex-wrap gap-1.5">
                  {data.languages.map(l => (
                    <span key={l.id} className="inline-flex items-center gap-1 text-xs bg-muted px-2 py-1 rounded-md">
                      {l.name} · {l.level}
                      <button onClick={() => removeLanguage(l.id)} className="hover:text-destructive"><X className="w-3 h-3" /></button>
                    </span>
                  ))}
                  <button onClick={addLanguage} className="text-xs px-2 py-1 rounded-md border border-dashed border-border text-muted-foreground hover:text-primary hover:border-primary inline-flex items-center gap-1">
                    <Plus className="w-3 h-3" /> Add language
                  </button>
                </div>
              </div>

              {/* Experience */}
              <div>
                <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Experience ({data.experience.length})</h4>
                <div className="space-y-1.5">
                  {data.experience.map(e => (
                    <div key={e.id} className="flex items-center justify-between gap-2 text-xs bg-muted/50 px-3 py-2 rounded-md">
                      <span className="truncate"><strong>{e.position || "Untitled"}</strong> — {e.company} <span className="text-muted-foreground">({e.startDate}–{e.endDate})</span></span>
                      <button onClick={() => removeExperience(e.id)} className="text-muted-foreground hover:text-destructive shrink-0"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Education */}
              <div>
                <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Education ({data.education.length})</h4>
                <div className="space-y-1.5">
                  {data.education.map(e => (
                    <div key={e.id} className="flex items-center justify-between gap-2 text-xs bg-muted/50 px-3 py-2 rounded-md">
                      <span className="truncate"><strong>{e.degree} {e.field}</strong> — {e.school} <span className="text-muted-foreground">({e.startDate}–{e.endDate})</span></span>
                      <button onClick={() => removeEducation(e.id)} className="text-muted-foreground hover:text-destructive shrink-0"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Projects */}
              <div>
                <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Projects ({data.projects.length})</h4>
                <div className="space-y-1.5">
                  {data.projects.map(p => (
                    <div key={p.id} className="flex items-center justify-between gap-2 text-xs bg-muted/50 px-3 py-2 rounded-md">
                      <span className="truncate"><strong>{p.name}</strong> {p.link && <span className="text-muted-foreground">— {p.link}</span>}</span>
                      <button onClick={() => removeProject(p.id)} className="text-muted-foreground hover:text-destructive shrink-0"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <p className="text-xs text-muted-foreground text-center">
              ✨ Click any text on your CV to edit it directly
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
                  className="editable-cv outline-none focus:outline-none [&_*:focus]:outline-2 [&_*:focus]:outline-primary [&_*:focus]:outline-dashed [&_*:focus]:outline-offset-2 [&_*:hover]:bg-primary/5"
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
