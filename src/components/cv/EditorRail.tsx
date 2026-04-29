import { useState, useRef, useEffect } from "react";
import { LayoutTemplate, Type, Sparkles, X, Bold, Italic, Underline, Loader2, Wand2, Minus, Plus, ArrowRight, Copy, RotateCw, ArrowLeft, PlusSquare, MoveVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { NewSectionTemplate } from "@/lib/cv-section-tools";
import { useAuth } from "@/hooks/useAuth";

type RailKey = "templates" | "add" | "text" | "magic";

interface AddActions {
  addExperience: () => void;
  addEducation: () => void;
  addSkill: () => void;
  addLanguage: () => void;
  addProject: () => void;
  addCustomSection: (side: "left" | "right") => void;
  /** Open the position picker dialog to insert a section at a specific spot */
  addSectionAt: (spec: NewSectionTemplate) => void;
  loadSample: () => void;
  clearAll: () => void;
}

interface Props {
  /** Provided panel content for templates (existing UI) */
  templatesPanel: React.ReactNode;
  /** Reference to the contenteditable element so we can apply formatting / selection edits */
  editorRef: React.RefObject<HTMLDivElement>;
  /** Section / sample actions, surfaced from Builder */
  addActions: AddActions;
}

const RAIL_ITEMS: { key: RailKey; label: string; icon: any }[] = [
  { key: "templates", label: "Templates", icon: LayoutTemplate },
  { key: "add",       label: "Add",       icon: PlusSquare },
  { key: "text",      label: "Text",      icon: Type },
  { key: "magic",     label: "Magic Write", icon: Sparkles },
];

const MIN_FONT = 8;
const MAX_FONT = 72;

export const EditorRail = ({ templatesPanel, editorRef, addActions }: Props) => {
  const { user } = useAuth();
  const [active, setActive] = useState<RailKey | null>("templates");

  // Magic Write state
  const [magicOpen, setMagicOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [busy, setBusy] = useState(false);
  const [generatedText, setGeneratedText] = useState("");
  const [lastSelection, setLastSelection] = useState("");
  const savedRange = useRef<Range | null>(null);
  const [currentSize, setCurrentSize] = useState(14);

  // Capture selection whenever it changes inside the editor
  useEffect(() => {
    const onSelChange = () => {
      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0) return;
      const range = sel.getRangeAt(0);
      const editor = editorRef.current;
      if (editor && editor.contains(range.commonAncestorContainer)) {
        savedRange.current = range.cloneRange();
        setLastSelection(sel.toString());
        // Read computed font-size of the focused node
        const node = (sel.anchorNode?.nodeType === 3 ? sel.anchorNode.parentElement : sel.anchorNode as HTMLElement) || null;
        if (node) {
          const px = parseInt(window.getComputedStyle(node).fontSize);
          if (!isNaN(px)) setCurrentSize(Math.min(MAX_FONT, Math.max(MIN_FONT, px)));
        }
      }
    };
    document.addEventListener("selectionchange", onSelChange);
    return () => document.removeEventListener("selectionchange", onSelChange);
  }, [editorRef]);

  const restoreSelection = () => {
    if (!savedRange.current) return null;
    const sel = window.getSelection();
    if (!sel) return null;
    sel.removeAllRanges();
    sel.addRange(savedRange.current);
    return savedRange.current;
  };

  const exec = (cmd: string, value?: string) => {
    restoreSelection();
    document.execCommand(cmd, false, value);
    editorRef.current?.focus();
  };

  const setFontSize = (px: number) => {
    restoreSelection();
    // execCommand fontSize uses 1-7 scale; wrap in span instead
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || sel.isCollapsed) {
      toast.info("Select some text first");
      return;
    }
    const range = sel.getRangeAt(0);
    const span = document.createElement("span");
    span.style.fontSize = `${px}px`;
    try {
      span.appendChild(range.extractContents());
      range.insertNode(span);
      sel.removeAllRanges();
      const newRange = document.createRange();
      newRange.selectNodeContents(span);
      sel.addRange(newRange);
      savedRange.current = newRange.cloneRange();
    } catch (e) {
      console.error(e);
    }
  };

  const setFontFamily = (family: string) => {
    restoreSelection();
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0 && !sel.isCollapsed) {
      const range = sel.getRangeAt(0);
      const span = document.createElement("span");
      span.style.fontFamily = family;
      try {
        span.appendChild(range.extractContents());
        range.insertNode(span);
        sel.removeAllRanges();
        const newRange = document.createRange();
        newRange.selectNodeContents(span);
        sel.addRange(newRange);
        savedRange.current = newRange.cloneRange();
      } catch (e) { console.error(e); }
    } else if (editorRef.current) {
      editorRef.current.style.fontFamily = family;
      toast.success("Font applied to whole CV");
    }
  };

  const generateMagic = async (mode?: "improve" | "shorten" | "expand") => {
    if (!user) {
      toast.info("Please sign in to use Magic Write");
      window.location.assign("/auth");
      return;
    }
    const selection = lastSelection.trim();
    if (!selection && !prompt.trim()) {
      toast.error("Describe what you want to write");
      return;
    }
    setBusy(true);
    try {
      const { data, error } = await supabase.functions.invoke("magic-write", {
        body: { prompt, selection, mode },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      const text: string = data?.text || "";
      if (!text) throw new Error("No text returned");
      setGeneratedText(text);
    } catch (e: any) {
      toast.error(e.message || "Magic Write failed");
    } finally {
      setBusy(false);
    }
  };

  const insertGenerated = () => {
    if (!generatedText) return;
    const editor = editorRef.current;
    if (!editor) return;

    if (savedRange.current && editor.contains(savedRange.current.commonAncestorContainer)) {
      restoreSelection();
      document.execCommand("insertText", false, generatedText);
    } else {
      // No selection: append to end of editor
      editor.focus();
      const sel = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(editor);
      range.collapse(false);
      sel?.removeAllRanges();
      sel?.addRange(range);
      document.execCommand("insertText", false, "\n" + generatedText);
    }
    toast.success("Inserted into CV");
    setMagicOpen(false);
    setGeneratedText("");
    setPrompt("");
  };

  const copyGenerated = async () => {
    await navigator.clipboard.writeText(generatedText);
    toast.success("Copied to clipboard");
  };

  return (
    <div className="flex print:hidden lg:h-full">
      {/* Vertical icon rail */}
      <div className="w-16 shrink-0 bg-card border-r border-border flex flex-col items-center py-3 gap-1 lg:h-full lg:overflow-y-auto">
        {RAIL_ITEMS.map(item => {
          const Icon = item.icon;
          const isActive = active === item.key;
          return (
            <button
              key={item.key}
              onClick={() => {
                if (item.key === "magic") {
                  if (!user) {
                    toast.info("Please sign in to use Magic Write");
                    window.location.assign("/auth");
                    return;
                  }
                  setMagicOpen(true);
                  return;
                }
                setActive(isActive ? null : item.key);
              }}
              className={`w-14 py-2.5 rounded-lg flex flex-col items-center gap-1 transition-base ${
                isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
              title={item.label}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium leading-none">{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Slide-out panel */}
      {active && (
        <div className="w-[300px] shrink-0 bg-card border-r border-border lg:h-full overflow-y-auto">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border sticky top-0 bg-card z-10">
            <h3 className="font-semibold text-sm capitalize">
              {RAIL_ITEMS.find(r => r.key === active)?.label}
            </h3>
            <button onClick={() => setActive(null)} className="text-muted-foreground hover:text-foreground">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-3">
            {active === "templates" && templatesPanel}

            {active === "add" && (
              <div className="space-y-4">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  <strong className="text-foreground">Tip:</strong> Hover between sections in the CV to see <span className="text-primary">+ Add here</span>, or drag the <MoveVertical className="w-3 h-3 inline" /> handle to reorder.
                </p>

                <div>
                  <label className="text-[11px] uppercase tracking-wide text-muted-foreground font-semibold">Add a quick item</label>
                  <p className="text-[10px] text-muted-foreground mb-2 mt-0.5">Adds to the existing section instantly.</p>
                  <div className="grid grid-cols-2 gap-2">
                    <Button size="sm" variant="outline" onClick={addActions.addExperience}><Plus className="w-3 h-3 mr-1" />Experience</Button>
                    <Button size="sm" variant="outline" onClick={addActions.addEducation}><Plus className="w-3 h-3 mr-1" />Education</Button>
                    <Button size="sm" variant="outline" onClick={addActions.addSkill}><Plus className="w-3 h-3 mr-1" />Skill</Button>
                    <Button size="sm" variant="outline" onClick={addActions.addLanguage}><Plus className="w-3 h-3 mr-1" />Language</Button>
                    <Button size="sm" variant="outline" onClick={addActions.addProject} className="col-span-2"><Plus className="w-3 h-3 mr-1" />Project</Button>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] uppercase tracking-wide text-muted-foreground font-semibold">Add a new section</label>
                  <p className="text-[10px] text-muted-foreground mb-2 mt-0.5">Picks where to place it (start, end, or after another section).</p>
                  <div className="grid grid-cols-2 gap-2">
                    <Button size="sm" variant="outline" onClick={() => addActions.addSectionAt({ type: "experience" })}><Plus className="w-3 h-3 mr-1" />Experience</Button>
                    <Button size="sm" variant="outline" onClick={() => addActions.addSectionAt({ type: "education" })}><Plus className="w-3 h-3 mr-1" />Education</Button>
                    <Button size="sm" variant="outline" onClick={() => addActions.addSectionAt({ type: "skills" })}><Plus className="w-3 h-3 mr-1" />Skills</Button>
                    <Button size="sm" variant="outline" onClick={() => addActions.addSectionAt({ type: "languages" })}><Plus className="w-3 h-3 mr-1" />Languages</Button>
                    <Button size="sm" variant="outline" onClick={() => addActions.addSectionAt({ type: "projects" })}><Plus className="w-3 h-3 mr-1" />Projects</Button>
                    <Button size="sm" variant="outline" onClick={() => addActions.addSectionAt({ type: "custom" })}><Plus className="w-3 h-3 mr-1" />Custom</Button>
                  </div>
                </div>

                <div className="pt-2 border-t border-border flex items-center justify-between text-xs">
                  <button onClick={addActions.loadSample} className="text-primary hover:underline">Load sample</button>
                  <button onClick={addActions.clearAll} className="text-muted-foreground hover:text-destructive">Clear all</button>
                </div>
              </div>
            )}

            {active === "text" && (
              <div className="space-y-4">
                <p className="text-xs text-muted-foreground">
                  Select text in the CV, then format it here.
                </p>

                <div>
                  <label className="text-[11px] uppercase tracking-wide text-muted-foreground font-semibold">Font family</label>
                  <select
                    onChange={(e) => setFontFamily(e.target.value)}
                    defaultValue=""
                    className="mt-1.5 w-full h-9 rounded-md border border-input bg-background px-2 text-sm"
                  >
                    <option value="" disabled>Choose a font…</option>
                    <optgroup label="Sans-serif">
                      <option value="Inter, system-ui, sans-serif">Inter</option>
                      <option value="'Helvetica Neue', Helvetica, Arial, sans-serif">Helvetica</option>
                      <option value="Arial, sans-serif">Arial</option>
                      <option value="'Roboto', sans-serif">Roboto</option>
                      <option value="'Open Sans', sans-serif">Open Sans</option>
                      <option value="'Lato', sans-serif">Lato</option>
                      <option value="'Montserrat', sans-serif">Montserrat</option>
                      <option value="'Poppins', sans-serif">Poppins</option>
                    </optgroup>
                    <optgroup label="Serif">
                      <option value="Georgia, serif">Georgia</option>
                      <option value="'Times New Roman', Times, serif">Times New Roman</option>
                      <option value="'Playfair Display', serif">Playfair Display</option>
                      <option value="'Merriweather', serif">Merriweather</option>
                      <option value="Garamond, serif">Garamond</option>
                    </optgroup>
                    <optgroup label="Monospace">
                      <option value="'Courier New', Courier, monospace">Courier New</option>
                      <option value="'JetBrains Mono', monospace">JetBrains Mono</option>
                    </optgroup>
                  </select>
                  <p className="text-[10px] text-muted-foreground mt-1">Select text first, or apply to whole CV.</p>
                </div>

                <div>
                  <label className="text-[11px] uppercase tracking-wide text-muted-foreground font-semibold">Style</label>
                  <div className="mt-1.5 flex gap-1">
                    <Button variant="outline" size="sm" onClick={() => exec("bold")} className="flex-1" title="Bold (Ctrl+B)">
                      <Bold className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => exec("italic")} className="flex-1" title="Italic">
                      <Italic className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => exec("underline")} className="flex-1" title="Underline">
                      <Underline className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] uppercase tracking-wide text-muted-foreground font-semibold">Font size</label>
                    <span className="text-xs font-semibold tabular-nums">{currentSize}px</span>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7 shrink-0"
                      onClick={() => {
                        const next = Math.max(MIN_FONT, currentSize - 1);
                        setCurrentSize(next);
                        setFontSize(next);
                      }}
                      title="Decrease"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </Button>
                    <Slider
                      value={[currentSize]}
                      min={MIN_FONT}
                      max={MAX_FONT}
                      step={1}
                      onValueChange={(v) => {
                        const px = v[0];
                        setCurrentSize(px);
                        setFontSize(px);
                      }}
                      className="flex-1"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7 shrink-0"
                      onClick={() => {
                        const next = Math.min(MAX_FONT, currentSize + 1);
                        setCurrentSize(next);
                        setFontSize(next);
                      }}
                      title="Increase"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                  <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
                    <span>{MIN_FONT}</span>
                    <span>{MAX_FONT}</span>
                  </div>
                </div>

                {lastSelection && (
                  <div className="text-[11px] text-muted-foreground p-2 rounded bg-muted/40 border border-border">
                    <span className="font-semibold text-foreground">Selected:</span> {lastSelection.slice(0, 80)}{lastSelection.length > 80 ? "…" : ""}
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      )}

      {/* Magic Write floating popup */}
      {magicOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/30 backdrop-blur-sm p-4 pt-24 print:hidden"
          onClick={() => setMagicOpen(false)}
        >
          <div
            className="w-full max-w-2xl bg-card border border-primary/30 rounded-2xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-gradient-to-r from-violet-50 to-cyan-50 dark:from-violet-950/30 dark:to-cyan-950/30">
              <div className="flex items-center gap-2">
                {generatedText && (
                  <button
                    onClick={() => setGeneratedText("")}
                    className="text-muted-foreground hover:text-foreground"
                    title="Back"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                )}
                <Wand2 className="w-4 h-4 text-primary" />
                <span className="font-semibold text-sm">Magic Write</span>
              </div>
              <button
                onClick={() => setMagicOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5">
              {!generatedText ? (
                <>
                  {lastSelection ? (
                    <div className="text-[11px] p-2 mb-3 rounded bg-muted/40 border border-border">
                      <span className="font-semibold">Selected:</span> {lastSelection.slice(0, 120)}{lastSelection.length > 120 ? "…" : ""}
                    </div>
                  ) : (
                    <p className="text-[11px] text-muted-foreground italic mb-3">
                      Tip: select text in your CV first to rewrite it, or just describe what you want.
                    </p>
                  )}

                  <Textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Describe your writing task (5+ words)…"
                    rows={4}
                    className="text-sm resize-none"
                    disabled={busy}
                    autoFocus
                  />

                  {lastSelection && (
                    <div className="mt-3 grid grid-cols-3 gap-1.5">
                      <Button variant="outline" size="sm" disabled={busy} onClick={() => generateMagic("improve")}>Improve</Button>
                      <Button variant="outline" size="sm" disabled={busy} onClick={() => generateMagic("shorten")}>Shorten</Button>
                      <Button variant="outline" size="sm" disabled={busy} onClick={() => generateMagic("expand")}>Expand</Button>
                    </div>
                  )}

                  <div className="mt-4 flex justify-end">
                    <Button
                      onClick={() => generateMagic()}
                      disabled={busy || (!prompt.trim() && !lastSelection)}
                      className="bg-gradient-primary"
                    >
                      {busy ? (
                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Generating…</>
                      ) : (
                        <>Generate <ArrowRight className="w-4 h-4 ml-2" /></>
                      )}
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="max-h-[50vh] overflow-y-auto rounded-lg border border-border bg-muted/20 p-4 text-sm whitespace-pre-wrap leading-relaxed">
                    {generatedText}
                  </div>
                  <p className="mt-2 text-[11px] text-muted-foreground">
                    AI can make mistakes — please check for accuracy before inserting.
                  </p>

                  <div className="mt-4 flex flex-wrap items-center gap-2 justify-between">
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={busy}
                        onClick={() => generateMagic()}
                        title="Regenerate"
                      >
                        <RotateCw className="w-3.5 h-3.5 mr-1.5" />
                        Try again
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={copyGenerated}
                      >
                        <Copy className="w-3.5 h-3.5 mr-1.5" />
                        Copy
                      </Button>
                    </div>
                    <Button
                      onClick={insertGenerated}
                      className="bg-gradient-primary"
                    >
                      Insert into CV
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
