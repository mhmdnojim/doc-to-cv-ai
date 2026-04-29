import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { ArrowDown, ArrowUp } from "lucide-react";
import type { SectionLocation, SectionInfo, NewSectionTemplate } from "@/lib/cv-section-tools";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  /** Available sections in the CV — refreshed each time dialog opens */
  sections: SectionInfo[];
  /** What kind of section is being added */
  defaultSpec: NewSectionTemplate;
  onConfirm: (where: SectionLocation, spec: NewSectionTemplate) => void;
}

export const SectionPositionDialog = ({ open, onOpenChange, sections, defaultSpec, onConfirm }: Props) => {
  const [mode, setMode] = useState<"end" | "start" | "after" | "before">("end");
  const [column, setColumn] = useState<"left" | "right">("right");
  const [sectionId, setSectionId] = useState<string>("");
  const [title, setTitle] = useState<string>(defaultSpec.title || "");

  useEffect(() => {
    if (!open) return;
    setMode("end");
    setColumn(sections.some(s => s.column === "left") ? "right" : "right");
    setSectionId(sections[0]?.id || "");
    setTitle(defaultSpec.title || "");
  }, [open, defaultSpec.title, sections]);

  const hasLeft = sections.some(s => s.column === "left");

  const submit = () => {
    let where: SectionLocation;
    if (mode === "after") where = { mode: "after", sectionId };
    else if (mode === "before") where = { mode: "before", sectionId };
    else where = { mode, column };
    onConfirm(where, { ...defaultSpec, title: title || defaultSpec.title });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Where to add this section?</DialogTitle>
          <DialogDescription>
            Pick exactly where the new <strong className="capitalize">{defaultSpec.type}</strong> section should go.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {defaultSpec.type === "custom" && (
            <div className="space-y-1.5">
              <Label htmlFor="title" className="text-xs">Section title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Certifications, Awards, Volunteering"
              />
            </div>
          )}

          <div className="space-y-1.5">
            <Label className="text-xs">Position</Label>
            <Select value={mode} onValueChange={(v) => setMode(v as any)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="end"><span className="flex items-center gap-2"><ArrowDown className="w-3 h-3" />At the end of a column</span></SelectItem>
                <SelectItem value="start"><span className="flex items-center gap-2"><ArrowUp className="w-3 h-3" />At the start of a column</span></SelectItem>
                {sections.length > 0 && <SelectItem value="after">After an existing section</SelectItem>}
                {sections.length > 0 && <SelectItem value="before">Before an existing section</SelectItem>}
              </SelectContent>
            </Select>
          </div>

          {(mode === "start" || mode === "end") && hasLeft && (
            <div className="space-y-1.5">
              <Label className="text-xs">Column</Label>
              <Select value={column} onValueChange={(v) => setColumn(v as "left" | "right")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">Left sidebar</SelectItem>
                  <SelectItem value="right">Main area (right)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {(mode === "after" || mode === "before") && (
            <div className="space-y-1.5">
              <Label className="text-xs">Reference section</Label>
              <Select value={sectionId} onValueChange={setSectionId}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {sections.map(s => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.title} <span className="opacity-60">({s.column})</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={submit}>Insert section</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
