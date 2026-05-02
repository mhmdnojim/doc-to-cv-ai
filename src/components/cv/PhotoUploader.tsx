import { useCallback, useRef, useState } from "react";
import Cropper, { Area } from "react-easy-crop";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Upload, Pencil, Trash2 } from "lucide-react";

interface Props {
  photo?: string;
  onChange?: (dataUrl: string | undefined) => void;
}

async function getCroppedDataUrl(src: string, area: Area, outSize = 400): Promise<string> {
  const img = await new Promise<HTMLImageElement>((res, rej) => {
    const i = new Image();
    i.crossOrigin = "anonymous";
    i.onload = () => res(i);
    i.onerror = rej;
    i.src = src;
  });
  const canvas = document.createElement("canvas");
  canvas.width = outSize;
  canvas.height = outSize;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, area.x, area.y, area.width, area.height, 0, 0, outSize, outSize);
  return canvas.toDataURL("image/jpeg", 0.9);
}

export const PhotoUploader = ({ photo, onChange }: Props) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [rawSrc, setRawSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedArea, setCroppedArea] = useState<Area | null>(null);

  const onCropComplete = useCallback((_: Area, areaPx: Area) => setCroppedArea(areaPx), []);

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => {
      setRawSrc(reader.result as string);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setEditorOpen(true);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!rawSrc || !croppedArea) return;
    const out = await getCroppedDataUrl(rawSrc, croppedArea);
    if (typeof onChange !== "function") {
      console.error("[PhotoUploader] onChange prop missing");
      return;
    }
    onChange(out);
    setEditorOpen(false);
    setRawSrc(null);
  };

  const openEditExisting = () => {
    if (!photo) return;
    setRawSrc(photo);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setEditorOpen(true);
  };

  return (
    <div>
      <Label>Photo</Label>
      <div className="flex items-center gap-3 mt-1.5">
        <div className="w-16 h-16 rounded-full bg-muted overflow-hidden border flex items-center justify-center shrink-0">
          {photo ? (
            <img src={photo} alt="CV" className="w-full h-full object-cover" />
          ) : (
            <Upload className="w-5 h-5 text-muted-foreground" />
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" size="sm" variant="outline" onClick={() => fileRef.current?.click()}>
            <Upload className="w-3.5 h-3.5 mr-1" /> {photo ? "Replace" : "Upload"}
          </Button>
          {photo && (
            <>
              <Button type="button" size="sm" variant="outline" onClick={openEditExisting}>
                <Pencil className="w-3.5 h-3.5 mr-1" /> Edit
              </Button>
              <Button type="button" size="sm" variant="ghost" onClick={() => onChange?.(undefined)}>
                <Trash2 className="w-3.5 h-3.5 mr-1" /> Remove
              </Button>
            </>
          )}
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={e => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
            e.target.value = "";
          }}
        />
      </div>
      <p className="text-xs text-muted-foreground mt-1.5">
        Used by templates with a photo slot. Crop & zoom to avoid clipping.
      </p>

      <Dialog open={editorOpen} onOpenChange={setEditorOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Adjust your photo</DialogTitle>
          </DialogHeader>
          <div className="relative w-full h-72 bg-muted rounded-md overflow-hidden">
            {rawSrc && (
              <Cropper
                image={rawSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            )}
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Zoom</Label>
            <Slider value={[zoom]} min={1} max={3} step={0.05} onValueChange={v => setZoom(v[0])} />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditorOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>Save photo</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
