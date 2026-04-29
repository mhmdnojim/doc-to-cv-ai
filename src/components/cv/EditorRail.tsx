import { useState, useRef, useEffect } from "react";
import { LayoutTemplate, Type, Sparkles, X, Bold, Italic, Underline, Loader2, Wand2, Minus, Plus, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type RailKey = "templates" | "text" | "magic";

interface Props {
  /** Provided panel content for templates (existing UI) */
  templatesPanel: React.ReactNode;
  /** Reference to the contenteditable element so we can apply formatting / selection edits */
  editorRef: React.RefObject<HTMLDivElement>;
}

const RAIL_ITEMS: { key: RailKey; label: string; icon: any }[] = [
  { key: "templates", label: "Templates", icon: LayoutTemplate },
  { key: "text",      label: "Text",      icon: Type },
  { key: "magic",     label: "Magic Write", icon: Sparkles },
];

const MIN_FONT = 8;
const MAX_FONT = 72;

export const EditorRail = ({ templatesPanel, editorRef }: Props) => {
  const [active, setActive] = useState<RailKey | null>("templates");

  // Magic Write state
  const [prompt, setPrompt] = useState("");
  const [busy, setBusy] = useState(false);
  const [lastSelection, setLastSelection] = useState("");
  const savedRange = useRef<Range | null>(null);

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

  const runMagic = async (mode?: "improve" | "shorten" | "expand") => {
    const selection = lastSelection.trim();
    if (!selection && !prompt.trim()) {
      toast.error("Select text in the CV or type a prompt");
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

      if (selection && savedRange.current) {
        // Replace the selected text in the editor
        restoreSelection();
        document.execCommand("insertText", false, text);
      } else {
        // No selection — copy to clipboard
        await navigator.clipboard.writeText(text);
        toast.success("AI text copied to clipboard");
      }
      setPrompt("");
    } catch (e: any) {
      toast.error(e.message || "Magic Write failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex print:hidden">
      {/* Vertical icon rail */}
      <div className="w-16 shrink-0 bg-card border-r border-border flex flex-col items-center py-3 gap-1 lg:sticky lg:top-16 lg:self-start lg:max-h-[calc(100vh-4rem)]">
        {RAIL_ITEMS.map(item => {
          const Icon = item.icon;
          const isActive = active === item.key;
          return (
            <button
              key={item.key}
              onClick={() => setActive(isActive ? null : item.key)}
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
        <div className="w-[300px] shrink-0 bg-card border-r border-border lg:sticky lg:top-16 lg:self-start lg:max-h-[calc(100vh-4rem)] overflow-y-auto">
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

            {active === "text" && (
              <div className="space-y-4">
                <p className="text-xs text-muted-foreground">
                  Select text in the CV, then format it here.
                </p>

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
                  <label className="text-[11px] uppercase tracking-wide text-muted-foreground font-semibold">Font size</label>
                  <div className="mt-1.5 grid grid-cols-4 gap-1.5">
                    {FONT_SIZES.map(sz => (
                      <button
                        key={sz}
                        onClick={() => setFontSize(sz)}
                        className="text-xs py-1.5 rounded border border-border hover:border-primary hover:text-primary transition-base"
                      >
                        {sz}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[11px] uppercase tracking-wide text-muted-foreground font-semibold">Quick adjust</label>
                  <div className="mt-1.5 flex gap-1">
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => {
                      const sel = window.getSelection();
                      if (!sel || sel.isCollapsed) { toast.info("Select some text first"); return; }
                      // Read current size from the focus node and step down
                      const node = sel.anchorNode?.parentElement;
                      const cur = parseInt(window.getComputedStyle(node!).fontSize) || 14;
                      setFontSize(Math.max(8, cur - 1));
                    }}><Minus className="w-3.5 h-3.5" /></Button>
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => {
                      const sel = window.getSelection();
                      if (!sel || sel.isCollapsed) { toast.info("Select some text first"); return; }
                      const node = sel.anchorNode?.parentElement;
                      const cur = parseInt(window.getComputedStyle(node!).fontSize) || 14;
                      setFontSize(Math.min(96, cur + 1));
                    }}><Plus className="w-3.5 h-3.5" /></Button>
                  </div>
                </div>

                {lastSelection && (
                  <div className="text-[11px] text-muted-foreground p-2 rounded bg-muted/40 border border-border">
                    <span className="font-semibold text-foreground">Selected:</span> {lastSelection.slice(0, 80)}{lastSelection.length > 80 ? "…" : ""}
                  </div>
                )}
              </div>
            )}

            {active === "magic" && (
              <div className="space-y-3">
                <div className="rounded-lg p-3 bg-gradient-to-br from-violet-50 to-cyan-50 border border-primary/20">
                  <div className="flex items-center gap-2 mb-1">
                    <Wand2 className="w-4 h-4 text-primary" />
                    <span className="font-semibold text-sm">Magic Write</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Select text in your CV and ask AI to rewrite, shorten, expand, or follow your instruction.
                  </p>
                </div>

                {lastSelection ? (
                  <div className="text-[11px] p-2 rounded bg-muted/40 border border-border">
                    <span className="font-semibold">Selected:</span> {lastSelection.slice(0, 100)}{lastSelection.length > 100 ? "…" : ""}
                  </div>
                ) : (
                  <p className="text-[11px] text-muted-foreground italic">No selection — AI output will be copied to clipboard.</p>
                )}

                <div className="grid grid-cols-3 gap-1.5">
                  <Button variant="outline" size="sm" disabled={busy || !lastSelection} onClick={() => runMagic("improve")}>Improve</Button>
                  <Button variant="outline" size="sm" disabled={busy || !lastSelection} onClick={() => runMagic("shorten")}>Shorten</Button>
                  <Button variant="outline" size="sm" disabled={busy || !lastSelection} onClick={() => runMagic("expand")}>Expand</Button>
                </div>

                <div>
                  <label className="text-[11px] uppercase tracking-wide text-muted-foreground font-semibold">Or describe what you want</label>
                  <Textarea
                    value={prompt}
                    onChange={e => setPrompt(e.target.value)}
                    placeholder="e.g. Make it sound more senior, add metrics…"
                    rows={4}
                    className="mt-1.5 text-sm"
                    disabled={busy}
                  />
                </div>

                <Button
                  onClick={() => runMagic()}
                  disabled={busy || (!prompt.trim() && !lastSelection)}
                  className="w-full bg-gradient-primary"
                >
                  {busy ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                  {busy ? "Writing…" : lastSelection ? "Rewrite selection" : "Generate text"}
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
