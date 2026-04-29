import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Upload, Loader2, Sparkles, ImageIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onCreated: () => void;
}

export const TemplateUploadDialog = ({ open, onOpenChange, onCreated }: Props) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [name, setName] = useState("My Template");
  const [busy, setBusy] = useState(false);
  const [step, setStep] = useState<"idle" | "uploading" | "generating">("idle");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (f: File) => {
    if (!f.type.startsWith("image/")) { toast.error("Please choose an image file"); return; }
    if (f.size > 10 * 1024 * 1024) { toast.error("Max file size: 10MB"); return; }
    setFile(f);
    const r = new FileReader();
    r.onload = () => setPreview(r.result as string);
    r.readAsDataURL(f);
  };

  const handleGenerate = async () => {
    if (!user) { toast.error("Please sign in first"); navigate("/auth"); return; }
    if (!file) { toast.error("Please select a screenshot"); return; }
    setBusy(true);
    try {
      // 1. Upload to storage
      setStep("uploading");
      const ext = file.name.split(".").pop() || "png";
      const path = `${user.id}/${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("template-screenshots").upload(path, file, { upsert: false, contentType: file.type });
      if (upErr) throw upErr;
      const { data: signed } = await supabase.storage.from("template-screenshots").createSignedUrl(path, 60 * 60);

      // 2. Generate template via AI
      setStep("generating");
      const { data, error } = await supabase.functions.invoke("generate-template", {
        body: { imageUrl: signed?.signedUrl || preview, name },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      if (!data?.html) throw new Error("AI did not return a template");

      // 3. Persist
      const { error: insErr } = await supabase.from("user_templates").insert({
        user_id: user.id, name, screenshot_url: path, html: data.html,
      });
      if (insErr) throw insErr;

      toast.success("Template created!");
      onCreated();
      onOpenChange(false);
      // Reset
      setFile(null); setPreview(""); setName("My Template");
    } catch (e: any) {
      toast.error(e.message || "Failed to create template");
    } finally {
      setBusy(false); setStep("idle");
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !busy && onOpenChange(v)}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" /> Create template from screenshot
          </DialogTitle>
          <DialogDescription>
            Upload a screenshot of any CV layout and AI will recreate it as a fully editable template.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="tplName">Template name</Label>
            <Input id="tplName" value={name} onChange={e => setName(e.target.value)} disabled={busy} />
          </div>

          <input ref={inputRef} type="file" accept="image/*" className="hidden"
            onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />

          {!preview ? (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="w-full border-2 border-dashed border-border rounded-xl p-8 text-center hover:bg-muted/40 transition-base"
              disabled={busy}
            >
              <ImageIcon className="w-10 h-10 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm font-medium">Click to upload a screenshot</p>
              <p className="text-xs text-muted-foreground mt-1">PNG, JPG, WEBP — max 10MB</p>
            </button>
          ) : (
            <div className="relative rounded-xl overflow-hidden border border-border">
              <img src={preview} alt="Template preview" className="w-full max-h-72 object-contain bg-muted" />
              <button
                onClick={() => { setFile(null); setPreview(""); }}
                disabled={busy}
                className="absolute top-2 right-2 text-xs bg-card/90 backdrop-blur px-2 py-1 rounded-md hover:bg-card"
              >Replace</button>
            </div>
          )}

          <Button onClick={handleGenerate} disabled={!file || busy} className="w-full bg-gradient-primary">
            {busy ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
            {step === "uploading" ? "Uploading screenshot…" : step === "generating" ? "AI is recreating the layout…" : "Generate template with AI"}
          </Button>

          {!user && (
            <p className="text-xs text-center text-muted-foreground">
              You'll be asked to <a href="/auth" className="text-primary hover:underline">sign in</a> to save your template.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
