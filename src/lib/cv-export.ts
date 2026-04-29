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
  LevelFormat,
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

/* Asset embedding & validation ----------------------------------------- */
export interface ExportWarning {
  kind: "font" | "image";
  url: string;
  reason: string;
  fix: string;
}

const fontCache = new Map<string, string>();

async function fetchAsDataUri(
  url: string,
  warnings?: ExportWarning[],
  kind: "font" | "image" = "font"
): Promise<string | null> {
  if (fontCache.has(url)) return fontCache.get(url)!;
  try {
    const res = await fetch(url, { mode: "cors", credentials: "omit" });
    if (!res.ok) {
      warnings?.push({
        kind,
        url,
        reason: `HTTP ${res.status} when fetching the asset`,
        fix:
          kind === "font"
            ? "Self-host the font on the same origin as the app, or use a CDN that returns CORS headers (e.g. Google Fonts)."
            : "Re-upload the image to your project so it's served from the same origin.",
      });
      return null;
    }
    const blob = await res.blob();
    const dataUri = await new Promise<string>((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result as string);
      r.onerror = () => reject(r.error);
      r.readAsDataURL(blob);
    });
    fontCache.set(url, dataUri);
    return dataUri;
  } catch (e) {
    warnings?.push({
      kind,
      url,
      reason: "Blocked by browser (likely missing CORS headers on the asset)",
      fix:
        kind === "font"
          ? "Move the font to your own origin, or pick a font host that sends Access-Control-Allow-Origin: *."
          : "Re-upload the image so it's served from the same origin (CORS-safe).",
    });
    return null;
  }
}

function isFontFaceRule(r: CSSRule): r is CSSFontFaceRule {
  return r.type === CSSRule.FONT_FACE_RULE;
}

async function inlineFontFaceRule(
  rule: CSSFontFaceRule,
  baseHref: string,
  warnings?: ExportWarning[]
): Promise<string> {
  const cssText = rule.cssText;
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
    const dataUri = await fetchAsDataUri(abs, warnings, "font");
    if (dataUri) result = result.replace(m[0], `url(${dataUri})`);
  }
  return result;
}

/** Collect every @font-face rule from the document with embedded sources. */
async function collectEmbeddedFontCss(warnings?: ExportWarning[]): Promise<string> {
  const out: string[] = [];
  for (const sheet of Array.from(document.styleSheets)) {
    let rules: CSSRuleList | null = null;
    try {
      rules = sheet.cssRules;
    } catch {
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
              const data = await fetchAsDataUri(abs, warnings, "font");
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
        out.push(await inlineFontFaceRule(rule, baseHref, warnings));
      }
    }
  }
  return out.join("\n");
}

/** Probe every <img> in the source for cross-origin / fetch failures. */
async function validateImages(source: HTMLElement, warnings: ExportWarning[]) {
  const imgs = Array.from(source.querySelectorAll("img")) as HTMLImageElement[];
  await Promise.all(
    imgs.map(async (img) => {
      const src = img.currentSrc || img.src;
      if (!src || src.startsWith("data:") || src.startsWith("blob:")) return;
      try {
        const res = await fetch(src, { mode: "cors", credentials: "omit" });
        if (!res.ok) {
          warnings.push({
            kind: "image",
            url: src,
            reason: `HTTP ${res.status} when fetching the image`,
            fix: "Re-upload the image so it's served from the same origin as your CV.",
          });
        }
      } catch {
        warnings.push({
          kind: "image",
          url: src,
          reason: "Blocked by browser (cross-origin without CORS headers)",
          fix: "Re-upload the image to your project, or host it on a CDN that returns Access-Control-Allow-Origin: *.",
        });
      }
    })
  );
}


/* =========================================================================
 * Shared canvas snapshot
 *
 * Renders the live preview offscreen at 2× scale with embedded fonts so the
 * output matches what the user sees, regardless of which file format we wrap
 * around it. Returns the full canvas plus a list of warnings about anything
 * that couldn't be embedded (CORS-blocked fonts/images).
 * ====================================================================== */

interface Snapshot {
  canvas: HTMLCanvasElement;
  warnings: ExportWarning[];
  pages: { dataUrl: string; widthPx: number; heightPx: number; pxPerMm: number }[];
}

async function renderSnapshot(source: HTMLElement): Promise<Snapshot> {
  if ((document as any).fonts?.ready) await (document as any).fonts.ready;

  const warnings: ExportWarning[] = [];
  await validateImages(source, warnings);

  const clone = source.cloneNode(true) as HTMLElement;
  stripControls(clone);

  const holder = document.createElement("div");
  holder.style.cssText = `position:fixed;left:-10000px;top:0;width:${source.offsetWidth}px;background:#fff;`;
  const fontStyle = document.createElement("style");
  fontStyle.textContent = await collectEmbeddedFontCss(warnings);
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

    // Slice into A4 pages
    const pxPerMm = canvas.width / A4_W_MM;
    const pageHpx = A4_H_MM * pxPerMm;
    const pages: Snapshot["pages"] = [];
    let y = 0;
    while (y < canvas.height) {
      const sliceH = Math.min(pageHpx, canvas.height - y);
      const c = document.createElement("canvas");
      c.width = canvas.width;
      c.height = sliceH;
      const ctx = c.getContext("2d")!;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, c.width, c.height);
      ctx.drawImage(canvas, 0, y, canvas.width, sliceH, 0, 0, canvas.width, sliceH);
      pages.push({
        dataUrl: c.toDataURL("image/png"),
        widthPx: c.width,
        heightPx: c.height,
        pxPerMm,
      });
      y += sliceH;
    }

    return { canvas, warnings, pages };
  } finally {
    document.body.removeChild(holder);
  }
}

/* =========================================================================
 * Standalone HTML — embeds the live snapshot as paginated images so the file
 * renders identically to the on-screen preview in any browser.
 * ====================================================================== */

export async function buildStandaloneHtml(source: HTMLElement, title: string): Promise<{ html: string; warnings: ExportWarning[] }> {
  const snap = await renderSnapshot(source);
  const pagesHtml = snap.pages
    .map(
      (p) => `<section class="page"><img src="${p.dataUrl}" alt=""/></section>`
    )
    .join("");

  const html = `<!doctype html><html lang="en"><head>
<meta charset="utf-8">
<title>${escapeHtml(title)}</title>
<style>
  @page { size: A4; margin: 0; }
  html,body{margin:0;padding:0;background:#e5e7eb;font-family:system-ui,sans-serif;}
  .page{
    width:${A4_W_MM}mm;
    height:${A4_H_MM}mm;
    margin:8mm auto;
    background:#fff;
    box-shadow:0 4px 24px rgba(0,0,0,.12);
    overflow:hidden;
    page-break-after:always;
    break-after:page;
  }
  .page:last-child{page-break-after:auto;break-after:auto;margin-bottom:0;}
  .page img{display:block;width:100%;height:100%;object-fit:cover;}
  @media print{ html,body{background:#fff;} .page{box-shadow:none;margin:0;} }
</style></head>
<body>${pagesHtml}</body></html>`;

  return { html, warnings: snap.warnings };
}

export async function exportToHtml(source: HTMLElement, filename: string): Promise<ExportWarning[]> {
  const { html, warnings } = await buildStandaloneHtml(source, filename);
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  saveAs(blob, filename.endsWith(".html") ? filename : `${filename}.html`);
  return warnings;
}

/* =========================================================================
 * PDF — multi-page A4
 * ====================================================================== */

export async function exportToPdf(source: HTMLElement, filename: string): Promise<ExportWarning[]> {
  const snap = await renderSnapshot(source);
  const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
  snap.pages.forEach((p, i) => {
    if (i > 0) pdf.addPage();
    const heightMm = p.heightPx / p.pxPerMm;
    pdf.addImage(p.dataUrl, "PNG", 0, 0, A4_W_MM, heightMm);
  });
  pdf.save(filename.endsWith(".pdf") ? filename : `${filename}.pdf`);
  return snap.warnings;
}

/* =========================================================================
 * DOCX — embeds the snapshot as full-page images, one per A4 page.
 * Layout, fonts, colors, and lists all render exactly like the preview
 * because Word displays the same image the user sees.
 * ====================================================================== */

function dataUrlToUint8(dataUrl: string): Uint8Array {
  const base64 = dataUrl.split(",")[1] || "";
  const bin = atob(base64);
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return arr;
}

export async function exportToDocx(source: HTMLElement, filename: string): Promise<ExportWarning[]> {
  const snap = await renderSnapshot(source);

  // Word page = A4 with 0 margins → image fills the page (210 × 297 mm).
  // docx ImageRun.transformation expects pixels at 96 DPI.
  // 210mm × (96/25.4) ≈ 793.7 px wide
  const pageWpx = Math.round((A4_W_MM * 96) / 25.4);
  const pageHpx = Math.round((A4_H_MM * 96) / 25.4);

  const paragraphs: Paragraph[] = snap.pages.map((p, idx) => {
    const heightMm = p.heightPx / p.pxPerMm;
    const heightPx = Math.round((heightMm * 96) / 25.4);
    return new Paragraph({
      spacing: { before: 0, after: 0 },
      children: [
        new ImageRun({
          type: "png",
          data: dataUrlToUint8(p.dataUrl),
          transformation: { width: pageWpx, height: Math.min(pageHpx, heightPx) },
        } as any),
      ],
      pageBreakBefore: idx > 0,
    });
  });

  if (paragraphs.length === 0) {
    paragraphs.push(new Paragraph({ children: [new TextRun({ text: "" })] }));
  }

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            size: { width: 11906, height: 16838 }, // A4 in DXA
            margin: { top: 0, right: 0, bottom: 0, left: 0, header: 0, footer: 0, gutter: 0 },
          },
        },
        children: paragraphs,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, filename.endsWith(".docx") ? filename : `${filename}.docx`);
  return snap.warnings;
}


/* =========================================================================
 * Utilities
 * ====================================================================== */
function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}
