import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  ImageRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
} from "docx";
import { saveAs } from "file-saver";

/* =========================================================================
 * A4 constants
 * ====================================================================== */
const A4_W_MM = 210;
const A4_H_MM = 297;

/* =========================================================================
 * DOM helpers
 * ====================================================================== */
function stripControls(root: HTMLElement) {
  root
    .querySelectorAll("[data-add-btn], [data-section-ctrl], [data-cv-tool]")
    .forEach((el) => el.remove());
  root.querySelectorAll<HTMLElement>("[contenteditable]").forEach((el) => {
    el.removeAttribute("contenteditable");
  });
}

const STYLE_PROPS = [
  "color","background","background-color","background-image","background-size","background-position","background-repeat",
  "font-family","font-size","font-weight","font-style","font-variant","line-height","letter-spacing","text-align","text-transform","text-decoration","white-space","word-break","overflow-wrap",
  "display","flex","flex-direction","flex-wrap","align-items","justify-content","gap","grid-template-columns","grid-template-rows","grid-column","grid-row","grid-auto-rows","grid-auto-flow",
  "width","height","min-width","min-height","max-width","max-height",
  "margin","margin-top","margin-right","margin-bottom","margin-left",
  "padding","padding-top","padding-right","padding-bottom","padding-left",
  "border","border-top","border-right","border-bottom","border-left","border-radius","border-color","border-width","border-style",
  "box-shadow","opacity","overflow","position","top","right","bottom","left","z-index","transform","transform-origin","object-fit","object-position",
  "list-style","list-style-type","list-style-position",
];

function inlineComputedStyles(source: HTMLElement, target: HTMLElement) {
  const srcAll = source.querySelectorAll<HTMLElement>("*");
  const tgtAll = target.querySelectorAll<HTMLElement>("*");
  const apply = (s: HTMLElement, t: HTMLElement) => {
    const cs = window.getComputedStyle(s);
    let css = "";
    for (const p of STYLE_PROPS) {
      const v = cs.getPropertyValue(p);
      if (v) css += `${p}:${v};`;
    }
    t.setAttribute("style", css + (t.getAttribute("style") || ""));
  };
  apply(source, target);
  for (let i = 0; i < srcAll.length && i < tgtAll.length; i++) apply(srcAll[i], tgtAll[i]);
}

/* =========================================================================
 * Font embedding
 *
 * Walks the document's stylesheets, collects every @font-face rule, fetches
 * the underlying font file, and returns CSS where each src is a base64
 * data: URI. This produces self-contained HTML/PDF that renders the same
 * fonts the user sees in the preview, including custom uploads.
 * ====================================================================== */

const fontCache = new Map<string, string>();

async function fetchAsDataUri(url: string): Promise<string | null> {
  if (fontCache.has(url)) return fontCache.get(url)!;
  try {
    const res = await fetch(url, { mode: "cors", credentials: "omit" });
    if (!res.ok) return null;
    const blob = await res.blob();
    const dataUri = await new Promise<string>((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result as string);
      r.onerror = () => reject(r.error);
      r.readAsDataURL(blob);
    });
    fontCache.set(url, dataUri);
    return dataUri;
  } catch {
    return null;
  }
}

function isFontFaceRule(r: CSSRule): r is CSSFontFaceRule {
  return r.type === CSSRule.FONT_FACE_RULE;
}

async function inlineFontFaceRule(rule: CSSFontFaceRule, baseHref: string): Promise<string> {
  const cssText = rule.cssText;
  // Replace each url(...) with a data: URI when fetchable
  const urlRegex = /url\(\s*(['"]?)([^'")]+)\1\s*\)/g;
  const matches = Array.from(cssText.matchAll(urlRegex));
  let result = cssText;
  for (const m of matches) {
    const raw = m[2];
    if (raw.startsWith("data:")) continue;
    let abs: string;
    try {
      abs = new URL(raw, baseHref).href;
    } catch {
      continue;
    }
    const dataUri = await fetchAsDataUri(abs);
    if (dataUri) {
      result = result.replace(m[0], `url(${dataUri})`);
    }
  }
  return result;
}

/** Collect every @font-face rule from the document with embedded sources. */
async function collectEmbeddedFontCss(): Promise<string> {
  const out: string[] = [];
  for (const sheet of Array.from(document.styleSheets)) {
    let rules: CSSRuleList | null = null;
    try {
      rules = sheet.cssRules;
    } catch {
      // cross-origin sheet — try to refetch and parse
      const href = (sheet as CSSStyleSheet).href;
      if (!href) continue;
      try {
        const res = await fetch(href, { mode: "cors" });
        if (!res.ok) continue;
        const text = await res.text();
        const ffRegex = /@font-face\s*\{[^}]*\}/g;
        const found = text.match(ffRegex) || [];
        for (const block of found) {
          const urlRegex = /url\(\s*(['"]?)([^'")]+)\1\s*\)/g;
          let inlined = block;
          const ms = Array.from(block.matchAll(urlRegex));
          for (const m of ms) {
            const raw = m[2];
            if (raw.startsWith("data:")) continue;
            try {
              const abs = new URL(raw, href).href;
              const data = await fetchAsDataUri(abs);
              if (data) inlined = inlined.replace(m[0], `url(${data})`);
            } catch { /* noop */ }
          }
          out.push(inlined);
        }
      } catch { /* noop */ }
      continue;
    }
    if (!rules) continue;
    for (const rule of Array.from(rules)) {
      if (isFontFaceRule(rule)) {
        const baseHref = (sheet as CSSStyleSheet).href || window.location.href;
        out.push(await inlineFontFaceRule(rule, baseHref));
      }
    }
  }
  return out.join("\n");
}

/* =========================================================================
 * Standalone HTML
 * ====================================================================== */

export async function buildStandaloneHtml(source: HTMLElement, title: string): Promise<string> {
  // Make sure web fonts are ready before snapshotting computed styles
  if ((document as any).fonts?.ready) await (document as any).fonts.ready;

  const clone = source.cloneNode(true) as HTMLElement;
  stripControls(clone);
  inlineComputedStyles(source, clone);

  const cs = window.getComputedStyle(source);
  const wrapStyle =
    `width:${A4_W_MM}mm;min-height:${A4_H_MM}mm;margin:0 auto;background:#fff;` +
    `color:${cs.color};font-family:${cs.fontFamily};`;

  const fontCss = await collectEmbeddedFontCss();

  return `<!doctype html><html lang="en"><head>
<meta charset="utf-8">
<title>${escapeHtml(title)}</title>
<style>
@page { size: A4; margin: 0; }
html,body{margin:0;padding:0;background:#fff;}
*{box-sizing:border-box;}
img{max-width:100%;}
${fontCss}
</style></head>
<body><div style="${wrapStyle}">${clone.outerHTML}</div></body></html>`;
}

export async function exportToHtml(source: HTMLElement, filename: string) {
  const html = await buildStandaloneHtml(source, filename);
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  saveAs(blob, filename.endsWith(".html") ? filename : `${filename}.html`);
}

/* =========================================================================
 * PDF (multi-page A4, pixel-accurate via html2canvas)
 * ====================================================================== */

export async function exportToPdf(source: HTMLElement, filename: string) {
  if ((document as any).fonts?.ready) await (document as any).fonts.ready;

  const clone = source.cloneNode(true) as HTMLElement;
  stripControls(clone);

  const holder = document.createElement("div");
  holder.style.cssText = `position:fixed;left:-10000px;top:0;width:${source.offsetWidth}px;background:#fff;`;
  // Re-inject embedded fonts into the offscreen clone so html2canvas paints them
  const fontStyle = document.createElement("style");
  fontStyle.textContent = await collectEmbeddedFontCss();
  holder.appendChild(fontStyle);
  holder.appendChild(clone);
  document.body.appendChild(holder);

  try {
    if ((document as any).fonts?.ready) await (document as any).fonts.ready;
    await Promise.all(
      Array.from(clone.querySelectorAll("img")).map((img) =>
        (img as HTMLImageElement).complete
          ? Promise.resolve()
          : new Promise<void>((res) => {
              img.addEventListener("load", () => res(), { once: true });
              img.addEventListener("error", () => res(), { once: true });
            })
      )
    );

    const canvas = await html2canvas(clone, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
      logging: false,
      windowWidth: source.scrollWidth,
    });

    const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
    const imgWmm = A4_W_MM;
    const pxPerMm = canvas.width / imgWmm;
    const pageHpx = A4_H_MM * pxPerMm;

    let y = 0;
    let pageIndex = 0;
    while (y < canvas.height) {
      const sliceH = Math.min(pageHpx, canvas.height - y);
      const pageCanvas = document.createElement("canvas");
      pageCanvas.width = canvas.width;
      pageCanvas.height = sliceH;
      const ctx = pageCanvas.getContext("2d")!;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
      ctx.drawImage(canvas, 0, y, canvas.width, sliceH, 0, 0, canvas.width, sliceH);
      const imgData = pageCanvas.toDataURL("image/jpeg", 0.95);
      if (pageIndex > 0) pdf.addPage();
      pdf.addImage(imgData, "JPEG", 0, 0, imgWmm, sliceH / pxPerMm);
      y += sliceH;
      pageIndex++;
    }
    pdf.save(filename.endsWith(".pdf") ? filename : `${filename}.pdf`);
  } finally {
    document.body.removeChild(holder);
  }
}

/* =========================================================================
 * DOCX export (real Office Open XML)
 *
 * Walks the live preview DOM and converts headings, paragraphs, lists, and
 * images into docx primitives that preserve typography (font, size, weight,
 * color, alignment) so the file opens cleanly in Word/Google Docs.
 * ====================================================================== */

function pxToHalfPt(px: number): number {
  // 1pt = 1.333px → halfPt = (px / 1.333) * 2 = px * 1.5
  return Math.max(2, Math.round(px * 1.5));
}

function rgbToHex(rgb: string): string | undefined {
  const m = rgb.match(/rgba?\(([^)]+)\)/);
  if (!m) return undefined;
  const [r, g, b] = m[1].split(",").map((s) => parseInt(s.trim(), 10));
  if ([r, g, b].some((n) => Number.isNaN(n))) return undefined;
  return [r, g, b].map((n) => n.toString(16).padStart(2, "0")).join("").toUpperCase();
}

function firstFontFamily(ff: string): string {
  return (ff || "").split(",")[0].replace(/['"]/g, "").trim() || "Calibri";
}

interface RunStyle {
  bold?: boolean;
  italic?: boolean;
  underline?: { type?: "single" } | undefined;
  size?: number;
  color?: string;
  font?: string;
}

function getRunStyle(el: HTMLElement): RunStyle {
  const cs = window.getComputedStyle(el);
  return {
    bold: parseInt(cs.fontWeight, 10) >= 600 || cs.fontWeight === "bold",
    italic: cs.fontStyle === "italic",
    underline: cs.textDecorationLine.includes("underline") ? {} : undefined,
    size: pxToHalfPt(parseFloat(cs.fontSize) || 14),
    color: rgbToHex(cs.color),
    font: firstFontFamily(cs.fontFamily),
  };
}

function nodeToRuns(node: Node, inherited: RunStyle): TextRun[] {
  const out: TextRun[] = [];
  if (node.nodeType === Node.TEXT_NODE) {
    const text = node.textContent || "";
    if (text.trim() === "") return out;
    out.push(new TextRun({ text, ...inherited }));
    return out;
  }
  if (node.nodeType !== Node.ELEMENT_NODE) return out;
  const el = node as HTMLElement;
  if (el.dataset.cvTool || el.dataset.addBtn || el.dataset.sectionCtrl) return out;
  const style: RunStyle = { ...inherited, ...getRunStyle(el) };
  if (el.tagName === "BR") {
    out.push(new TextRun({ text: "", break: 1 }));
    return out;
  }
  for (const child of Array.from(el.childNodes)) {
    out.push(...nodeToRuns(child, style));
  }
  return out;
}

function alignmentFor(el: HTMLElement): (typeof AlignmentType)[keyof typeof AlignmentType] | undefined {
  const ta = window.getComputedStyle(el).textAlign;
  if (ta === "center") return AlignmentType.CENTER;
  if (ta === "right") return AlignmentType.RIGHT;
  if (ta === "justify") return AlignmentType.JUSTIFIED;
  return AlignmentType.LEFT;
}

function headingLevelFor(tag: string): (typeof HeadingLevel)[keyof typeof HeadingLevel] | undefined {
  switch (tag) {
    case "H1": return HeadingLevel.HEADING_1;
    case "H2": return HeadingLevel.HEADING_2;
    case "H3": return HeadingLevel.HEADING_3;
    case "H4": return HeadingLevel.HEADING_4;
    case "H5": return HeadingLevel.HEADING_5;
    case "H6": return HeadingLevel.HEADING_6;
    default: return undefined;
  }
}

async function imageToBuffer(src: string): Promise<{ buffer: ArrayBuffer; type: "png" | "jpg" | "gif" } | null> {
  try {
    const res = await fetch(src, { mode: "cors" });
    if (!res.ok) return null;
    const blob = await res.blob();
    const buffer = await blob.arrayBuffer();
    let type: "png" | "jpg" | "gif" = "png";
    if (blob.type.includes("jpeg") || blob.type.includes("jpg")) type = "jpg";
    else if (blob.type.includes("gif")) type = "gif";
    return { buffer, type };
  } catch {
    return null;
  }
}

async function walk(el: HTMLElement, blocks: Array<Paragraph | Table>) {
  if (el.dataset.cvTool || el.dataset.addBtn || el.dataset.sectionCtrl) return;

  const tag = el.tagName;

  // Image
  if (tag === "IMG") {
    const src = (el as HTMLImageElement).src;
    const img = await imageToBuffer(src);
    if (img) {
      const w = Math.min(500, (el as HTMLImageElement).width || 200);
      const h = Math.min(500, (el as HTMLImageElement).height || 200);
      blocks.push(
        new Paragraph({
          alignment: alignmentFor(el),
          children: [
            new ImageRun({
              type: img.type as any,
              data: img.buffer,
              transformation: { width: w, height: h },
            } as any),
          ],
        })
      );
    }
    return;
  }

  // List
  if (tag === "UL" || tag === "OL") {
    const items = Array.from(el.children).filter((c) => c.tagName === "LI") as HTMLElement[];
    for (const li of items) {
      const runs = nodeToRuns(li, getRunStyle(li));
      if (runs.length === 0) runs.push(new TextRun({ text: "" }));
      blocks.push(
        new Paragraph({
          children: runs,
          bullet: tag === "UL" ? { level: 0 } : undefined,
          numbering: tag === "OL" ? { reference: "ordered-list", level: 0 } : undefined,
          alignment: alignmentFor(li),
        })
      );
    }
    return;
  }

  // Heading or paragraph-like leaf
  const isLeafBlock =
    /^(H[1-6]|P)$/.test(tag) ||
    (tag === "DIV" &&
      Array.from(el.children).every(
        (c) => !["DIV", "SECTION", "ARTICLE", "UL", "OL", "TABLE", "HEADER", "FOOTER", "MAIN", "ASIDE"].includes(c.tagName)
      ));

  if (isLeafBlock) {
    const text = (el.textContent || "").trim();
    if (!text && !el.querySelector("img")) return;
    const runs = nodeToRuns(el, getRunStyle(el));
    if (runs.length === 0) return;
    blocks.push(
      new Paragraph({
        children: runs,
        heading: headingLevelFor(tag),
        alignment: alignmentFor(el),
        spacing: { after: 120 },
      })
    );
    return;
  }

  // Container — recurse
  for (const child of Array.from(el.children)) {
    await walk(child as HTMLElement, blocks);
  }
}

export async function exportToDocx(source: HTMLElement, filename: string) {
  if ((document as any).fonts?.ready) await (document as any).fonts.ready;

  const clone = source.cloneNode(true) as HTMLElement;
  stripControls(clone);
  // Mount offscreen so getComputedStyle returns real values
  const holder = document.createElement("div");
  holder.style.cssText = `position:fixed;left:-10000px;top:0;width:${source.offsetWidth}px;background:#fff;`;
  holder.appendChild(clone);
  document.body.appendChild(holder);

  try {
    const blocks: Array<Paragraph | Table> = [];
    await walk(clone, blocks);
    if (blocks.length === 0) blocks.push(new Paragraph({ children: [new TextRun({ text: "" })] }));

    const doc = new Document({
      numbering: {
        config: [
          {
            reference: "ordered-list",
            levels: [
              {
                level: 0,
                format: "decimal" as any,
                text: "%1.",
                alignment: AlignmentType.LEFT,
                style: { paragraph: { indent: { left: 720, hanging: 360 } } },
              },
            ],
          },
        ],
      },
      sections: [
        {
          properties: {
            page: {
              size: { width: 11906, height: 16838 }, // A4 in DXA
              margin: { top: 1080, right: 1080, bottom: 1080, left: 1080 },
            },
          },
          children: blocks,
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, filename.endsWith(".docx") ? filename : `${filename}.docx`);
  } finally {
    document.body.removeChild(holder);
  }
}

/* =========================================================================
 * Utilities
 * ====================================================================== */
function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}
