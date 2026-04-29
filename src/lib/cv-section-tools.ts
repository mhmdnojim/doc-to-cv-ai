// DOM-based CV section management.
// Works on the contenteditable CV root, regardless of which template is rendered.
//
// Provides:
//   - findColumns(root): detects left/right column containers heuristically
//   - listSections(root): returns ordered list of {id, title, column, el}
//   - injectGapButtons(root, onInsert): "+ Add section here" between sections
//   - injectDragHandles(root, onReorder): grip handles on each section
//   - injectColumnDropZones(root, onInsert): click empty space to place
//   - insertSectionHTML(root, html, where): performs an actual DOM insert
//
// All injected controls are tagged with [data-cv-tool] so they can be cleaned
// before saving / exporting.

export type SectionLocation =
  | { mode: "start"; column: "left" | "right" }
  | { mode: "end"; column: "left" | "right" }
  | { mode: "after"; sectionId: string }
  | { mode: "before"; sectionId: string };

export interface SectionInfo {
  id: string;          // synthetic id assigned to data-cv-section
  title: string;
  column: "left" | "right";
  el: HTMLElement;
}

const TOOL_ATTR = "data-cv-tool";
const SECTION_ATTR = "data-cv-section";

// ---------- Column detection ----------

export function findColumns(root: HTMLElement): { left: HTMLElement | null; right: HTMLElement | null } {
  // Try semantic tags first
  const aside = root.querySelector<HTMLElement>("aside");
  const main = root.querySelector<HTMLElement>("main");
  if (aside && main) return { left: aside, right: main };

  // Heuristic: the root usually has a single flex/grid wrapper containing 1 or 2 vertical columns.
  const rootRect = root.getBoundingClientRect();
  if (!rootRect.width) return { left: null, right: root };

  // Find direct children of root that look like columns (tall + reasonably wide)
  const candidates: { el: HTMLElement; relX: number; rect: DOMRect }[] = [];
  const walk = (parent: HTMLElement, depth: number) => {
    if (depth > 3) return;
    Array.from(parent.children).forEach(child => {
      const el = child as HTMLElement;
      const r = el.getBoundingClientRect();
      if (r.height > rootRect.height * 0.4 && r.width > rootRect.width * 0.15) {
        candidates.push({ el, relX: (r.left + r.width / 2 - rootRect.left) / rootRect.width, rect: r });
      }
      if (el.children.length > 0) walk(el, depth + 1);
    });
  };
  walk(root, 0);

  if (candidates.length === 0) return { left: null, right: root };
  // Sort by x position
  candidates.sort((a, b) => a.relX - b.relX);
  // De-dup nested ones (prefer outermost on each side)
  const left = candidates.find(c => c.relX < 0.5)?.el || null;
  const right = candidates.reverse().find(c => c.relX >= 0.5)?.el || null;
  if (left === right) return { left: null, right: root };
  return { left, right };
}

// ---------- Section listing ----------

let sectionCounter = 0;

const PERSONAL_INFO_ATTR = "data-cv-personal";
const EMAIL_RE = /[\w.+-]+@[\w-]+\.[\w.-]+/;
const PHONE_RE = /(\+?\d[\d\s().-]{6,}\d)/;

/**
 * Find a tight container holding contact info (email/phone/location/website)
 * inside `scope` and tag it as a synthetic "Personal Information" section.
 * Idempotent: re-tags only if not already tagged.
 */
function tagPersonalInfo(scope: HTMLElement) {
  if (scope.querySelector(`[${PERSONAL_INFO_ATTR}]`)) return;

  // Find leaf-ish elements containing an email or phone match.
  const matches: HTMLElement[] = [];
  const all = scope.querySelectorAll<HTMLElement>("*");
  all.forEach(el => {
    if (el.children.length > 4) return; // skip large containers
    const txt = el.textContent || "";
    if (txt.length > 200) return;
    if (EMAIL_RE.test(txt) || PHONE_RE.test(txt)) matches.push(el);
  });
  if (matches.length === 0) return;

  // Find their lowest common ancestor.
  let lca: HTMLElement | null = matches[0];
  for (let i = 1; i < matches.length && lca; i++) {
    lca = lowestCommonAncestor(lca, matches[i]);
  }
  if (!lca || lca === scope) {
    // Use the smallest single match if no useful LCA.
    lca = matches[0];
  }
  // Climb until container is reasonably small but not a heading itself.
  while (lca && lca.parentElement && lca.parentElement !== scope) {
    const txt = (lca.textContent || "").trim();
    if (txt.length > 0 && txt.length < 250 && /h[1-6]/i.test(lca.tagName) === false) break;
    lca = lca.parentElement;
  }
  if (!lca || lca === scope) return;

  lca.setAttribute(PERSONAL_INFO_ATTR, "1");
  if (!lca.getAttribute(SECTION_ATTR)) lca.setAttribute(SECTION_ATTR, `pi${++sectionCounter}`);
}

function lowestCommonAncestor(a: HTMLElement, b: HTMLElement): HTMLElement | null {
  const ancestors = new Set<HTMLElement>();
  let cur: HTMLElement | null = a;
  while (cur) { ancestors.add(cur); cur = cur.parentElement; }
  cur = b;
  while (cur) { if (ancestors.has(cur)) return cur; cur = cur.parentElement; }
  return null;
}

export function listSections(root: HTMLElement): SectionInfo[] {
  // Tag personal-info first so it's discoverable as a section.
  tagPersonalInfo(root);

  const { left, right } = findColumns(root);
  const out: SectionInfo[] = [];

  const collect = (container: HTMLElement | null, column: "left" | "right") => {
    if (!container) return;

    // Gather candidate section elements: real <section>, headings, and personal-info block.
    const candidates = new Set<HTMLElement>();
    container.querySelectorAll<HTMLElement>("section").forEach(el => candidates.add(el));
    container.querySelectorAll<HTMLElement>(`[${PERSONAL_INFO_ATTR}]`).forEach(el => candidates.add(el));
    // Only fall back to headings when no real sections exist
    if (Array.from(candidates).filter(c => c.tagName === "SECTION").length === 0) {
      container.querySelectorAll<HTMLElement>("h2, h3").forEach(el => candidates.add(el));
    }

    // Avoid nesting: if a candidate is inside another candidate, drop the inner one
    // (except for personal-info which should win over its wrapping section).
    const list = Array.from(candidates);
    // Drop a candidate if another candidate contains it — UNLESS the inner one is
    // the personal-info block (which should win over its wrapping container).
    const filtered = list.filter(el => {
      const isPI = el.hasAttribute(PERSONAL_INFO_ATTR);
      return !list.some(other => other !== el && other.contains(el) && !(isPI && !other.hasAttribute(PERSONAL_INFO_ATTR) ? false : false)
        ? other !== el && other.contains(el) && !isPI
        : false);
    });

    // Document order
    filtered.sort((a, b) => {
      const pos = a.compareDocumentPosition(b);
      if (pos & Node.DOCUMENT_POSITION_FOLLOWING) return -1;
      if (pos & Node.DOCUMENT_POSITION_PRECEDING) return 1;
      return 0;
    });

    filtered.forEach(el => {
      if (!el.getAttribute(SECTION_ATTR)) el.setAttribute(SECTION_ATTR, `s${++sectionCounter}`);
      let title: string;
      if (el.hasAttribute(PERSONAL_INFO_ATTR)) {
        title = "Personal Information";
      } else {
        const heading = el.querySelector<HTMLElement>("h1, h2, h3") || (/h[1-6]/i.test(el.tagName) ? el : null);
        title = (heading?.textContent || "Section").replace(/\s+/g, " ").trim().replace(/[+✕×]\s*$/g, "").slice(0, 60);
      }
      out.push({ id: el.getAttribute(SECTION_ATTR)!, title, column, el });
    });
  };

  collect(left, "left");
  collect(right, "right");
  return out;
}

// ---------- Cleanup ----------

export function cleanupTools(root: HTMLElement) {
  root.querySelectorAll(`[${TOOL_ATTR}]`).forEach(el => el.remove());
  root.querySelectorAll<HTMLElement>(`[${SECTION_ATTR}]`).forEach(el => {
    el.style.position = "";
    el.removeAttribute("draggable");
  });
}

// ---------- Gap insert buttons ----------

const PLUS_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>`;
const GRIP_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="6" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="9" cy="18" r="1"/><circle cx="15" cy="6" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="18" r="1"/></svg>`;

function makeGapButton(onClick: () => void): HTMLElement {
  const btn = document.createElement("button");
  btn.setAttribute(TOOL_ATTR, "gap");
  btn.setAttribute("contenteditable", "false");
  btn.title = "Add section here";
  btn.innerHTML = `<span style="display:inline-flex;align-items:center;gap:4px;">${PLUS_ICON}<span>Add section here</span></span>`;
  btn.style.cssText = [
    "all: unset",
    "display: flex",
    "align-items: center",
    "justify-content: center",
    "width: 100%",
    "height: 16px",
    "margin: 4px 0",
    "border-radius: 6px",
    "background: hsl(var(--primary) / 0.08)",
    "color: hsl(var(--primary))",
    "font-size: 11px",
    "font-weight: 600",
    "cursor: pointer",
    "opacity: 0",
    "transition: opacity .15s, height .15s",
    "border: 1px dashed hsl(var(--primary) / 0.4)",
  ].join(";");
  btn.onmouseenter = () => { btn.style.opacity = "1"; btn.style.height = "24px"; };
  btn.onmouseleave = () => { btn.style.opacity = "0"; btn.style.height = "16px"; };
  // Make container hover also reveal it
  btn.setAttribute("data-cv-gap", "1");
  btn.onclick = (e) => { e.preventDefault(); e.stopPropagation(); onClick(); };
  return btn;
}

function makeDragHandle(): HTMLElement {
  const grip = document.createElement("div");
  grip.setAttribute(TOOL_ATTR, "grip");
  grip.setAttribute("contenteditable", "false");
  grip.title = "Drag to reorder";
  grip.innerHTML = GRIP_ICON;
  grip.style.cssText = [
    "position: absolute",
    "top: 4px",
    "left: -22px",
    "width: 18px",
    "height: 18px",
    "display: flex",
    "align-items: center",
    "justify-content: center",
    "border-radius: 4px",
    "background: hsl(var(--primary))",
    "color: white",
    "cursor: grab",
    "opacity: 0",
    "transition: opacity .15s",
    "z-index: 5",
  ].join(";");
  return grip;
}

export interface InjectOptions {
  onInsert: (where: SectionLocation) => void;
  onReorder?: () => void;
}

export function injectSectionTools(root: HTMLElement, opts: InjectOptions) {
  cleanupTools(root);
  const sections = listSections(root);

  // Group by column
  (["left", "right"] as const).forEach(col => {
    const inCol = sections.filter(s => s.column === col);
    if (inCol.length === 0) return;

    inCol.forEach((sec, idx) => {
      // Make positioned for grip overlay
      const computed = window.getComputedStyle(sec.el);
      if (computed.position === "static") sec.el.style.position = "relative";

      // Drag handle
      const grip = makeDragHandle();
      sec.el.appendChild(grip);
      sec.el.addEventListener("mouseenter", () => { grip.style.opacity = "1"; });
      sec.el.addEventListener("mouseleave", () => { grip.style.opacity = "0"; });

      // HTML5 drag — attach to grip, use section as the dragged element
      grip.draggable = true;
      grip.addEventListener("dragstart", (e) => {
        e.stopPropagation();
        sec.el.style.opacity = "0.4";
        const dt = (e as DragEvent).dataTransfer;
        if (dt) {
          dt.effectAllowed = "move";
          dt.setData("text/cv-section", sec.id);
          dt.setDragImage(sec.el, 0, 0);
        }
      });
      grip.addEventListener("dragend", () => {
        sec.el.style.opacity = "";
        // Cleanup drop indicators
        root.querySelectorAll(`[${TOOL_ATTR}="drop-indicator"]`).forEach(el => el.remove());
      });

      // Drop targets: each section accepts dragover and shows insert position
      sec.el.addEventListener("dragover", (e) => {
        const dt = (e as DragEvent).dataTransfer;
        if (!dt || !Array.from(dt.types).includes("text/cv-section")) return;
        e.preventDefault();
        // Indicator
        const rect = sec.el.getBoundingClientRect();
        const before = ((e as DragEvent).clientY - rect.top) < rect.height / 2;
        // Remove existing indicators
        root.querySelectorAll(`[${TOOL_ATTR}="drop-indicator"]`).forEach(el => el.remove());
        const ind = document.createElement("div");
        ind.setAttribute(TOOL_ATTR, "drop-indicator");
        ind.setAttribute("contenteditable", "false");
        ind.style.cssText = "height:3px;background:hsl(var(--primary));border-radius:2px;margin:2px 0;pointer-events:none;";
        if (before) sec.el.parentElement?.insertBefore(ind, sec.el);
        else sec.el.parentElement?.insertBefore(ind, sec.el.nextSibling);
      });
      sec.el.addEventListener("drop", (e) => {
        const dt = (e as DragEvent).dataTransfer;
        if (!dt) return;
        const sourceId = dt.getData("text/cv-section");
        if (!sourceId || sourceId === sec.id) return;
        e.preventDefault();
        const sourceEl = root.querySelector<HTMLElement>(`[${SECTION_ATTR}="${sourceId}"]`);
        if (!sourceEl) return;
        const rect = sec.el.getBoundingClientRect();
        const before = ((e as DragEvent).clientY - rect.top) < rect.height / 2;
        if (before) sec.el.parentElement?.insertBefore(sourceEl, sec.el);
        else sec.el.parentElement?.insertBefore(sourceEl, sec.el.nextSibling);
        opts.onReorder?.();
        // Re-inject after reorder
        setTimeout(() => injectSectionTools(root, opts), 50);
      });

      // Gap button BEFORE this section (idx 0 = "start of column")
      const gap = makeGapButton(() => {
        opts.onInsert(idx === 0 ? { mode: "start", column: col } : { mode: "before", sectionId: sec.id });
      });
      sec.el.parentElement?.insertBefore(gap, sec.el);

      // Gap button AFTER the last section
      if (idx === inCol.length - 1) {
        const gapEnd = makeGapButton(() => opts.onInsert({ mode: "end", column: col }));
        sec.el.parentElement?.insertBefore(gapEnd, sec.el.nextSibling);
      }
    });
  });

  // Empty-column drop zone: if a column has no sections, give it a clickable hint
  const cols = findColumns(root);
  (["left", "right"] as const).forEach(col => {
    const container = cols[col];
    if (!container) return;
    const inCol = sections.filter(s => s.column === col);
    if (inCol.length > 0) return;
    const hint = document.createElement("button");
    hint.setAttribute(TOOL_ATTR, "empty-hint");
    hint.setAttribute("contenteditable", "false");
    hint.innerHTML = `${PLUS_ICON}<span style="margin-left:6px;">Click to add a section in this column</span>`;
    hint.style.cssText = [
      "all: unset",
      "display: flex",
      "align-items: center",
      "justify-content: center",
      "width: 100%",
      "min-height: 80px",
      "margin: 12px 0",
      "border-radius: 8px",
      "border: 2px dashed hsl(var(--primary) / 0.5)",
      "color: hsl(var(--primary))",
      "background: hsl(var(--primary) / 0.05)",
      "font-size: 12px",
      "font-weight: 600",
      "cursor: pointer",
    ].join(";");
    hint.onclick = (e) => { e.preventDefault(); e.stopPropagation(); opts.onInsert({ mode: "end", column: col }); };
    container.appendChild(hint);
  });
}

// ---------- DOM section insertion ----------

export function insertAtLocation(root: HTMLElement, where: SectionLocation, sectionEl: HTMLElement) {
  if (where.mode === "after" || where.mode === "before") {
    const target = root.querySelector<HTMLElement>(`[${SECTION_ATTR}="${where.sectionId}"]`);
    if (!target || !target.parentElement) return false;
    if (where.mode === "after") target.parentElement.insertBefore(sectionEl, target.nextSibling);
    else target.parentElement.insertBefore(sectionEl, target);
    return true;
  }
  const cols = findColumns(root);
  const container = where.column === "left" ? cols.left : cols.right;
  if (!container) return false;
  if (where.mode === "start") container.insertBefore(sectionEl, container.firstChild);
  else container.appendChild(sectionEl);
  return true;
}

export interface NewSectionTemplate {
  type: "experience" | "education" | "skills" | "languages" | "projects" | "custom";
  title?: string;
}

export function buildSectionElement(spec: NewSectionTemplate): HTMLElement {
  const sec = document.createElement("section");
  sec.style.cssText = "margin-top:1.25rem;";
  const headStyle = "font-weight:700;text-transform:uppercase;letter-spacing:0.08em;font-size:0.85rem;margin-bottom:0.5rem;border-bottom:1px solid currentColor;padding-bottom:0.25rem;opacity:0.95;";
  const bodyStyle = "font-size:0.85rem;line-height:1.5;opacity:0.9;";
  const title = spec.title || (spec.type === "custom" ? `New Section ${Date.now().toString().slice(-4)}` : spec.type[0].toUpperCase() + spec.type.slice(1));
  let body = "";
  switch (spec.type) {
    case "experience":
      body = `<div style="margin-bottom:0.75rem;"><div style="display:flex;justify-content:space-between;"><strong>New Position</strong><span style="font-size:0.75rem;opacity:0.7;">2024 – Present</span></div><div style="font-size:0.8rem;opacity:0.85;">Company Name · Location</div><p style="${bodyStyle}margin-top:0.25rem;">Describe your role and key achievements.</p></div>`;
      break;
    case "education":
      body = `<div style="margin-bottom:0.5rem;"><strong>Degree, Field of Study</strong><div style="font-size:0.8rem;opacity:0.85;">University Name · 2020 – 2024</div></div>`;
      break;
    case "skills":
      body = `<div style="display:flex;flex-wrap:wrap;gap:0.4rem;"><span style="background:currentColor;color:white;padding:0.15rem 0.5rem;border-radius:4px;font-size:0.75rem;opacity:0.85;">Skill 1</span><span style="background:currentColor;color:white;padding:0.15rem 0.5rem;border-radius:4px;font-size:0.75rem;opacity:0.85;">Skill 2</span></div>`;
      break;
    case "languages":
      body = `<div style="${bodyStyle}"><strong>English</strong> · Native</div><div style="${bodyStyle}"><strong>Spanish</strong> · Fluent</div>`;
      break;
    case "projects":
      body = `<div style="margin-bottom:0.5rem;"><strong>Project Name</strong><p style="${bodyStyle}">Brief description and impact.</p></div>`;
      break;
    case "custom":
    default:
      body = `<p style="${bodyStyle}">Click here to write the content of your new section.</p>`;
  }
  sec.innerHTML = `<h2 style="${headStyle}">${title}</h2>${body}`;
  return sec;
}
