import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload, Loader2, FileText } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { CVData, EMPTY_CV } from "@/lib/cv-types";
import { useAuth } from "@/hooks/useAuth";
import { LoginDialog } from "@/components/auth/LoginDialog";

interface Props {
  onExtracted: (data: CVData) => void;
}

export const AIUploader = ({ onExtracted }: Props) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState("");
  const [showLogin, setShowLogin] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file) return;
    if (!user) {
      setShowLogin(true);
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File too large. Max 10MB.");
      return;
    }
    setFileName(file.name);
    setLoading(true);
    try {
      // Try plain-text read first (works for .txt / .md and some .docx exports).
      const rawText = await file.text().catch(() => "");
      const looksLikeText =
        rawText &&
        rawText.length > 50 &&
        // Avoid sending binary garbage that happens to contain ascii bytes
        !/%PDF-/.test(rawText.slice(0, 8)) &&
        /[a-z]/i.test(rawText) &&
        // Mostly printable characters
        rawText.replace(/[\x20-\x7E\s]/g, "").length / rawText.length < 0.15;

      let payload: any = { fileName: file.name };
      if (looksLikeText) {
        payload.text = rawText.slice(0, 60000);
      } else {
        // Encode the WHOLE file as base64 in safe chunks (spread-into-fromCharCode
        // overflows the call stack for files >~100KB).
        const buf = new Uint8Array(await file.arrayBuffer());
        let binary = "";
        const CHUNK = 0x8000;
        for (let i = 0; i < buf.length; i += CHUNK) {
          binary += String.fromCharCode.apply(null, Array.from(buf.subarray(i, i + CHUNK)));
        }
        payload.fileBase64 = btoa(binary);
        payload.mimeType = file.type || (file.name.toLowerCase().endsWith(".pdf") ? "application/pdf" : "application/octet-stream");
      }

      const { data, error } = await supabase.functions.invoke("extract-cv", { body: payload });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      if (!data?.cv) throw new Error("No CV data returned");

      const merged: CVData = { ...EMPTY_CV, ...data.cv };
      onExtracted(merged);
      toast.success("CV extracted successfully!");
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || "Failed to extract CV");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border-2 border-dashed border-border rounded-xl p-6 text-center bg-muted/20 hover:bg-muted/40 transition-base">
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.doc,.docx,.txt,.md"
        className="hidden"
        onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
      />
      {loading ? (
        <div className="flex flex-col items-center gap-2 py-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Extracting from {fileName}…</p>
        </div>
      ) : (
        <>
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gradient-primary flex items-center justify-center shadow-glow">
            <FileText className="w-6 h-6 text-primary-foreground" />
          </div>
          <h3 className="font-semibold mb-1">Upload your existing CV</h3>
          <p className="text-xs text-muted-foreground mb-3">
            {user
              ? "PDF, DOCX, or TXT — AI will extract everything"
              : "Sign in to use AI extraction (PDF, DOCX, or TXT)"}
          </p>
          {user ? (
            <Button onClick={() => inputRef.current?.click()} variant="default" size="sm">
              <Upload className="w-4 h-4 mr-2" /> Choose file
            </Button>
          ) : (
            <Button onClick={() => setShowLogin(true)} variant="default" size="sm">
              Sign in to continue
            </Button>
          )}
        </>
      )}
      <LoginDialog open={showLogin} onOpenChange={setShowLogin} />
    </div>
  );
};
