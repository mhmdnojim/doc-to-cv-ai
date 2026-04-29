import { useEffect, useRef, useState, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CVPreview } from "@/components/cv/CVPreview";
import { AIUploader } from "@/components/cv/AIUploader";
import { TemplateUploadDialog } from "@/components/cv/TemplateUploadDialog";
import { EditorRail } from "@/components/cv/EditorRail";
import { CVData, EMPTY_CV, SAMPLE_CV, TEMPLATES, TemplateId } from "@/lib/cv-types";
import { ArrowLeft, Download, FileText, LayoutTemplate, X, Check, Plus, Sparkles, Upload, Trash2, Pencil, ImagePlus, LogIn, LogOut, Eye, EyeOff, ShieldCheck, FilePlus } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { supabase } from "@/integrations/supabase/client";

const STORAGE_KEY = "cv-builder-data";
const HAS_DATA_KEY = "cv-builder-touched";

interface UserTemplate {
  id: string;
  name: string;
  html: string;
  user_id: string;
  is_disabled: boolean;
  is_public: boolean;
}

const Builder = () => {
  const { user, signOut } = useAuth();
  const { isAdmin } = useIsAdmin();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTemplate = searchParams.get("template") || "modern";
  // template can be a built-in TemplateId OR a user template id (uuid). We treat it as string.
  const [template, setTemplate] = useState<string>(initialTemplate);
  const [showTemplates, setShowTemplates] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [showTplDialog, setShowTplDialog] = useState(false);
  const [userTemplates, setUserTemplates] = useState<UserTemplate[]>([]);
  const [editingTemplate, setEditingTemplate] = useState<UserTemplate | null>(null);
  const editableRef = useRef<HTMLDivElement>(null);
  const pageRefs = useRef<Array<HTMLDivElement | null>>([]);
  const [focusedPage, setFocusedPage] = useState(0);
  // HTML content for blank user-added pages, keyed by page index (>= measuredPages)
  const [blankPageHtml, setBlankPageHtml] = useState<Record<number, string>>({});

  const activeUserTemplate = userTemplates.find(t => t.id === template);
  const userTemplateHtml = activeUserTemplate?.html;

  // ===== Multi-page support =====
  // A4 at 96dpi: 297mm = 1122.5px
  const PAGE_HEIGHT_PX = 1122.5;
  const [manualPages, setManualPages] = useState(1);     // user-requested minimum
  const [measuredPages, setMeasuredPages] = useState(1); // measured from content
  const totalPages = Math.max(manualPages, measuredPages);

  // Observe content height to update auto-page count
  useEffect(() => {
    if (!editableRef.current) return;
    const el = editableRef.current;
    const update = () => {
      const h = el.scrollHeight;
      setMeasuredPages(Math.max(1, Math.ceil(h / PAGE_HEIGHT_PX)));
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [template, userTemplateHtml]);


  const fetchUserTemplates = useCallback(async () => {
    // Load all visible (public + own + admin) templates
    const { data, error } = await supabase
      .from("user_templates")
      .select("id,name,html,user_id,is_disabled,is_public")
      .order("created_at", { ascending: false });
    if (error) { console.error(error); return; }
    setUserTemplates(data || []);
  }, [user, isAdmin]);

  useEffect(() => { fetchUserTemplates(); }, [fetchUserTemplates]);

  const deleteUserTemplate = async (id: string) => {
    if (!confirm("Delete this template?")) return;
    const { error } = await supabase.from("user_templates").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Template deleted");
    if (template === id) handleTemplateChange("modern");
    fetchUserTemplates();
  };

  const toggleDisableTemplate = async (t: UserTemplate) => {
    const next = !t.is_disabled;
    const { error } = await supabase
      .from("user_templates")
      .update({ is_disabled: next })
      .eq("id", t.id);
    if (error) { toast.error(error.message); return; }
    toast.success(next ? "Template disabled" : "Template enabled");
    fetchUserTemplates();
  };

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

  // Inject "+" and "✕" controls next to section headings inside the editable CV
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

      const makeBtn = (svg: string, title: string, bg: string, onClick: (e: Event) => void) => {
        const b = document.createElement("button");
        b.setAttribute("data-section-ctrl", "1");
        b.setAttribute("contenteditable", "false");
        b.title = title;
        b.innerHTML = svg;
        b.style.cssText = `display:inline-flex;align-items:center;justify-content:center;width:20px;height:20px;margin-left:6px;border-radius:9999px;background:${bg};color:white;cursor:pointer;border:none;vertical-align:middle;flex-shrink:0;`;
        b.onclick = (ev) => { ev.preventDefault(); ev.stopPropagation(); onClick(ev); };
        return b;
      };
      const plusSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>`;
      const xSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>`;

      headings.forEach(h => {
        if (h.querySelector("[data-section-ctrl]")) return;
        const text = (h.textContent || "").trim().toLowerCase().replace(/[\/\\]+/g, "").replace(/^\W+|\W+$/g, "");
        const key = Object.keys(sectionMap).find(k => text.includes(k));

        // "+" button — only for known sections (adds a list item)
        if (key) {
          h.appendChild(makeBtn(plusSvg, `Add ${key}`, "hsl(var(--primary))", () => sectionMap[key]()));
        }

        // "✕" button — delete the entire section block. Available for ANY heading (built-in + custom).
        h.appendChild(makeBtn(xSvg, "Delete section", "hsl(var(--destructive))", () => {
          if (!confirm(`Delete this section ("${(h.textContent || "").replace(/\s+/g, " ").trim()}")?`)) return;
          // Remove the closest <section>; otherwise remove the heading + following siblings until next heading
          const section = h.closest("section");
          if (section) { section.remove(); return; }
          const parent = h.parentElement;
          if (!parent) { h.remove(); return; }
          const toRemove: Element[] = [h];
          let sib = h.nextElementSibling;
          while (sib && !["H2", "H3"].includes(sib.tagName)) {
            toRemove.push(sib);
            sib = sib.nextElementSibling;
          }
          toRemove.forEach(el => el.remove());
        }));
      });
    }, 50);
    return () => clearTimeout(t);
  }, [data, template]);

  // Insert a custom section into the left sidebar or right main area of the editable CV
  const addCustomSection = (side: "left" | "right") => {
    const root = editableRef.current;
    if (!root) { toast.error("Open the CV first"); return; }
    // Heuristic: find a vertical column that contains existing headings
    const candidates = Array.from(root.querySelectorAll<HTMLElement>("aside, main, section, div"));
    // Score each candidate by how far its center is from the left edge
    const scored = candidates
      .filter(el => {
        const r = el.getBoundingClientRect();
        return r.width > 80 && r.height > 200; // ignore tiny wrappers
      })
      .map(el => {
        const r = el.getBoundingClientRect();
        const rootRect = root.getBoundingClientRect();
        const relX = (r.left + r.width / 2 - rootRect.left) / rootRect.width;
        return { el, relX, area: r.width * r.height };
      });
    // Pick smallest column on the requested side
    let target: HTMLElement | null = null;
    if (side === "left") {
      const left = scored.filter(s => s.relX < 0.5).sort((a, b) => a.area - b.area)[0];
      target = left?.el || null;
    } else {
      const right = scored.filter(s => s.relX >= 0.5).sort((a, b) => a.area - b.area)[0];
      target = right?.el || null;
    }
    // Fallback: append to root
    if (!target) target = root.firstElementChild as HTMLElement || root;

    const uniqueTitle = `New Section ${Date.now().toString().slice(-4)}`;
    const sec = document.createElement("section");
    sec.style.cssText = "margin-top:1.25rem;";
    sec.innerHTML = `
      <h2 style="font-weight:700;text-transform:uppercase;letter-spacing:0.08em;font-size:0.85rem;margin-bottom:0.5rem;border-bottom:1px solid currentColor;padding-bottom:0.25rem;opacity:0.95;">${uniqueTitle}</h2>
      <p style="font-size:0.85rem;line-height:1.5;opacity:0.9;">Click here to write the content of your new section. You can list anything: certifications, awards, hobbies, references, volunteering…</p>
    `;
    target.appendChild(sec);
    setPendingFocusText(uniqueTitle);
    toast.success(`Custom section added to the ${side} side`);
  };


  const handleTemplateChange = (t: string) => {
    setTemplate(t);
    setSearchParams({ template: t });
  };

  const handleExport = () => {
    toast.success(`Opening print dialog… ${totalPages} page${totalPages > 1 ? "s" : ""}`);
    setTimeout(() => {
      const printArea = document.getElementById("cv-print-area");
      if (printArea && editableRef.current) {
        const clone = editableRef.current.cloneNode(true) as HTMLElement;
        clone.querySelectorAll("[data-add-btn], [data-section-ctrl]").forEach(el => el.remove());
        printArea.innerHTML = clone.innerHTML;
        // Append blank pages for any user-added pages beyond content
        const extra = Math.max(0, manualPages - measuredPages);
        for (let i = 0; i < extra; i++) {
          const blank = document.createElement("div");
          blank.className = "page-break";
          blank.style.cssText = "height: 297mm; width: 210mm;";
          printArea.appendChild(blank);
        }
      }
      window.print();
    }, 200);
  };

  // Update array sections directly
  const addExperience = () => {
    const focusText = "New Position";
    const next = { ...data, experience: [...data.experience, {
      id: Date.now().toString(),
      position: focusText, company: "Company Name",
      startDate: "2024", endDate: "Present", location: "City",
      description: "Click to edit your role description and key achievements.",
    }]};
    localStorage.setItem(HAS_DATA_KEY, "1");
    setData(next);
    setPendingFocusText(focusText);
  };
  const addEducation = () => {
    const focusText = "University Name";
    const next = { ...data, education: [...data.education, {
      id: Date.now().toString(),
      school: focusText, degree: "Degree", field: "Field of Study",
      startDate: "2020", endDate: "2024",
    }]};
    localStorage.setItem(HAS_DATA_KEY, "1");
    setData(next);
    setPendingFocusText(focusText);
  };
  const addSkill = () => {
    const focusText = `New skill ${data.skills.length + 1}`;
    localStorage.setItem(HAS_DATA_KEY, "1");
    setData({ ...data, skills: [...data.skills, focusText] });
    setPendingFocusText(focusText);
  };
  const addLanguage = () => {
    const focusText = `Language ${data.languages.length + 1}`;
    localStorage.setItem(HAS_DATA_KEY, "1");
    setData({ ...data, languages: [...data.languages, { id: Date.now().toString(), name: focusText, level: "Fluent" }] });
    setPendingFocusText(focusText);
  };
  const addProject = () => {
    const focusText = `Project ${data.projects.length + 1}`;
    const next = { ...data, projects: [...data.projects, {
      id: Date.now().toString(),
      name: focusText,
      description: "Brief description of the project and its impact.",
      link: "",
    }]};
    localStorage.setItem(HAS_DATA_KEY, "1");
    setData(next);
    setPendingFocusText(focusText);
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
    setPendingFocusText(placeholders[next]);
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
            {isAdmin && (
              <Link to="/admin"><Button variant="ghost" size="sm" title="Admin panel"><ShieldCheck className="w-4 h-4" /></Button></Link>
            )}
            {user && (
              <Button variant="ghost" size="sm" onClick={() => signOut()} title="Sign out">
                <LogOut className="w-4 h-4" />
              </Button>
            )}
            <div className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-muted-foreground bg-muted/60 rounded-md px-2 py-1.5 border border-border">
              <FileText className="w-3.5 h-3.5" />
              <span>Page {totalPages === 1 ? "1" : `1 / ${totalPages}`}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const next = manualPages + 1;
                setManualPages(next);
                const newIdx = Math.max(measuredPages, next) - 1;
                toast.success(`Page ${next} added`);
                // Scroll to & focus the new page after render
                setTimeout(() => {
                  const el = pageRefs.current[newIdx];
                  if (el) {
                    el.scrollIntoView({ behavior: "smooth", block: "center" });
                    setFocusedPage(newIdx);
                    const editable = el.querySelector<HTMLElement>("[contenteditable='true']");
                    editable?.focus();
                  }
                }, 120);
              }}
              title="Add a blank page"
            >
              <FilePlus className="w-4 h-4 mr-2" /> Add page
            </Button>
            <Button onClick={handleExport} className="bg-gradient-primary shadow-glow">
              <Download className="w-4 h-4 mr-2" /> Export PDF
            </Button>
          </div>
        </div>
      </nav>

      {(() => {
        const templatesPanel = (
          <div>
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

            <div className="mt-5 pt-4 border-t border-border">
              <div className="flex items-center justify-between mb-2 px-1">
                <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Community templates {isAdmin && <span className="ml-1 text-[10px] text-primary">(admin)</span>}
                </h4>
                <button
                  onClick={() => user ? (setEditingTemplate(null), setShowTplDialog(true)) : (toast.info("Sign in to save your templates"), window.location.assign("/auth"))}
                  className="text-primary hover:text-primary/80"
                  title="Upload screenshot to create a template"
                >
                  <ImagePlus className="w-4 h-4" />
                </button>
              </div>
              {userTemplates.length === 0 ? (
                <p className="text-[11px] text-muted-foreground px-1">
                  No community templates yet. {user ? <>Click <ImagePlus className="w-3 h-3 inline" /> to share one.</> : <><Link to="/auth" className="text-primary hover:underline">Sign in</Link> to share one.</>}
                </p>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {userTemplates.map(t => {
                    const active = t.id === template;
                    const isOwner = user?.id === t.user_id;
                    const canModify = isOwner || isAdmin;
                    const ownerLabel = isOwner ? "you" : `user ${t.user_id.slice(0, 6)}`;
                    return (
                      <div key={t.id} className={`relative group ${t.is_disabled ? "opacity-50" : ""}`}>
                        <button
                          onClick={() => handleTemplateChange(t.id)}
                          className={`block w-full rounded-lg overflow-hidden border-2 transition-base ${active ? "border-primary shadow-glow" : "border-border hover:border-primary/50"}`}
                        >
                          <div className="aspect-[210/297] bg-white relative overflow-hidden">
                            <div className="absolute inset-0 origin-top-left scale-[0.13]">
                              <CVPreview data={data} template={t.id} userTemplateHtml={t.html} />
                            </div>
                            {t.is_disabled && (
                              <div className="absolute inset-0 flex items-center justify-center bg-background/60">
                                <span className="text-[10px] font-semibold uppercase tracking-wide text-destructive bg-card px-2 py-0.5 rounded">Disabled</span>
                              </div>
                            )}
                          </div>
                          <div className="px-2 py-1.5 bg-card text-left">
                            <div className="flex items-center justify-between text-[11px] font-medium">
                              <span className="truncate">{t.name}</span>
                              {active && <Check className="w-3 h-3 text-primary shrink-0" />}
                            </div>
                            <div className="text-[9px] text-muted-foreground truncate">by {ownerLabel}</div>
                          </div>
                        </button>
                        {canModify && (
                          <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-base">
                            {isOwner && (
                              <button
                                onClick={(e) => { e.stopPropagation(); setEditingTemplate(t); setShowTplDialog(true); }}
                                className="p-1 rounded-full bg-card/90 text-primary hover:bg-card"
                                title="Replace screenshot"
                              >
                                <ImagePlus className="w-3 h-3" />
                              </button>
                            )}
                            {isAdmin && (
                              <button
                                onClick={(e) => { e.stopPropagation(); toggleDisableTemplate(t); }}
                                className="p-1 rounded-full bg-card/90 text-foreground hover:bg-card"
                                title={t.is_disabled ? "Enable template" : "Disable template"}
                              >
                                {t.is_disabled ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                              </button>
                            )}
                            <button
                              onClick={(e) => { e.stopPropagation(); deleteUserTemplate(t.id); }}
                              className="p-1 rounded-full bg-card/90 text-destructive hover:bg-card"
                              title="Delete"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        );

        return (
          <div className="flex print:block">
            <EditorRail templatesPanel={templatesPanel} editorRef={editableRef} />

            <div className="flex-1 min-w-0 container py-6 print:hidden">

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
              <span className="mx-1 h-5 w-px bg-border" />
              <Button size="sm" variant="outline" onClick={() => addCustomSection("left")}>
                <Plus className="w-3 h-3 mr-1" />Section ← left
              </Button>
              <Button size="sm" variant="outline" onClick={() => addCustomSection("right")}>
                <Plus className="w-3 h-3 mr-1" />Section right →
              </Button>
              <span className="ml-auto flex items-center gap-2 text-xs">
                <button onClick={loadSample} className="text-primary hover:underline">Load sample</button>
                <span className="text-muted-foreground">·</span>
                <button onClick={clearAll} className="text-muted-foreground hover:text-destructive">Clear all</button>
              </span>
            </div>

            <p className="text-xs text-muted-foreground text-center">
              ✨ Click any text to edit · <span className="text-primary">+</span> on a heading adds an item · <span className="text-destructive">✕</span> on a heading deletes the whole section
            </p>

            {/* Editable CV preview — each page is its own A4 card with a toolbar */}
            <div className="flex flex-col items-center gap-8">
              {Array.from({ length: totalPages }).map((_, i) => {
                const isFirst = i === 0;
                const isBlankUserPage = i + 1 > measuredPages;
                const isFocused = focusedPage === i;
                return (
                  <div
                    key={i}
                    ref={(el) => { pageRefs.current[i] = el; }}
                    className="w-full flex flex-col items-center"
                    onMouseDown={() => setFocusedPage(i)}
                  >
                    {/* Page toolbar */}
                    <div className="flex items-center gap-2 mb-2 text-sm font-medium">
                      <span className={isFocused ? "text-primary" : "text-muted-foreground"}>
                        Page {i + 1} <span className="text-muted-foreground">/ {totalPages}</span>
                      </span>
                      {isBlankUserPage && (
                        <button
                          onClick={() => {
                            setManualPages(p => Math.max(1, p - 1));
                            setBlankPageHtml(prev => {
                              const { [i]: _, ...rest } = prev;
                              return rest;
                            });
                          }}
                          className="text-destructive hover:underline text-xs"
                          title="Remove this blank page"
                        >
                          remove
                        </button>
                      )}
                    </div>

                    {/* Scaled A4 sheet */}
                    <div
                      className="origin-top scale-[0.6] sm:scale-[0.7] lg:scale-[0.8] xl:scale-90"
                      style={{ transformOrigin: "top center" }}
                    >
                      <div
                        className={`relative bg-white shadow-elegant rounded-xl overflow-hidden transition-all ${
                          isFocused ? "ring-2 ring-primary ring-offset-4 ring-offset-background" : ""
                        }`}
                        style={{ width: "210mm", height: "297mm" }}
                      >
                        {isFirst ? (
                          // First page hosts the live CVPreview content
                          <div
                            ref={editableRef}
                            contentEditable
                            suppressContentEditableWarning
                            spellCheck
                            className="editable-cv outline-none focus:outline-none [&_*:focus]:outline-2 [&_*:focus]:outline-primary [&_*:focus]:outline-dashed [&_*:focus]:outline-offset-2"
                            style={{
                              // Show only the first 297mm window of the editor; remaining content
                              // visually flows into the next page card below.
                              minHeight: `calc(297mm * ${Math.max(1, measuredPages)})`,
                            }}
                            onFocus={() => setFocusedPage(0)}
                          >
                            <CVPreview data={data} template={template} userTemplateHtml={userTemplateHtml} />
                          </div>
                        ) : i + 1 <= measuredPages ? (
                          // Overflow page — visually a blank A4; the first page's tall content
                          // already overlaps via negative offset trick.
                          <div className="w-full h-full" />
                        ) : (
                          // Manually-added blank page — its own contenteditable canvas
                          <div
                            contentEditable
                            suppressContentEditableWarning
                            spellCheck
                            className="editable-cv outline-none w-full h-full p-12 text-sm text-foreground"
                            style={{ minHeight: "297mm" }}
                            dangerouslySetInnerHTML={{ __html: blankPageHtml[i] || "<p style='color:#94a3b8'>Click here to start writing on this page…</p>" }}
                            onInput={(e) => {
                              const html = (e.currentTarget as HTMLDivElement).innerHTML;
                              setBlankPageHtml(prev => ({ ...prev, [i]: html }));
                            }}
                            onFocus={() => setFocusedPage(i)}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
            </div>
          </div>
        );
      })()}

      {/* Upload-template dialog */}
      <TemplateUploadDialog
        open={showTplDialog}
        onOpenChange={(v) => { setShowTplDialog(v); if (!v) setEditingTemplate(null); }}
        onCreated={async (id) => {
          await fetchUserTemplates();
          if (id) handleTemplateChange(id);
        }}
        editing={editingTemplate}
      />

      {/* Print-only area */}
      <div id="cv-print-area" className="hidden print:block">
        <CVPreview data={data} template={template} userTemplateHtml={userTemplateHtml} />
      </div>
    </div>
  );
};

export default Builder;
