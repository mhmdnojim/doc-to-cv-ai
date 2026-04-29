import { CVData } from "./cv-types";

const esc = (s: any) => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));

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

  // Top-level scalars
  const scalars: Record<string, any> = {
    fullName: data.fullName, jobTitle: data.jobTitle, email: data.email,
    phone: data.phone, location: data.location, website: data.website,
    summary: data.summary,
  };
  out = out.replace(/\{\{(\w+)\}\}/g, (m, k) => k in scalars ? esc(scalars[k]) : m);

  return out;
}
