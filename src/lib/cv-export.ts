import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

/** A4 in mm */
const A4_W_MM = 210;
const A4_H_MM = 297;

/** Strip Lovable editor controls from a clone */
function stripControls(root: HTMLElement) {
  root.querySelectorAll("[data-add-btn], [data-section-ctrl], [data-cv-tool], [contenteditable]").forEach((el) => {
    if (el.hasAttribute("contenteditable")) el.removeAttribute("contenteditable");
  });
  root.querySelectorAll("[data-add-btn], [data-section-ctrl], [data-cv-tool]").forEach((el) => el.remove());
}

/** Inline computed CSS so the markup renders identically outside the app. */
function inlineComputedStyles(source: HTMLElement, target: HTMLElement) {
  const srcAll = source.querySelectorAll<HTMLElement>("*");
  const tgtAll = target.querySelectorAll<HTMLElement>("*");
  const apply = (s: HTMLElement, t: HTMLElement) => {
    const cs = window.getComputedStyle(s);
    let css = "";
    // Pick a curated set of properties for fidelity without bloating size too much
    const props = [
      "color","background","background-color","background-image","background-size","background-position","background-repeat",
      "font-family","font-size","font-weight","font-style","font-variant","line-height","letter-spacing","text-align","text-transform","text-decoration","white-space",
      "display","flex","flex-direction","flex-wrap","align-items","justify-content","gap","grid-template-columns","grid-template-rows","grid-column","grid-row",
      "width","height","min-width","min-height","max-width","max-height",
      "margin","margin-top","margin-right","margin-bottom","margin-left",
      "padding","padding-top","padding-right","padding-bottom","padding-left",
      "border","border-top","border-right","border-bottom","border-left","border-radius","border-color","border-width","border-style",
      "box-shadow","opacity","overflow","position","top","right","bottom","left","z-index","transform","object-fit",
    ];
    for (const p of props) {
      const v = cs.getPropertyValue(p);
      if (v) css += `${p}:${v};`;
    }
    t.setAttribute("style", css + (t.getAttribute("style") || ""));
  };
  apply(source, target);
  for (let i = 0; i < srcAll.length && i < tgtAll.length; i++) apply(srcAll[i], tgtAll[i]);
}

/** Build a fully self-contained HTML document mirroring the live preview. */
export function buildStandaloneHtml(source: HTMLElement, title: string): string {
  const clone = source.cloneNode(true) as HTMLElement;
  stripControls(clone);
  inlineComputedStyles(source, clone);

  const cs = window.getComputedStyle(source);
  const wrapStyle = `width:${A4_W_MM}mm;min-height:${A4_H_MM}mm;margin:0 auto;background:#ffffff;color:${cs.color};font-family:${cs.fontFamily};`;

  return `<!doctype html><html><head><meta charset="utf-8"><title>${title}</title>
<style>
  @page { size: A4; margin: 0; }
  html,body{margin:0;padding:0;background:#fff;}
  *{box-sizing:border-box;}
  img{max-width:100%;}
</style></head>
<body><div style="${wrapStyle}">${clone.outerHTML}</div></body></html>`;
}

/** Render the live preview to a multi-page PDF that matches what the user sees. */
export async function exportToPdf(source: HTMLElement, filename: string) {
  // Clone offscreen so we can strip controls without disturbing the UI
  const clone = source.cloneNode(true) as HTMLElement;
  stripControls(clone);

  const holder = document.createElement("div");
  holder.style.cssText = `position:fixed;left:-10000px;top:0;width:${source.offsetWidth}px;background:#fff;`;
  holder.appendChild(clone);
  document.body.appendChild(holder);

  try {
    // Wait for fonts/images
    if ((document as any).fonts?.ready) await (document as any).fonts.ready;
    await Promise.all(
      Array.from(clone.querySelectorAll("img")).map(
        (img) =>
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
    const pageWmm = A4_W_MM;
    const pageHmm = A4_H_MM;
    const imgWmm = pageWmm;
    const pxPerMm = canvas.width / imgWmm;
    const pageHpx = pageHmm * pxPerMm;

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
    pdf.save(filename);
  } finally {
    document.body.removeChild(holder);
  }
}
