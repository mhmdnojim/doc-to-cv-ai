import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Upload, Loader2, Sparkles, ImageIcon, Check, ClipboardPaste, Eye, Pencil, RotateCcw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { UserTemplatePreview } from "./UserTemplatePreview";
import { SAMPLE_CV } from "@/lib/cv-types";

interface ExistingTemplate { id: string; name: string; html: string; }

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onCreated: () => void;
  /** When provided, the dialog edits this template instead of creating a new one. */
  editing?: ExistingTemplate | null;
}

type Step = "idle" | "uploading" | "extracting" | "generating" | "ready";

const STEPS: { key: Step; label: string }[] = [
  { key: "uploading", label: "Uploading screenshot" },
  { key: "extracting", label: "Analyzing layout & fields" },
  { key: "generating", label: "Generating template HTML" },
];

export const TemplateUploadDialog = ({ open, onOpenChange, onCreated, editing }: Props) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isEdit = !!editing;

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [name, setName] = useState(editing?.name || "My Template");
  const [busy, setBusy] = useState(false);
  const [step, setStep] = useState<Step>("idle");
  const [generatedHtml, setGeneratedHtml] = useState<string>("");
  const [view, setView] = useState<"upload" | "preview">("upload");
  const inputRef = useRef<HTMLInputElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);

  // Reset state when reopened or when switching between edit/new
  useEffect(() => {
    if (open) {
      setFile(null);
      setPreview("");
      setName(editing?.name || "My Template");
      setBusy(false);
      setStep("idle");
      setGeneratedHtml("");
      setView("upload");
    }
  }, [open, editing?.id]);

  const handleFile = (f: File) => {
    if (!f.type.startsWith("image/")) { toast.error("Please choose an image file"); return; }
    if (f.size > 10 * 1024 * 1024) { toast.error("Max file size: 10MB"); return; }
    setFile(f);
    const r = new FileReader();
    r.onload = () => setPreview(r.result as string);
    r.readAsDataURL(f);
  };

  // Drag & drop
  useEffect(() => {
    const el = dropRef.current;
    if (!el || !open) return;
    const onOver = (e: DragEvent) => { e.preventDefault(); el.classList.add("ring-2", "ring-primary"); };
    const onLeave = () => el.classList.remove("ring-2", "ring-primary");
    const onDrop = (e: DragEvent) => {
      e.preventDefault();
      el.classList.remove("ring-2", "ring-primary");
      const f = e.dataTransfer?.files?.[0];
      if (f) handleFile(f);
    };
    el.addEventListener("dragover", onOver);
    el.addEventListener("dragleave", onLeave);
    el.addEventListener("drop", onDrop);
    return () => {
      el.removeEventListener("dragover", onOver);
      el.removeEventListener("dragleave", onLeave);
      el.removeEventListener("drop", onDrop);
    };
  }, [open, view]);

  // Clipboard paste anywhere while dialog is open
  useEffect(() => {
    if (!open) return;
    const onPaste = (e: ClipboardEvent) => {
      if (busy) return;
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const it of items) {
        if (it.type.startsWith("image/")) {
          const f = it.getAsFile();
          if (f) {
            handleFile(f);
            toast.success("Image pasted from clipboard");
            e.preventDefault();
            break;
          }
        }
      }
    };
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [open, busy]);

  const pasteFromClipboard = async () => {
    try {
      const items = await (navigator.clipboard as any).read?.();
      if (!items) { toast.info("Press Ctrl/Cmd + V to paste"); return; }
      for (const item of items) {
        const type = item.types.find((t: string) => t.startsWith("image/"));
        if (type) {
          const blob = await item.getType(type);
          handleFile(new File([blob], "pasted.png", { type }));
          toast.success("Image pasted");
          return;
        }
      }
      toast.info("No image in clipboard");
    } catch {
      toast.info("Press Ctrl/Cmd + V to paste an image");
    }
  };

  const handleGenerate = async () => {
    if (!user) { toast.error("Please sign in first"); navigate("/auth"); return; }
    if (!file) { toast.error("Please add a screenshot"); return; }
    setBusy(true);
    setGeneratedHtml("");
    try {
      // 1. Upload to storage
      setStep("uploading");
      const ext = (file.name.split(".").pop() || "png").toLowerCase();
      const path = `${user.id}/${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("template-screenshots").upload(path, file, { upsert: false, contentType: file.type });
      if (upErr) throw upErr;
      const { data: signed } = await supabase.storage.from("template-screenshots").createSignedUrl(path, 60 * 60);

      // 2. AI analyzes layout
      setStep("extracting");
      await new Promise(r => setTimeout(r, 400)); // brief beat so the user sees the step

      // 3. AI generates HTML
      setStep("generating");
      const { data, error } = await supabase.functions.invoke("generate-template", {
        body: { imageUrl: signed?.signedUrl || preview, name },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      if (!data?.html) throw new Error("AI did not return a template");

      setGeneratedHtml(data.html);
      // Store path on the file ref for later persistence
      (file as any)._uploadedPath = path;
      setStep("ready");
      setView("preview");
    } catch (e: any) {
      toast.error(e.message || "Failed to generate template");
      setStep("idle");
    } finally {
      setBusy(false);
    }
  };

  const handleConfirmSave = async () => {
    if (!user || !generatedHtml) return;
    setBusy(true);
    try {
      const path = file ? (file as any)._uploadedPath : null;
      if (isEdit && editing) {
        const update: { html: string; name: string; updated_at: string; screenshot_url?: string } = {
          html: generatedHtml, name, updated_at: new Date().toISOString(),
        };
        if (path) update.screenshot_url = path;
        const { error } = await supabase.from("user_templates").update(update).eq("id", editing.id);
        if (error) throw error;
        toast.success("Template updated");
      } else {
        const { error } = await supabase.from("user_templates").insert({
          user_id: user.id, name, screenshot_url: path, html: generatedHtml,
        });
        if (error) throw error;
        toast.success("Template created");
      }
      onCreated();
      onOpenChange(false);
    } catch (e: any) {
      toast.error(e.message || "Failed to save template");
    } finally {
      setBusy(false);
    }
  };

  const currentStepIndex = STEPS.findIndex(s => s.key === step);

  return (
    <Dialog open={open} onOpenChange={(v) => !busy && onOpenChange(v)}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            {isEdit ? `Replace screenshot — ${editing?.name}` : "Create template from screenshot"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Upload, paste, or drop a new screenshot. AI will regenerate this template in place."
              : "Upload, paste, or drop a screenshot of any CV layout — AI will recreate it as an editable template."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Name */}
          <div>
            <Label htmlFor="tplName">Template name</Label>
            <Input id="tplName" value={name} onChange={e => setName(e.target.value)} disabled={busy} />
          </div>

          {/* Upload zone */}
          {view === "upload" && (
            <>
              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
              />

              {!preview ? (
                <div
                  ref={dropRef}
                  className="w-full border-2 border-dashed border-border rounded-xl p-8 text-center transition-base"
                >
                  <ImageIcon className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                  <p className="text-sm font-medium">Drop a screenshot here</p>
                  <p className="text-xs text-muted-foreground mt-1">or paste with Ctrl/Cmd + V — PNG, JPG, WEBP up to 10MB</p>
                  <div className="flex justify-center gap-2 mt-4">
                    <Button type="button" variant="outline" size="sm" onClick={() => inputRef.current?.click()} disabled={busy}>
                      <Upload className="w-4 h-4 mr-1.5" /> Choose file
                    </Button>
                    <Button type="button" variant="outline" size="sm" onClick={pasteFromClipboard} disabled={busy}>
                      <ClipboardPaste className="w-4 h-4 mr-1.5" /> Paste from clipboard
                    </Button>
                  </div>
                  {isEdit && editing?.html && (
                    <p className="text-[11px] text-muted-foreground mt-3">Tip: leave this empty and close to keep the existing template unchanged.</p>
                  )}
                </div>
              ) : (
                <div ref={dropRef} className="relative rounded-xl overflow-hidden border border-border">
                  <img src={preview} alt="Template preview" className="w-full max-h-72 object-contain bg-muted" />
                  <button
                    onClick={() => { setFile(null); setPreview(""); }}
                    disabled={busy}
                    className="absolute top-2 right-2 text-xs bg-card/90 backdrop-blur px-2 py-1 rounded-md hover:bg-card flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" /> Replace
                  </button>
                </div>
              )}

              {/* Stepper */}
              {(busy || step !== "idle") && step !== "ready" && (
                <div className="rounded-xl border border-border bg-muted/30 p-4">
                  <ol className="space-y-2">
                    {STEPS.map((s, i) => {
                      const done = i < currentStepIndex;
                      const active = i === currentStepIndex;
                      return (
                        <li key={s.key} className="flex items-center gap-3">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 ${
                            done ? "bg-primary text-primary-foreground"
                            : active ? "bg-primary/20 text-primary"
                            : "bg-muted text-muted-foreground"
                          }`}>
                            {done ? <Check className="w-3.5 h-3.5" /> : active ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : i + 1}
                          </div>
                          <span className={`text-sm ${active ? "font-medium text-foreground" : done ? "text-muted-foreground line-through" : "text-muted-foreground"}`}>
                            {s.label}
                          </span>
                        </li>
                      );
                    })}
                  </ol>
                </div>
              )}

              <Button onClick={handleGenerate} disabled={!file || busy} className="w-full bg-gradient-primary">
                {busy ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                {busy ? "Working…" : isEdit ? "Regenerate template with AI" : "Generate template with AI"}
              </Button>

              {!user && (
                <p className="text-xs text-center text-muted-foreground">
                  You'll need to <a href="/auth" className="text-primary hover:underline">sign in</a> to save the template.
                </p>
              )}
            </>
          )}

          {/* Live preview & confirm */}
          {view === "preview" && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-primary">
                <Check className="w-4 h-4" /> Template generated — review the live preview below before saving.
              </div>
              <div className="rounded-xl border border-border bg-muted/40 p-4 max-h-[55vh] overflow-auto">
                <div className="origin-top-left scale-[0.55] sm:scale-[0.65] inline-block">
                  <UserTemplatePreview html={generatedHtml} data={SAMPLE_CV} />
                </div>
              </div>
              <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
                <Button variant="outline" onClick={() => setView("upload")} disabled={busy}>
                  <Pencil className="w-4 h-4 mr-1.5" /> Try another screenshot
                </Button>
                <Button onClick={handleConfirmSave} disabled={busy} className="bg-gradient-primary">
                  {busy ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Check className="w-4 h-4 mr-2" />}
                  {isEdit ? "Save changes" : "Save to My templates"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
