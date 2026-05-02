import { CVData } from "./cv-types";

const esc = (s: any) => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));

// Person-icon SVG used as placeholder when the user hasn't uploaded a photo yet.
const PHOTO_PLACEHOLDER =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="#9ca3af"/><circle cx="50" cy="38" r="16" fill="#374151"/><path d="M20 88c0-17 13-28 30-28s30 11 30 28z" fill="#374151"/></svg>`
  );

/**
 * Heuristics: does this <img> tag look like a profile/avatar photo slot?
 * We score on attribute hints (alt/class/id/name containing photo/avatar/profile/portrait/headshot)
 * and on shape clues (rounded-full, circle, w-XX h-XX with similar dims).
 */
function looksLikePhotoSlot(imgTag: string): boolean {
  const lower = imgTag.toLowerCase();
  if (/\b(photo|avatar|profile|portrait|headshot|picture|foto|me-|user-|person)\b/.test(lower)) return true;
  if (/rounded-full|rounded:50%|border-radius:\s*50%|circle/.test(lower)) return true;
  // Square-ish dimensions like w-32 h-32 → likely a profile slot
  const wh = lower.match(/\bw-(\d+)[^>]*\bh-(\d+)\b/);
  if (wh && wh[1] === wh[2]) return true;
  return false;
}

/**
 * If a user-uploaded HTML template doesn't use {{photo}} but contains <img> tags,
 * auto-wire the FIRST plausible profile-photo <img> to data.photo (or a placeholder).
 * This means any template with an image slot "just works" without the author
 * needing to know about the {{photo}} mustache.
 */
function autoWirePhotoSlot(html: string, photoUrl: string): string {
  if (/\{\{\s*photo\s*\}\}/.test(html)) return html; // already wired
  const imgRe = /<img\b[^>]*>/gi;
  const matches: { tag: string; index: number }[] = [];
  let m: RegExpExecArray | null;
  while ((m = imgRe.exec(html)) !== null) matches.push({ tag: m[0], index: m.index });
  if (matches.length === 0) return html;

  // Prefer an image that LOOKS like a profile slot, else fall back to the first <img>.
  const target = matches.find(x => looksLikePhotoSlot(x.tag)) || matches[0];
  const replaced = target.tag.replace(/\bsrc\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/i, `src="${photoUrl}"`);
  // If there was no src attribute at all, inject one before the closing >
  const finalTag = /\bsrc\s*=/i.test(target.tag)
    ? replaced
    : target.tag.replace(/\/?>$/, ` src="${photoUrl}"$&`);
  return html.slice(0, target.index) + finalTag + html.slice(target.index + target.tag.length);
}

/**
 * Mustache-lite renderer. Supports:
 *   {{field}}  — escaped string
 *   {{#section}} ... {{field}} ... {{/section}}  — repeat over array
 *   {{.}}      — current scalar value (used inside {{#skills}})
 */
export function renderUserTemplate(html: string, data: CVData): string {
  if (!html) return "";
  let out = html;

  // Sections (arrays)
  const sections: Record<string, any[]> = {
    experience: data.experience || [],
    education: data.education || [],
    skills: data.skills || [],
    languages: data.languages || [],
    projects: data.projects || [],
  };

  for (const [key, items] of Object.entries(sections)) {
    const re = new RegExp(`\\{\\{#${key}\\}\\}([\\s\\S]*?)\\{\\{\\/${key}\\}\\}`, "g");
    out = out.replace(re, (_m, inner: string) => {
      return items.map(item => {
        if (typeof item === "string") {
          return inner.replace(/\{\{\.\}\}/g, esc(item));
        }
        return inner.replace(/\{\{(\w+)\}\}/g, (_x, prop) => esc(item[prop]));
      }).join("");
    });
  }

  const photoUrl = data.photo || PHOTO_PLACEHOLDER;

  // Auto-wire any photo slot in user templates that didn't use {{photo}}
  out = autoWirePhotoSlot(out, photoUrl);

  // Top-level scalars
  const scalars: Record<string, any> = {
    fullName: data.fullName, jobTitle: data.jobTitle, email: data.email,
    phone: data.phone, location: data.location, website: data.website,
    summary: data.summary,
    photo: photoUrl,
  };
  out = out.replace(/\{\{(\w+)\}\}/g, (m, k) => k in scalars ? esc(scalars[k]) : m);

  return out;
}
