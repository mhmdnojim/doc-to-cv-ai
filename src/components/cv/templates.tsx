import { CVData } from "@/lib/cv-types";
import { Mail, Phone, MapPin, Globe } from "lucide-react";

interface Props { data: CVData }

// Person silhouette placeholder shown in photo slots when the user
// hasn't uploaded a photo yet. Makes the slot visible so people know
// where their photo will go.
const PhotoPlaceholder = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <rect width="100" height="100" fill="#e5e7eb" />
    <circle cx="50" cy="38" r="16" fill="#9ca3af" />
    <path d="M20 88c0-17 13-28 30-28s30 11 30 28z" fill="#9ca3af" />
  </svg>
);

const PhotoSlot = ({ src, className }: { src?: string; className: string }) =>
  src
    ? <img src={src} alt="" className={`${className} object-cover`} />
    : <PhotoPlaceholder className={className} />;

export const ModernTemplate = ({ data }: Props) => (
  <div className="flex min-h-[297mm] w-[210mm] bg-white text-slate-900 font-sans">
    <aside className="w-[260px] bg-gradient-to-b from-indigo-600 to-violet-600 text-white p-8">
      <PhotoSlot src={data.photo} className="w-32 h-32 rounded-full mb-6 border-4 border-white/20" />
      <h1 className="text-2xl font-bold leading-tight">{data.fullName || "Your Name"}</h1>
      <p className="text-indigo-100 mt-1 text-sm">{data.jobTitle}</p>

      <div className="mt-8 space-y-3 text-sm">
        {data.email && <div className="flex items-start gap-2"><Mail className="w-4 h-4 mt-0.5 shrink-0" /><span className="break-all">{data.email}</span></div>}
        {data.phone && <div className="flex items-start gap-2"><Phone className="w-4 h-4 mt-0.5 shrink-0" />{data.phone}</div>}
        {data.location && <div className="flex items-start gap-2"><MapPin className="w-4 h-4 mt-0.5 shrink-0" />{data.location}</div>}
        {data.website && <div className="flex items-start gap-2"><Globe className="w-4 h-4 mt-0.5 shrink-0" /><span className="break-all">{data.website}</span></div>}
      </div>

      {data.skills.length > 0 && (
        <div className="mt-8">
          <h3 className="text-xs uppercase tracking-widest font-semibold mb-3 text-indigo-100">Skills</h3>
          <div className="flex flex-wrap gap-1.5">
            {data.skills.map((s, i) => <span key={i} className="text-xs bg-white/15 px-2 py-1 rounded">{s}</span>)}
          </div>
        </div>
      )}

      {data.languages.length > 0 && (
        <div className="mt-8">
          <h3 className="text-xs uppercase tracking-widest font-semibold mb-3 text-indigo-100">Languages</h3>
          {data.languages.map(l => (
            <div key={l.id} className="text-sm mb-1.5"><span className="font-medium">{l.name}</span> <span className="text-indigo-200">· {l.level}</span></div>
          ))}
        </div>
      )}
    </aside>

    <main className="flex-1 p-10">
      {data.summary && (
        <section className="mb-7">
          <h2 className="text-sm uppercase tracking-widest font-bold text-indigo-600 mb-2">Profile</h2>
          <p className="text-sm leading-relaxed text-slate-700">{data.summary}</p>
        </section>
      )}

      {data.experience.length > 0 && (
        <section className="mb-7">
          <h2 className="text-sm uppercase tracking-widest font-bold text-indigo-600 mb-3">Experience</h2>
          {data.experience.map(e => (
            <div key={e.id} className="mb-4">
              <div className="flex justify-between items-baseline">
                <h3 className="font-semibold text-slate-900">{e.position}</h3>
                <span className="text-xs text-slate-500">{e.startDate} – {e.endDate}</span>
              </div>
              <p className="text-sm text-indigo-600 font-medium">{e.company}{e.location && ` · ${e.location}`}</p>
              <p className="text-sm text-slate-600 mt-1.5 leading-relaxed">{e.description}</p>
            </div>
          ))}
        </section>
      )}

      {data.education.length > 0 && (
        <section className="mb-7">
          <h2 className="text-sm uppercase tracking-widest font-bold text-indigo-600 mb-3">Education</h2>
          {data.education.map(e => (
            <div key={e.id} className="mb-3">
              <div className="flex justify-between items-baseline">
                <h3 className="font-semibold">{e.degree} {e.field}</h3>
                <span className="text-xs text-slate-500">{e.startDate} – {e.endDate}</span>
              </div>
              <p className="text-sm text-indigo-600">{e.school}</p>
            </div>
          ))}
        </section>
      )}

      {data.projects.length > 0 && (
        <section>
          <h2 className="text-sm uppercase tracking-widest font-bold text-indigo-600 mb-3">Projects</h2>
          {data.projects.map(p => (
            <div key={p.id} className="mb-3">
              <h3 className="font-semibold">{p.name}</h3>
              <p className="text-sm text-slate-600">{p.description}</p>
              {p.link && <p className="text-xs text-indigo-600 mt-0.5">{p.link}</p>}
            </div>
          ))}
        </section>
      )}
    </main>
  </div>
);

export const ClassicTemplate = ({ data }: Props) => (
  <div className="min-h-[297mm] w-[210mm] bg-white text-slate-900 p-12 font-serif">
    <header className="text-center border-b-2 border-slate-900 pb-4 mb-6">
      <h1 className="text-4xl font-bold tracking-tight">{data.fullName || "Your Name"}</h1>
      <p className="text-lg text-slate-700 mt-1">{data.jobTitle}</p>
      <p className="text-sm text-slate-600 mt-2">
        {[data.email, data.phone, data.location, data.website].filter(Boolean).join(" · ")}
      </p>
    </header>

    {data.summary && (
      <section className="mb-6">
        <h2 className="text-sm uppercase tracking-widest font-bold border-b border-slate-300 pb-1 mb-2">Summary</h2>
        <p className="text-sm leading-relaxed">{data.summary}</p>
      </section>
    )}

    {data.experience.length > 0 && (
      <section className="mb-6">
        <h2 className="text-sm uppercase tracking-widest font-bold border-b border-slate-300 pb-1 mb-3">Experience</h2>
        {data.experience.map(e => (
          <div key={e.id} className="mb-4">
            <div className="flex justify-between"><h3 className="font-bold">{e.position}, {e.company}</h3><span className="text-sm">{e.startDate} – {e.endDate}</span></div>
            <p className="italic text-sm text-slate-600">{e.location}</p>
            <p className="text-sm mt-1">{e.description}</p>
          </div>
        ))}
      </section>
    )}

    {data.education.length > 0 && (
      <section className="mb-6">
        <h2 className="text-sm uppercase tracking-widest font-bold border-b border-slate-300 pb-1 mb-3">Education</h2>
        {data.education.map(e => (
          <div key={e.id} className="flex justify-between mb-2">
            <div><strong>{e.degree} {e.field}</strong>, {e.school}</div>
            <span className="text-sm">{e.startDate} – {e.endDate}</span>
          </div>
        ))}
      </section>
    )}

    {data.skills.length > 0 && (
      <section className="mb-6">
        <h2 className="text-sm uppercase tracking-widest font-bold border-b border-slate-300 pb-1 mb-2">Skills</h2>
        <p className="text-sm">{data.skills.join(" · ")}</p>
      </section>
    )}

    {data.languages.length > 0 && (
      <section>
        <h2 className="text-sm uppercase tracking-widest font-bold border-b border-slate-300 pb-1 mb-2">Languages</h2>
        <p className="text-sm">{data.languages.map(l => `${l.name} (${l.level})`).join(" · ")}</p>
      </section>
    )}
  </div>
);

export const MinimalTemplate = ({ data }: Props) => (
  <div className="min-h-[297mm] w-[210mm] bg-white text-zinc-900 p-16 font-sans">
    <h1 className="text-5xl font-light tracking-tight">{data.fullName || "Your Name"}</h1>
    <p className="text-zinc-500 mt-2 text-lg">{data.jobTitle}</p>
    <p className="text-xs text-zinc-500 mt-4 uppercase tracking-widest">
      {[data.email, data.phone, data.location, data.website].filter(Boolean).join(" / ")}
    </p>

    <div className="h-px bg-zinc-200 my-10" />

    {data.summary && <p className="text-base leading-relaxed text-zinc-700 mb-10">{data.summary}</p>}

    {data.experience.length > 0 && (
      <section className="mb-10">
        <h2 className="text-xs uppercase tracking-[0.3em] text-zinc-400 mb-5">Experience</h2>
        {data.experience.map(e => (
          <div key={e.id} className="mb-6 grid grid-cols-[120px_1fr] gap-6">
            <div className="text-xs text-zinc-500 pt-1">{e.startDate} – {e.endDate}</div>
            <div>
              <h3 className="font-medium">{e.position}</h3>
              <p className="text-sm text-zinc-600">{e.company}</p>
              <p className="text-sm text-zinc-700 mt-2 leading-relaxed">{e.description}</p>
            </div>
          </div>
        ))}
      </section>
    )}

    {data.education.length > 0 && (
      <section className="mb-10">
        <h2 className="text-xs uppercase tracking-[0.3em] text-zinc-400 mb-5">Education</h2>
        {data.education.map(e => (
          <div key={e.id} className="mb-3 grid grid-cols-[120px_1fr] gap-6">
            <div className="text-xs text-zinc-500 pt-1">{e.startDate} – {e.endDate}</div>
            <div><h3 className="font-medium">{e.degree} {e.field}</h3><p className="text-sm text-zinc-600">{e.school}</p></div>
          </div>
        ))}
      </section>
    )}

    {data.skills.length > 0 && (
      <section>
        <h2 className="text-xs uppercase tracking-[0.3em] text-zinc-400 mb-5">Skills</h2>
        <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-zinc-700">{data.skills.map((s, i) => <span key={i}>{s}</span>)}</div>
      </section>
    )}
  </div>
);

export const CreativeTemplate = ({ data }: Props) => (
  <div className="min-h-[297mm] w-[210mm] bg-white text-slate-900 font-sans">
    <header className="bg-gradient-to-br from-pink-500 via-orange-500 to-amber-500 text-white p-10">
      <h1 className="text-5xl font-black">{data.fullName || "Your Name"}</h1>
      <p className="text-xl mt-2 font-light">{data.jobTitle}</p>
      <div className="flex flex-wrap gap-x-6 gap-y-1 mt-4 text-sm">
        {data.email && <span>{data.email}</span>}{data.phone && <span>{data.phone}</span>}
        {data.location && <span>{data.location}</span>}{data.website && <span>{data.website}</span>}
      </div>
    </header>
    <div className="p-10 grid grid-cols-3 gap-8">
      <div className="col-span-2">
        {data.summary && <section className="mb-6"><h2 className="text-lg font-bold text-pink-600 mb-2">About</h2><p className="text-sm leading-relaxed">{data.summary}</p></section>}
        {data.experience.length > 0 && (
          <section className="mb-6">
            <h2 className="text-lg font-bold text-pink-600 mb-3">Experience</h2>
            {data.experience.map(e => (
              <div key={e.id} className="mb-4 border-l-4 border-orange-400 pl-4">
                <h3 className="font-bold">{e.position}</h3>
                <p className="text-sm text-orange-600">{e.company} · {e.startDate}–{e.endDate}</p>
                <p className="text-sm mt-1">{e.description}</p>
              </div>
            ))}
          </section>
        )}
        {data.projects.length > 0 && (
          <section><h2 className="text-lg font-bold text-pink-600 mb-3">Projects</h2>
            {data.projects.map(p => <div key={p.id} className="mb-2"><h3 className="font-semibold">{p.name}</h3><p className="text-sm text-slate-600">{p.description}</p></div>)}
          </section>
        )}
      </div>
      <div>
        {data.skills.length > 0 && (
          <section className="mb-6">
            <h2 className="text-lg font-bold text-pink-600 mb-3">Skills</h2>
            <div className="flex flex-wrap gap-1.5">{data.skills.map((s, i) => <span key={i} className="text-xs bg-pink-100 text-pink-700 px-2 py-1 rounded-full">{s}</span>)}</div>
          </section>
        )}
        {data.education.length > 0 && (
          <section className="mb-6">
            <h2 className="text-lg font-bold text-pink-600 mb-3">Education</h2>
            {data.education.map(e => <div key={e.id} className="mb-2 text-sm"><strong>{e.degree}</strong><div>{e.field}</div><div className="text-slate-600">{e.school}</div><div className="text-xs text-slate-500">{e.startDate}–{e.endDate}</div></div>)}
          </section>
        )}
        {data.languages.length > 0 && (
          <section><h2 className="text-lg font-bold text-pink-600 mb-3">Languages</h2>
            {data.languages.map(l => <div key={l.id} className="text-sm mb-1">{l.name} <span className="text-slate-500">— {l.level}</span></div>)}
          </section>
        )}
      </div>
    </div>
  </div>
);

export const ExecutiveTemplate = ({ data }: Props) => (
  <div className="min-h-[297mm] w-[210mm] bg-white text-slate-900 p-12" style={{ fontFamily: "Georgia, serif" }}>
    <header className="border-b-4 border-emerald-800 pb-5 mb-6">
      <h1 className="text-4xl font-bold text-emerald-900">{data.fullName || "Your Name"}</h1>
      <p className="text-lg text-emerald-700 italic mt-1">{data.jobTitle}</p>
      <p className="text-sm text-slate-600 mt-3">{[data.email, data.phone, data.location, data.website].filter(Boolean).join(" • ")}</p>
    </header>
    {data.summary && <section className="mb-6"><h2 className="text-base font-bold text-emerald-800 uppercase tracking-wide mb-2">Executive Summary</h2><p className="text-sm leading-relaxed">{data.summary}</p></section>}
    {data.experience.length > 0 && (
      <section className="mb-6">
        <h2 className="text-base font-bold text-emerald-800 uppercase tracking-wide mb-3">Professional Experience</h2>
        {data.experience.map(e => (
          <div key={e.id} className="mb-4">
            <div className="flex justify-between items-baseline"><h3 className="font-bold text-base">{e.position}</h3><span className="text-sm text-slate-600 italic">{e.startDate} – {e.endDate}</span></div>
            <p className="text-sm font-semibold text-emerald-700">{e.company}{e.location && `, ${e.location}`}</p>
            <p className="text-sm mt-1.5 leading-relaxed">{e.description}</p>
          </div>
        ))}
      </section>
    )}
    {data.education.length > 0 && (
      <section className="mb-6">
        <h2 className="text-base font-bold text-emerald-800 uppercase tracking-wide mb-3">Education</h2>
        {data.education.map(e => <div key={e.id} className="flex justify-between mb-1"><div><strong>{e.degree}, {e.field}</strong> — {e.school}</div><span className="text-sm text-slate-600">{e.startDate}–{e.endDate}</span></div>)}
      </section>
    )}
    {data.skills.length > 0 && <section><h2 className="text-base font-bold text-emerald-800 uppercase tracking-wide mb-2">Core Competencies</h2><p className="text-sm">{data.skills.join(" • ")}</p></section>}
  </div>
);

export const TechTemplate = ({ data }: Props) => (
  <div className="min-h-[297mm] w-[210mm] bg-white text-slate-900 p-10 font-sans">
    <header className="mb-6">
      <div className="text-xs text-cyan-600 mb-1" style={{ fontFamily: "monospace" }}>~/ {data.fullName?.toLowerCase().replace(/\s+/g, "_") || "your_name"}.cv</div>
      <h1 className="text-3xl font-bold">{data.fullName || "Your Name"}</h1>
      <p className="text-cyan-700 font-medium">{data.jobTitle}</p>
      <div className="flex flex-wrap gap-x-4 mt-2 text-xs text-slate-600" style={{ fontFamily: "monospace" }}>
        {data.email && <span>📧 {data.email}</span>}{data.phone && <span>📱 {data.phone}</span>}
        {data.location && <span>📍 {data.location}</span>}{data.website && <span>🔗 {data.website}</span>}
      </div>
    </header>

    {data.summary && <section className="mb-6 bg-slate-50 border-l-4 border-cyan-500 p-4"><p className="text-sm leading-relaxed">{data.summary}</p></section>}

    {data.skills.length > 0 && (
      <section className="mb-6">
        <h2 className="text-sm font-bold text-cyan-700 mb-2" style={{ fontFamily: "monospace" }}>// stack</h2>
        <div className="flex flex-wrap gap-1.5">{data.skills.map((s, i) => <span key={i} className="text-xs border border-cyan-200 bg-cyan-50 text-cyan-800 px-2 py-1 rounded" style={{ fontFamily: "monospace" }}>{s}</span>)}</div>
      </section>
    )}

    {data.experience.length > 0 && (
      <section className="mb-6">
        <h2 className="text-sm font-bold text-cyan-700 mb-3" style={{ fontFamily: "monospace" }}>// experience</h2>
        {data.experience.map(e => (
          <div key={e.id} className="mb-4">
            <div className="flex justify-between"><h3 className="font-semibold">{e.position} <span className="text-cyan-600">@ {e.company}</span></h3><span className="text-xs text-slate-500" style={{ fontFamily: "monospace" }}>{e.startDate}—{e.endDate}</span></div>
            <p className="text-sm text-slate-700 mt-1">{e.description}</p>
          </div>
        ))}
      </section>
    )}

    {data.projects.length > 0 && (
      <section className="mb-6">
        <h2 className="text-sm font-bold text-cyan-700 mb-3" style={{ fontFamily: "monospace" }}>// projects</h2>
        {data.projects.map(p => <div key={p.id} className="mb-2"><h3 className="font-semibold text-sm">{p.name}</h3><p className="text-sm text-slate-600">{p.description}</p>{p.link && <p className="text-xs text-cyan-600" style={{ fontFamily: "monospace" }}>{p.link}</p>}</div>)}
      </section>
    )}

    {data.education.length > 0 && (
      <section>
        <h2 className="text-sm font-bold text-cyan-700 mb-3" style={{ fontFamily: "monospace" }}>// education</h2>
        {data.education.map(e => <div key={e.id} className="mb-1 text-sm flex justify-between"><span><strong>{e.degree}</strong> {e.field} — {e.school}</span><span className="text-xs text-slate-500" style={{ fontFamily: "monospace" }}>{e.startDate}—{e.endDate}</span></div>)}
      </section>
    )}
  </div>
);

export const ElegantTemplate = ({ data }: Props) => (
  <div className="min-h-[297mm] w-[210mm] bg-white text-stone-900" style={{ fontFamily: "Georgia, serif" }}>
    <header className="bg-stone-100 px-12 py-10 flex items-center gap-8 border-b-4 border-stone-800">
      <PhotoSlot src={data.photo} className="w-28 h-28 rounded-full ring-4 ring-white shadow-md" />
      <div>
        <h1 className="text-5xl font-bold tracking-wide">{data.fullName || "Your Name"}</h1>
        <p className="text-stone-600 italic mt-1 text-lg">{data.jobTitle}</p>
        <p className="text-xs text-stone-500 mt-3 uppercase tracking-widest">{[data.email, data.phone, data.location].filter(Boolean).join(" • ")}</p>
      </div>
    </header>
    <div className="px-12 py-8">
      {data.summary && <section className="mb-6"><h2 className="text-xs uppercase tracking-[0.3em] text-stone-700 mb-2 font-bold">Profile</h2><p className="text-sm leading-relaxed">{data.summary}</p></section>}
      {data.experience.length > 0 && (
        <section className="mb-6"><h2 className="text-xs uppercase tracking-[0.3em] text-stone-700 mb-3 font-bold">Experience</h2>
          {data.experience.map(e => (
            <div key={e.id} className="mb-4 border-l-2 border-stone-300 pl-4">
              <div className="flex justify-between"><h3 className="font-bold">{e.position}</h3><span className="text-xs italic text-stone-500">{e.startDate}–{e.endDate}</span></div>
              <p className="text-sm italic text-stone-600">{e.company}</p>
              <p className="text-sm mt-1 leading-relaxed">{e.description}</p>
            </div>
          ))}
        </section>
      )}
      {data.education.length > 0 && (
        <section className="mb-6"><h2 className="text-xs uppercase tracking-[0.3em] text-stone-700 mb-3 font-bold">Education</h2>
          {data.education.map(e => <div key={e.id} className="mb-2 flex justify-between text-sm"><span><strong>{e.degree}</strong> {e.field} — <em>{e.school}</em></span><span className="text-stone-500">{e.startDate}–{e.endDate}</span></div>)}
        </section>
      )}
      {data.skills.length > 0 && <section><h2 className="text-xs uppercase tracking-[0.3em] text-stone-700 mb-2 font-bold">Skills</h2><p className="text-sm">{data.skills.join(" • ")}</p></section>}
    </div>
  </div>
);

export const ProfessionalTemplate = ({ data }: Props) => (
  <div className="min-h-[297mm] w-[210mm] bg-white text-slate-900 font-sans">
    <header className="bg-slate-900 text-white p-10 flex items-center gap-6">
      <PhotoSlot src={data.photo} className="w-24 h-24 rounded-full border-2 border-white" />
      <div className="flex-1">
        <h1 className="text-3xl font-bold uppercase tracking-wider">{data.fullName || "Your Name"}</h1>
        <p className="text-slate-300 mt-1">{data.jobTitle}</p>
      </div>
    </header>
    <div className="grid grid-cols-3">
      <aside className="col-span-1 bg-slate-100 p-6 text-sm">
        <h3 className="font-bold text-slate-900 uppercase text-xs tracking-wider mb-2">Contact</h3>
        <div className="space-y-1 text-slate-700 text-xs mb-5">
          {data.email && <p className="break-all">{data.email}</p>}{data.phone && <p>{data.phone}</p>}
          {data.location && <p>{data.location}</p>}{data.website && <p className="break-all">{data.website}</p>}
        </div>
        {data.skills.length > 0 && (<><h3 className="font-bold text-slate-900 uppercase text-xs tracking-wider mb-2">Skills</h3>
          <ul className="text-xs space-y-1 mb-5">{data.skills.map((s, i) => <li key={i}>• {s}</li>)}</ul></>)}
        {data.languages.length > 0 && (<><h3 className="font-bold text-slate-900 uppercase text-xs tracking-wider mb-2">Languages</h3>
          <ul className="text-xs space-y-1">{data.languages.map(l => <li key={l.id}>{l.name} — {l.level}</li>)}</ul></>)}
      </aside>
      <main className="col-span-2 p-8">
        {data.summary && <section className="mb-5"><h2 className="font-bold uppercase text-xs tracking-wider text-slate-900 border-b-2 border-slate-900 pb-1 mb-2">About Me</h2><p className="text-sm leading-relaxed">{data.summary}</p></section>}
        {data.experience.length > 0 && (
          <section className="mb-5"><h2 className="font-bold uppercase text-xs tracking-wider text-slate-900 border-b-2 border-slate-900 pb-1 mb-3">Work Experience</h2>
            {data.experience.map(e => (
              <div key={e.id} className="mb-3">
                <div className="flex justify-between"><strong className="text-sm">{e.position}</strong><span className="text-xs text-slate-500">{e.startDate}–{e.endDate}</span></div>
                <p className="text-xs text-slate-600">{e.company}</p>
                <p className="text-xs mt-1">{e.description}</p>
              </div>
            ))}
          </section>
        )}
        {data.education.length > 0 && (
          <section><h2 className="font-bold uppercase text-xs tracking-wider text-slate-900 border-b-2 border-slate-900 pb-1 mb-3">Education</h2>
            {data.education.map(e => <div key={e.id} className="mb-2 text-sm"><strong>{e.degree} {e.field}</strong><div className="text-xs text-slate-600">{e.school} · {e.startDate}–{e.endDate}</div></div>)}
          </section>
        )}
      </main>
    </div>
  </div>
);

export const CorporateTemplate = ({ data }: Props) => (
  <div className="min-h-[297mm] w-[210mm] bg-white text-slate-900 font-sans flex">
    <aside className="w-[280px] bg-blue-950 text-white p-8">
      <PhotoSlot src={data.photo} className="w-32 h-32 rounded-full mx-auto mb-6 border-4 border-blue-800" />
      <h1 className="text-2xl font-bold text-center">{data.fullName || "Your Name"}</h1>
      <p className="text-blue-200 text-sm text-center mt-1">{data.jobTitle}</p>
      <div className="h-px bg-blue-800 my-6" />
      <h3 className="text-xs uppercase tracking-widest font-bold mb-2 text-blue-200">Contact</h3>
      <div className="text-xs space-y-1.5 mb-6">
        {data.email && <p className="break-all">{data.email}</p>}{data.phone && <p>{data.phone}</p>}
        {data.location && <p>{data.location}</p>}{data.website && <p className="break-all">{data.website}</p>}
      </div>
      {data.education.length > 0 && (<><h3 className="text-xs uppercase tracking-widest font-bold mb-2 text-blue-200">Education</h3>
        {data.education.map(e => <div key={e.id} className="text-xs mb-3"><strong>{e.degree}</strong><div>{e.field}</div><div className="text-blue-200">{e.school}</div><div className="text-blue-300">{e.startDate}–{e.endDate}</div></div>)}</>)}
      {data.skills.length > 0 && (<><h3 className="text-xs uppercase tracking-widest font-bold mb-2 text-blue-200 mt-4">Skills</h3>
        <ul className="text-xs space-y-1">{data.skills.map((s, i) => <li key={i}>• {s}</li>)}</ul></>)}
    </aside>
    <main className="flex-1 p-10">
      {data.summary && <section className="mb-6"><h2 className="text-base font-bold text-blue-950 uppercase tracking-wide border-b-2 border-blue-950 pb-1 mb-2">Profile</h2><p className="text-sm leading-relaxed">{data.summary}</p></section>}
      {data.experience.length > 0 && (
        <section><h2 className="text-base font-bold text-blue-950 uppercase tracking-wide border-b-2 border-blue-950 pb-1 mb-3">Experience</h2>
          {data.experience.map(e => (
            <div key={e.id} className="mb-4">
              <div className="flex justify-between"><h3 className="font-bold">{e.position}</h3><span className="text-xs text-slate-500">{e.startDate}–{e.endDate}</span></div>
              <p className="text-sm text-blue-800 font-medium">{e.company}</p>
              <p className="text-sm mt-1 text-slate-700">{e.description}</p>
            </div>
          ))}
        </section>
      )}
    </main>
  </div>
);

export const DesignerTemplate = ({ data }: Props) => (
  <div className="min-h-[297mm] w-[210mm] bg-white text-slate-900 font-sans">
    <header className="bg-rose-100 p-10 flex items-center gap-8 relative">
      <PhotoSlot src={data.photo} className="w-32 h-32 rounded-full ring-8 ring-white shadow-lg" />
      <div>
        <h1 className="text-4xl font-light">{data.fullName || "Your Name"}</h1>
        <p className="text-rose-700 mt-1 tracking-widest uppercase text-sm">{data.jobTitle}</p>
      </div>
    </header>
    <div className="p-10 grid grid-cols-3 gap-8">
      <div className="col-span-2">
        {data.summary && <section className="mb-6"><h2 className="text-rose-700 font-semibold mb-2 uppercase tracking-wider text-xs">Profile</h2><p className="text-sm leading-relaxed">{data.summary}</p></section>}
        {data.experience.length > 0 && (
          <section className="mb-6"><h2 className="text-rose-700 font-semibold mb-3 uppercase tracking-wider text-xs">Experience</h2>
            {data.experience.map(e => (
              <div key={e.id} className="mb-4">
                <h3 className="font-semibold">{e.position}</h3>
                <p className="text-sm text-rose-600">{e.company} · {e.startDate}–{e.endDate}</p>
                <p className="text-sm mt-1 text-slate-700">{e.description}</p>
              </div>
            ))}
          </section>
        )}
      </div>
      <div className="text-sm">
        <h3 className="text-rose-700 font-semibold mb-2 uppercase tracking-wider text-xs">Contact</h3>
        <div className="space-y-1 text-xs mb-5 text-slate-700">
          {data.email && <p className="break-all">{data.email}</p>}{data.phone && <p>{data.phone}</p>}{data.location && <p>{data.location}</p>}
        </div>
        {data.skills.length > 0 && (<><h3 className="text-rose-700 font-semibold mb-2 uppercase tracking-wider text-xs">Skills</h3>
          <div className="flex flex-wrap gap-1 mb-5">{data.skills.map((s, i) => <span key={i} className="text-xs bg-rose-50 text-rose-700 px-2 py-0.5 rounded-full">{s}</span>)}</div></>)}
        {data.education.length > 0 && (<><h3 className="text-rose-700 font-semibold mb-2 uppercase tracking-wider text-xs">Education</h3>
          {data.education.map(e => <div key={e.id} className="text-xs mb-2"><strong>{e.degree}</strong><div>{e.school}</div><div className="text-slate-500">{e.startDate}–{e.endDate}</div></div>)}</>)}
      </div>
    </div>
  </div>
);

export const AcademicTemplate = ({ data }: Props) => (
  <div className="min-h-[297mm] w-[210mm] bg-white text-neutral-900 p-12" style={{ fontFamily: "'Times New Roman', serif" }}>
    <header className="text-center mb-6">
      <h1 className="text-3xl font-bold tracking-wide">{data.fullName || "Your Name"}</h1>
      <p className="text-sm mt-1">{data.jobTitle}</p>
      <p className="text-xs text-neutral-600 mt-2">{[data.email, data.phone, data.location, data.website].filter(Boolean).join(" | ")}</p>
    </header>
    <div className="h-0.5 bg-neutral-900 mb-5" />
    {data.summary && <section className="mb-5"><h2 className="font-bold uppercase text-sm mb-1">Research Interests</h2><p className="text-sm leading-relaxed text-justify">{data.summary}</p></section>}
    {data.education.length > 0 && (
      <section className="mb-5"><h2 className="font-bold uppercase text-sm mb-2">Education</h2>
        {data.education.map(e => <div key={e.id} className="mb-2 text-sm"><div className="flex justify-between"><strong>{e.school}</strong><span>{e.startDate}–{e.endDate}</span></div><p className="italic">{e.degree}, {e.field}</p></div>)}
      </section>
    )}
    {data.experience.length > 0 && (
      <section className="mb-5"><h2 className="font-bold uppercase text-sm mb-2">Experience</h2>
        {data.experience.map(e => (
          <div key={e.id} className="mb-3 text-sm">
            <div className="flex justify-between"><strong>{e.position}</strong><span>{e.startDate}–{e.endDate}</span></div>
            <p className="italic">{e.company}{e.location && `, ${e.location}`}</p>
            <p className="mt-1 text-justify">{e.description}</p>
          </div>
        ))}
      </section>
    )}
    {data.projects.length > 0 && (
      <section className="mb-5"><h2 className="font-bold uppercase text-sm mb-2">Publications & Projects</h2>
        {data.projects.map(p => <div key={p.id} className="text-sm mb-2"><strong>{p.name}.</strong> {p.description}</div>)}
      </section>
    )}
    {data.skills.length > 0 && <section><h2 className="font-bold uppercase text-sm mb-1">Skills</h2><p className="text-sm">{data.skills.join(", ")}.</p></section>}
  </div>
);

export const CompactTemplate = ({ data }: Props) => (
  <div className="min-h-[297mm] w-[210mm] bg-white text-gray-900 p-8 font-sans text-[13px]">
    <header className="border-b border-gray-300 pb-3 mb-4 flex justify-between items-end">
      <div>
        <h1 className="text-2xl font-bold">{data.fullName || "Your Name"}</h1>
        <p className="text-gray-600">{data.jobTitle}</p>
      </div>
      <div className="text-xs text-gray-600 text-right">
        {data.email && <p>{data.email}</p>}{data.phone && <p>{data.phone}</p>}
        {data.location && <p>{data.location}</p>}{data.website && <p>{data.website}</p>}
      </div>
    </header>
    {data.summary && <p className="mb-4 text-gray-700">{data.summary}</p>}
    {data.experience.length > 0 && (
      <section className="mb-4">
        <h2 className="font-bold uppercase text-xs tracking-wider text-gray-900 border-b border-gray-200 mb-2">Experience</h2>
        {data.experience.map(e => (
          <div key={e.id} className="mb-2">
            <div className="flex justify-between"><span><strong>{e.position}</strong> · {e.company}</span><span className="text-xs text-gray-500">{e.startDate}–{e.endDate}</span></div>
            <p className="text-xs text-gray-700">{e.description}</p>
          </div>
        ))}
      </section>
    )}
    {data.education.length > 0 && (
      <section className="mb-4">
        <h2 className="font-bold uppercase text-xs tracking-wider text-gray-900 border-b border-gray-200 mb-2">Education</h2>
        {data.education.map(e => <div key={e.id} className="flex justify-between"><span><strong>{e.degree} {e.field}</strong> · {e.school}</span><span className="text-xs text-gray-500">{e.startDate}–{e.endDate}</span></div>)}
      </section>
    )}
    <div className="grid grid-cols-2 gap-4">
      {data.skills.length > 0 && <section><h2 className="font-bold uppercase text-xs tracking-wider text-gray-900 border-b border-gray-200 mb-2">Skills</h2><p className="text-xs">{data.skills.join(", ")}</p></section>}
      {data.languages.length > 0 && <section><h2 className="font-bold uppercase text-xs tracking-wider text-gray-900 border-b border-gray-200 mb-2">Languages</h2><p className="text-xs">{data.languages.map(l => `${l.name} (${l.level})`).join(", ")}</p></section>}
    </div>
  </div>
);

export const BoldTemplate = ({ data }: Props) => (
  <div className="min-h-[297mm] w-[210mm] bg-white text-slate-900 font-sans">
    <header className="bg-rose-600 text-white p-12">
      <h1 className="text-6xl font-black uppercase leading-none tracking-tight">{data.fullName || "Your Name"}</h1>
      <p className="text-xl mt-3 font-light">{data.jobTitle}</p>
    </header>
    <div className="p-10">
      <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-slate-600 mb-6 pb-4 border-b-4 border-rose-600">
        {data.email && <span>{data.email}</span>}{data.phone && <span>{data.phone}</span>}
        {data.location && <span>{data.location}</span>}{data.website && <span>{data.website}</span>}
      </div>
      {data.summary && <p className="text-base leading-relaxed mb-6">{data.summary}</p>}
      {data.experience.length > 0 && (
        <section className="mb-6">
          <h2 className="text-2xl font-black uppercase text-rose-600 mb-3">Experience</h2>
          {data.experience.map(e => (
            <div key={e.id} className="mb-4">
              <h3 className="text-lg font-bold">{e.position}</h3>
              <p className="text-sm text-rose-600 font-semibold">{e.company} — {e.startDate} to {e.endDate}</p>
              <p className="text-sm mt-1 text-slate-700">{e.description}</p>
            </div>
          ))}
        </section>
      )}
      <div className="grid grid-cols-2 gap-8">
        {data.education.length > 0 && (
          <section><h2 className="text-2xl font-black uppercase text-rose-600 mb-3">Education</h2>
            {data.education.map(e => <div key={e.id} className="mb-2 text-sm"><strong>{e.degree} {e.field}</strong><div>{e.school}</div><div className="text-xs text-slate-500">{e.startDate}–{e.endDate}</div></div>)}
          </section>
        )}
        {data.skills.length > 0 && (
          <section><h2 className="text-2xl font-black uppercase text-rose-600 mb-3">Skills</h2>
            <div className="flex flex-wrap gap-1.5">{data.skills.map((s, i) => <span key={i} className="text-xs bg-rose-100 text-rose-700 px-2 py-1 font-semibold">{s}</span>)}</div>
          </section>
        )}
      </div>
    </div>
  </div>
);

export const PhotoTemplate = ({ data }: Props) => (
  <div className="min-h-[297mm] w-[210mm] bg-white text-slate-900 font-sans">
    <header className="relative h-[280px] bg-gradient-to-br from-teal-700 to-emerald-800 text-white">
      <div className="absolute inset-0 flex items-center gap-8 p-10">
        <PhotoSlot src={data.photo} className="w-44 h-44 rounded-full ring-4 ring-white/30 shadow-2xl" />
        <div>
          <h1 className="text-5xl font-bold">{data.fullName || "Your Name"}</h1>
          <p className="text-teal-100 text-xl mt-2">{data.jobTitle}</p>
          <div className="flex flex-wrap gap-x-4 mt-4 text-xs text-teal-50">
            {data.email && <span>✉ {data.email}</span>}{data.phone && <span>☎ {data.phone}</span>}
            {data.location && <span>⌖ {data.location}</span>}{data.website && <span>⌘ {data.website}</span>}
          </div>
        </div>
      </div>
    </header>
    <div className="p-10 grid grid-cols-3 gap-8">
      <div className="col-span-2">
        {data.summary && <section className="mb-6"><h2 className="text-teal-700 font-bold uppercase text-sm tracking-wider mb-2">About</h2><p className="text-sm leading-relaxed">{data.summary}</p></section>}
        {data.experience.length > 0 && (
          <section><h2 className="text-teal-700 font-bold uppercase text-sm tracking-wider mb-3">Experience</h2>
            {data.experience.map(e => (
              <div key={e.id} className="mb-4 pl-4 border-l-2 border-teal-200">
                <h3 className="font-semibold">{e.position}</h3>
                <p className="text-sm text-teal-700">{e.company} · {e.startDate}–{e.endDate}</p>
                <p className="text-sm mt-1 text-slate-700">{e.description}</p>
              </div>
            ))}
          </section>
        )}
      </div>
      <div>
        {data.skills.length > 0 && <section className="mb-5"><h2 className="text-teal-700 font-bold uppercase text-xs tracking-wider mb-2">Skills</h2><div className="flex flex-wrap gap-1">{data.skills.map((s, i) => <span key={i} className="text-xs bg-teal-50 text-teal-800 px-2 py-1 rounded">{s}</span>)}</div></section>}
        {data.education.length > 0 && <section className="mb-5"><h2 className="text-teal-700 font-bold uppercase text-xs tracking-wider mb-2">Education</h2>{data.education.map(e => <div key={e.id} className="text-sm mb-2"><strong>{e.degree}</strong><div className="text-xs">{e.school}</div><div className="text-xs text-slate-500">{e.startDate}–{e.endDate}</div></div>)}</section>}
        {data.languages.length > 0 && <section><h2 className="text-teal-700 font-bold uppercase text-xs tracking-wider mb-2">Languages</h2>{data.languages.map(l => <div key={l.id} className="text-sm">{l.name} <span className="text-slate-500">— {l.level}</span></div>)}</section>}
      </div>
    </div>
  </div>
);

/* ============================================================
 * Batch 1 of community-inspired templates
 * Each one is hand-coded, photo-aware (uses person silhouette
 * placeholder when no photo is provided) and uses the same
 * CVData shape as the other 14 built-in templates.
 * ========================================================== */

const PhotoSilhouette = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <rect width="100" height="100" fill="#e5e7eb" />
    <circle cx="50" cy="38" r="16" fill="#9ca3af" />
    <path d="M20 88c0-17 13-28 30-28s30 11 30 28z" fill="#9ca3af" />
  </svg>
);

const Avatar = ({ src, className }: { src?: string; className: string }) =>
  src ? <img src={src} alt="" className={`${className} object-cover`} /> : <PhotoSilhouette className={className} />;

/* 1. Navarro — Navy sidebar, circular photo, wave divider */
export const NavarroTemplate = ({ data }: Props) => (
  <div className="flex min-h-[297mm] w-[210mm] bg-white text-slate-900 font-sans text-[12px]">
    <aside className="w-[235px] bg-[#2c4a6b] text-white relative">
      <div className="px-6 pt-8 pb-12 text-center relative">
        <Avatar src={data.photo} className="w-28 h-28 rounded-full mx-auto border-4 border-white shadow-md" />
      </div>
      <svg viewBox="0 0 235 40" className="block w-full -mt-1" preserveAspectRatio="none">
        <path d="M0,40 Q60,0 117,20 T235,15 L235,40 Z" fill="#ffffff" />
      </svg>
      <div className="px-6 pb-8 -mt-2 space-y-6">
        <section>
          <h3 className="font-bold tracking-widest text-xs mb-2 text-white/90">CONTACTO</h3>
          <div className="space-y-1.5 text-[11px] text-white/85 leading-snug">
            {data.phone && <div className="flex gap-2"><Phone className="w-3 h-3 mt-0.5 shrink-0" />{data.phone}</div>}
            {data.email && <div className="flex gap-2 break-all"><Mail className="w-3 h-3 mt-0.5 shrink-0" />{data.email}</div>}
            {data.location && <div className="flex gap-2"><MapPin className="w-3 h-3 mt-0.5 shrink-0" />{data.location}</div>}
            {data.website && <div className="flex gap-2 break-all"><Globe className="w-3 h-3 mt-0.5 shrink-0" />{data.website}</div>}
          </div>
        </section>
        {data.summary && (
          <section>
            <h3 className="font-bold tracking-widest text-xs mb-2 text-white/90">INFORMACIÓN</h3>
            <p className="text-[11px] text-white/85 leading-relaxed">{data.summary}</p>
          </section>
        )}
        {data.education.length > 0 && (
          <section>
            <h3 className="font-bold tracking-widest text-xs mb-2 text-white/90">FORMACIÓN</h3>
            {data.education.map(e => (
              <div key={e.id} className="mb-2 text-[11px]"><div className="font-semibold">{e.school}</div><div className="text-white/75">{e.degree} {e.field}</div><div className="text-white/60">{e.startDate} – {e.endDate}</div></div>
            ))}
          </section>
        )}
        {data.skills.length > 0 && (
          <section>
            <h3 className="font-bold tracking-widest text-xs mb-2 text-white/90">HERRAMIENTAS</h3>
            <ul className="space-y-1 text-[11px] text-white/85 list-disc list-inside marker:text-white/50">{data.skills.map((s, i) => <li key={i}>{s}</li>)}</ul>
          </section>
        )}
        {data.languages.length > 0 && (
          <section>
            <h3 className="font-bold tracking-widest text-xs mb-2 text-white/90">IDIOMAS</h3>
            {data.languages.map(l => <div key={l.id} className="text-[11px] text-white/85">{l.name} <span className="text-white/60">· {l.level}</span></div>)}
          </section>
        )}
      </div>
    </aside>
    <main className="flex-1 px-10 pt-12 pb-10">
      <h1 className="text-3xl font-extrabold tracking-[0.18em] text-[#2c4a6b]">{(data.fullName || "YOUR NAME").toUpperCase()}</h1>
      <p className="mt-1 text-xs tracking-[0.3em] text-slate-500 uppercase">{data.jobTitle}</p>
      <div className="mt-2 h-[2px] w-16 bg-[#2c4a6b]" />
      {data.experience.length > 0 && (
        <section className="mt-8">
          <h2 className="text-sm font-bold tracking-widest text-[#2c4a6b] mb-3">EXPERIENCIA</h2>
          {data.experience.map(e => (
            <div key={e.id} className="mb-4">
              <div className="font-semibold text-slate-900">{e.position}</div>
              <div className="text-[11px] text-slate-500">{e.company}{e.location && ` · ${e.location}`} | {e.startDate} – {e.endDate}</div>
              <p className="text-[11.5px] text-slate-700 mt-1 leading-relaxed">{e.description}</p>
            </div>
          ))}
        </section>
      )}
      {data.projects.length > 0 && (
        <section className="mt-6">
          <h2 className="text-sm font-bold tracking-widest text-[#2c4a6b] mb-3">PROYECTOS</h2>
          {data.projects.map(p => <div key={p.id} className="mb-3"><div className="font-semibold">{p.name}</div><div className="text-[11px] text-slate-700">{p.description}</div>{p.link && <div className="text-[11px] text-[#2c4a6b]">{p.link}</div>}</div>)}
        </section>
      )}
    </main>
  </div>
);

/* 2. Mitchell — Navy header band with corner accent, skill bars */
export const MitchellTemplate = ({ data }: Props) => (
  <div className="min-h-[297mm] w-[210mm] bg-white text-slate-900 font-sans text-[12px]">
    <header className="relative bg-[#2d4a6b] text-white px-10 pt-8 pb-10 flex items-center gap-6">
      <Avatar src={data.photo} className="w-24 h-24 rounded-full border-4 border-white shadow-md shrink-0" />
      <div className="flex-1">
        <h1 className="text-3xl font-extrabold leading-tight tracking-tight">{(data.fullName || "Your Name").toUpperCase()}</h1>
        <div className="inline-block mt-2 px-3 py-1 bg-white/15 text-[11px] tracking-[0.25em] uppercase">{data.jobTitle}</div>
      </div>
      <div className="absolute top-0 right-0 w-16 h-16" style={{ background: "linear-gradient(135deg, transparent 50%, #ffffff 50%)" }} />
    </header>
    <div className="grid grid-cols-[230px_1fr]">
      <aside className="bg-slate-50 px-6 py-7 space-y-6">
        <section>
          <h3 className="font-bold tracking-widest text-xs text-[#2d4a6b] mb-2">CONTACT</h3>
          <div className="space-y-1.5 text-[11px] text-slate-700">
            {data.phone && <div className="flex gap-2"><Phone className="w-3 h-3 mt-0.5 shrink-0 text-[#2d4a6b]" />{data.phone}</div>}
            {data.email && <div className="flex gap-2 break-all"><Mail className="w-3 h-3 mt-0.5 shrink-0 text-[#2d4a6b]" />{data.email}</div>}
            {data.location && <div className="flex gap-2"><MapPin className="w-3 h-3 mt-0.5 shrink-0 text-[#2d4a6b]" />{data.location}</div>}
            {data.website && <div className="flex gap-2 break-all"><Globe className="w-3 h-3 mt-0.5 shrink-0 text-[#2d4a6b]" />{data.website}</div>}
          </div>
        </section>
        {data.education.length > 0 && (
          <section>
            <h3 className="font-bold tracking-widest text-xs text-[#2d4a6b] mb-2">EDUCATION</h3>
            {data.education.map(e => <div key={e.id} className="mb-2 text-[11px]"><div className="font-semibold">{e.school}</div><div className="text-slate-600">{e.degree} {e.field}</div><div className="text-slate-500">{e.startDate} – {e.endDate}</div></div>)}
          </section>
        )}
        {data.skills.length > 0 && (
          <section>
            <h3 className="font-bold tracking-widest text-xs text-[#2d4a6b] mb-3">SKILLS</h3>
            <div className="space-y-2">
              {data.skills.map((s, i) => (
                <div key={i}>
                  <div className="text-[11px] mb-1">{s}</div>
                  <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden"><div className="h-full bg-[#2d4a6b] rounded-full" style={{ width: `${70 + (i * 7) % 30}%` }} /></div>
                </div>
              ))}
            </div>
          </section>
        )}
        {data.languages.length > 0 && (
          <section>
            <h3 className="font-bold tracking-widest text-xs text-[#2d4a6b] mb-2">LANGUAGES</h3>
            {data.languages.map(l => <div key={l.id} className="text-[11px]">{l.name} <span className="text-slate-500">· {l.level}</span></div>)}
          </section>
        )}
      </aside>
      <main className="px-9 py-7">
        {data.summary && <section className="mb-5"><h2 className="font-bold tracking-widest text-sm text-[#2d4a6b] mb-2">ABOUT ME</h2><p className="text-[11.5px] text-slate-700 leading-relaxed">{data.summary}</p></section>}
        {data.experience.length > 0 && (
          <section>
            <h2 className="font-bold tracking-widest text-sm text-[#2d4a6b] mb-3">WORK EXPERIENCE</h2>
            {data.experience.map(e => (
              <div key={e.id} className="mb-4">
                <div className="flex justify-between items-baseline"><h3 className="font-semibold">{e.position}</h3><span className="text-[10px] text-slate-500">{e.startDate} – {e.endDate}</span></div>
                <div className="text-[11px] text-[#2d4a6b] font-medium">{e.company}{e.location && ` · ${e.location}`}</div>
                <p className="text-[11.5px] text-slate-700 mt-1 leading-relaxed">{e.description}</p>
              </div>
            ))}
          </section>
        )}
      </main>
    </div>
  </div>
);

/* 3. Flores — Peach sidebar, script name, circular photo */
export const FloresTemplate = ({ data }: Props) => (
  <div className="flex min-h-[297mm] w-[210mm] bg-white text-slate-900 font-sans text-[12px]">
    <aside className="w-[225px] bg-[#f4d4c4] px-6 py-8 space-y-6">
      <Avatar src={data.photo} className="w-32 h-32 rounded-full mx-auto border-[6px] border-white shadow-sm" />
      <div className="text-center">
        <p className="text-[11px] tracking-[0.35em] text-[#7a4a3a] uppercase">{data.jobTitle || "Profession"}</p>
      </div>
      <section>
        <h3 className="text-[11px] tracking-[0.3em] text-[#7a4a3a] font-bold mb-2">CONTACTO</h3>
        <div className="space-y-1.5 text-[11px] text-[#5a3a2a]">
          {data.phone && <div className="flex gap-2"><Phone className="w-3 h-3 mt-0.5 shrink-0" />{data.phone}</div>}
          {data.email && <div className="flex gap-2 break-all"><Mail className="w-3 h-3 mt-0.5 shrink-0" />{data.email}</div>}
          {data.location && <div className="flex gap-2"><MapPin className="w-3 h-3 mt-0.5 shrink-0" />{data.location}</div>}
        </div>
      </section>
      {data.skills.length > 0 && (
        <section>
          <h3 className="text-[11px] tracking-[0.3em] text-[#7a4a3a] font-bold mb-2">HERRAMIENTAS</h3>
          <ul className="space-y-1 text-[11px] text-[#5a3a2a] list-disc list-inside marker:text-[#7a4a3a]">{data.skills.map((s, i) => <li key={i}>{s}</li>)}</ul>
        </section>
      )}
      {data.languages.length > 0 && (
        <section>
          <h3 className="text-[11px] tracking-[0.3em] text-[#7a4a3a] font-bold mb-2">IDIOMAS</h3>
          {data.languages.map(l => <div key={l.id} className="text-[11px] text-[#5a3a2a]">{l.name} <span className="text-[#9a6a5a]">· {l.level}</span></div>)}
        </section>
      )}
    </aside>
    <main className="flex-1 px-10 pt-12 pb-10">
      <h1 className="text-5xl text-[#7a4a3a]" style={{ fontFamily: '"Brush Script MT", "Snell Roundhand", cursive' }}>{data.fullName || "Your Name"}</h1>
      <div className="mt-1 h-[3px] w-24 bg-[#f4a48a]" />
      {data.summary && <p className="text-[11.5px] text-slate-700 mt-4 leading-relaxed">{data.summary}</p>}
      {data.experience.length > 0 && (
        <section className="mt-7">
          <h2 className="inline-block bg-[#f4d4c4] text-[#7a4a3a] px-3 py-1 text-[11px] tracking-[0.3em] font-bold mb-3">EXPERIENCIA</h2>
          {data.experience.map(e => (
            <div key={e.id} className="mb-4 pl-3 border-l-2 border-[#f4a48a]">
              <div className="font-semibold">{e.position}</div>
              <div className="text-[11px] text-[#7a4a3a]">{e.company} | {e.startDate} – {e.endDate}</div>
              <p className="text-[11.5px] text-slate-700 mt-1 leading-relaxed">{e.description}</p>
            </div>
          ))}
        </section>
      )}
      {data.education.length > 0 && (
        <section className="mt-6">
          <h2 className="inline-block bg-[#f4d4c4] text-[#7a4a3a] px-3 py-1 text-[11px] tracking-[0.3em] font-bold mb-3">FORMACIÓN</h2>
          {data.education.map(e => <div key={e.id} className="mb-2 pl-3 border-l-2 border-[#f4a48a]"><div className="font-semibold">{e.degree} {e.field}</div><div className="text-[11px] text-[#7a4a3a]">{e.school} | {e.startDate} – {e.endDate}</div></div>)}
        </section>
      )}
    </main>
  </div>
);

/* 4. Cortés — Script header, right sidebar with circular photo */
export const CortesTemplate = ({ data }: Props) => (
  <div className="flex min-h-[297mm] w-[210mm] bg-white text-slate-900 font-sans text-[12px]">
    <main className="flex-1 px-10 pt-10 pb-10">
      <h1 className="text-5xl text-slate-900" style={{ fontFamily: '"Brush Script MT", "Snell Roundhand", cursive' }}>{data.fullName || "Your Name"}</h1>
      <p className="text-[11px] tracking-[0.4em] text-slate-500 uppercase mt-2">{data.jobTitle}</p>
      {data.summary && (
        <section className="mt-6">
          <h2 className="text-center text-[11px] tracking-[0.4em] font-bold text-slate-700 border-y border-slate-300 py-1.5">EXPERIENCIA LABORAL</h2>
          <p className="text-[11.5px] text-slate-700 mt-3 leading-relaxed">{data.summary}</p>
        </section>
      )}
      {data.experience.length > 0 && (
        <section className="mt-6 space-y-4">
          {data.experience.map(e => (
            <div key={e.id}>
              <div className="font-semibold text-slate-900">{e.company} | {e.position}</div>
              <div className="text-[11px] text-slate-500">{e.startDate} – {e.endDate}{e.location && ` · ${e.location}`}</div>
              <p className="text-[11.5px] text-slate-700 mt-1 leading-relaxed">{e.description}</p>
            </div>
          ))}
        </section>
      )}
      {data.languages.length > 0 && (
        <section className="mt-6">
          <h2 className="text-center text-[11px] tracking-[0.4em] font-bold text-slate-700 border-y border-slate-300 py-1.5">IDIOMAS</h2>
          <div className="mt-2 text-[11.5px] text-slate-700 space-y-0.5">{data.languages.map(l => <div key={l.id}>{l.name} <span className="text-slate-500">— {l.level}</span></div>)}</div>
        </section>
      )}
    </main>
    <aside className="w-[200px] bg-[#f4d4c4] px-5 py-8 space-y-6">
      <Avatar src={data.photo} className="w-28 h-28 rounded-full mx-auto border-[5px] border-white shadow-sm" />
      <section>
        <h3 className="text-[11px] tracking-[0.3em] text-[#7a4a3a] font-bold mb-2">CONTACTO</h3>
        <div className="space-y-1.5 text-[10.5px] text-[#5a3a2a]">
          {data.phone && <div className="flex gap-2"><Phone className="w-3 h-3 mt-0.5 shrink-0" />{data.phone}</div>}
          {data.email && <div className="flex gap-2 break-all"><Mail className="w-3 h-3 mt-0.5 shrink-0" />{data.email}</div>}
          {data.location && <div className="flex gap-2"><MapPin className="w-3 h-3 mt-0.5 shrink-0" />{data.location}</div>}
          {data.website && <div className="flex gap-2 break-all"><Globe className="w-3 h-3 mt-0.5 shrink-0" />{data.website}</div>}
        </div>
      </section>
      <section>
        <h3 className="text-[11px] tracking-[0.3em] text-[#7a4a3a] font-bold mb-2">SOBRE MÍ</h3>
        <p className="text-[10.5px] text-[#5a3a2a] leading-relaxed">{data.summary || "—"}</p>
      </section>
      {data.education.length > 0 && (
        <section>
          <h3 className="text-[11px] tracking-[0.3em] text-[#7a4a3a] font-bold mb-2">EDUCACIÓN</h3>
          {data.education.map(e => <div key={e.id} className="mb-2 text-[10.5px] text-[#5a3a2a]"><div className="font-semibold">{e.degree} {e.field}</div><div>{e.school}</div><div className="text-[#9a6a5a]">{e.startDate} – {e.endDate}</div></div>)}
        </section>
      )}
      {data.skills.length > 0 && (
        <section>
          <h3 className="text-[11px] tracking-[0.3em] text-[#7a4a3a] font-bold mb-2">HABILIDADES</h3>
          <ul className="space-y-1 text-[10.5px] text-[#5a3a2a] list-disc list-inside marker:text-[#7a4a3a]">{data.skills.map((s, i) => <li key={i}>{s}</li>)}</ul>
        </section>
      )}
    </aside>
  </div>
);

/* 5. Álvarez — Pink curved shapes, modern feminine */
export const AlvarezTemplate = ({ data }: Props) => (
  <div className="relative min-h-[297mm] w-[210mm] bg-white text-slate-900 font-sans text-[12px] overflow-hidden">
    <div className="absolute top-0 left-0 w-[260px] h-[260px] rounded-full bg-[#fde0e8] -translate-x-1/3 -translate-y-1/3" />
    <div className="absolute top-0 right-0 w-[180px] h-[180px] rounded-full bg-[#f8b4c4] translate-x-1/3 -translate-y-1/3" />
    <div className="absolute bottom-0 left-0 w-[200px] h-[200px] rounded-full bg-[#fde0e8] -translate-x-1/2 translate-y-1/2" />
    <div className="relative grid grid-cols-[210px_1fr] gap-8 px-10 pt-12 pb-10">
      <aside className="space-y-6">
        <Avatar src={data.photo} className="w-36 h-36 rounded-full mx-auto border-[6px] border-white shadow-md" />
        <section>
          <h3 className="text-center text-[11px] tracking-[0.3em] font-bold text-[#c43a6a] mb-2 px-3 py-1 bg-[#fde0e8] rounded-full">CONTACTO</h3>
          <div className="space-y-1.5 text-[11px] text-slate-700">
            {data.phone && <div className="flex gap-2"><Phone className="w-3 h-3 mt-0.5 shrink-0 text-[#c43a6a]" />{data.phone}</div>}
            {data.email && <div className="flex gap-2 break-all"><Mail className="w-3 h-3 mt-0.5 shrink-0 text-[#c43a6a]" />{data.email}</div>}
            {data.location && <div className="flex gap-2"><MapPin className="w-3 h-3 mt-0.5 shrink-0 text-[#c43a6a]" />{data.location}</div>}
          </div>
        </section>
        {data.languages.length > 0 && (
          <section>
            <h3 className="text-center text-[11px] tracking-[0.3em] font-bold text-[#c43a6a] mb-2 px-3 py-1 bg-[#fde0e8] rounded-full">IDIOMAS</h3>
            {data.languages.map(l => <div key={l.id} className="text-[11px] text-slate-700">{l.name} <span className="text-slate-500">· {l.level}</span></div>)}
          </section>
        )}
        {data.skills.length > 0 && (
          <section>
            <h3 className="text-center text-[11px] tracking-[0.3em] font-bold text-[#c43a6a] mb-2 px-3 py-1 bg-[#fde0e8] rounded-full">HABILIDADES</h3>
            <ul className="space-y-1 text-[11px] text-slate-700 list-disc list-inside marker:text-[#c43a6a]">{data.skills.map((s, i) => <li key={i}>{s}</li>)}</ul>
          </section>
        )}
      </aside>
      <main>
        <h1 className="text-4xl font-extrabold text-slate-900 leading-tight">{(data.fullName || "Your Name").toUpperCase()}</h1>
        <p className="text-[11px] tracking-[0.4em] text-[#c43a6a] uppercase mt-2">{data.jobTitle}</p>
        {data.summary && (
          <section className="mt-5">
            <h2 className="text-[11px] tracking-[0.3em] font-bold text-[#c43a6a] mb-1">ACERCA DE MÍ</h2>
            <p className="text-[11.5px] text-slate-700 leading-relaxed">{data.summary}</p>
          </section>
        )}
        {data.experience.length > 0 && (
          <section className="mt-6">
            <h2 className="text-[11px] tracking-[0.3em] font-bold text-[#c43a6a] mb-3">EXPERIENCIA</h2>
            {data.experience.map(e => (
              <div key={e.id} className="mb-4">
                <div className="font-semibold">{e.position}</div>
                <div className="text-[11px] text-[#c43a6a]">{e.company} · {e.startDate} – {e.endDate}</div>
                <p className="text-[11.5px] text-slate-700 mt-1 leading-relaxed">{e.description}</p>
              </div>
            ))}
          </section>
        )}
        {data.education.length > 0 && (
          <section className="mt-6">
            <h2 className="text-[11px] tracking-[0.3em] font-bold text-[#c43a6a] mb-3">ESTUDIOS</h2>
            {data.education.map(e => <div key={e.id} className="mb-2"><div className="font-semibold">{e.degree} {e.field}</div><div className="text-[11px] text-slate-600">{e.school} · {e.startDate} – {e.endDate}</div></div>)}
          </section>
        )}
      </main>
    </div>
  </div>
);

/* 6. Silva — Sage green sidebar, wellness/counselor style */
export const SilvaTemplate = ({ data }: Props) => (
  <div className="flex min-h-[297mm] w-[210mm] bg-white text-slate-900 font-sans text-[12px]">
    <aside className="w-[225px] bg-[#5a6e5a] text-white px-6 py-8 space-y-6">
      <Avatar src={data.photo} className="w-32 h-32 rounded-full mx-auto border-[5px] border-white/90 shadow-md" />
      <section>
        <h3 className="text-[11px] tracking-[0.25em] font-bold mb-2 text-white/90">CONTACT</h3>
        <div className="space-y-1.5 text-[11px] text-white/85">
          {data.phone && <div className="flex gap-2"><Phone className="w-3 h-3 mt-0.5 shrink-0" />{data.phone}</div>}
          {data.email && <div className="flex gap-2 break-all"><Mail className="w-3 h-3 mt-0.5 shrink-0" />{data.email}</div>}
          {data.location && <div className="flex gap-2"><MapPin className="w-3 h-3 mt-0.5 shrink-0" />{data.location}</div>}
          {data.website && <div className="flex gap-2 break-all"><Globe className="w-3 h-3 mt-0.5 shrink-0" />{data.website}</div>}
        </div>
      </section>
      {data.skills.length > 0 && (
        <section>
          <h3 className="text-[11px] tracking-[0.25em] font-bold mb-2 text-white/90">SKILLS</h3>
          <ul className="space-y-1 text-[11px] text-white/85 list-disc list-inside marker:text-white/60">{data.skills.map((s, i) => <li key={i}>{s}</li>)}</ul>
        </section>
      )}
      {data.languages.length > 0 && (
        <section>
          <h3 className="text-[11px] tracking-[0.25em] font-bold mb-2 text-white/90">LANGUAGES</h3>
          {data.languages.map(l => <div key={l.id} className="text-[11px] text-white/85">{l.name} <span className="text-white/60">· {l.level}</span></div>)}
        </section>
      )}
    </aside>
    <main className="flex-1 px-10 pt-10 pb-10">
      <h1 className="text-4xl font-bold text-[#3a4e3a] leading-tight" style={{ fontFamily: '"Georgia", serif' }}>{data.fullName || "Your Name"}</h1>
      <p className="text-[12px] tracking-[0.2em] text-slate-500 mt-1 uppercase">{data.jobTitle}</p>
      <div className="mt-3 h-[2px] w-20 bg-[#5a6e5a]" />
      {data.summary && (
        <section className="mt-6">
          <h2 className="text-[12px] tracking-[0.25em] font-bold text-[#5a6e5a] mb-2 uppercase">Professional Summary</h2>
          <p className="text-[11.5px] text-slate-700 leading-relaxed">{data.summary}</p>
        </section>
      )}
      {data.education.length > 0 && (
        <section className="mt-6">
          <h2 className="text-[12px] tracking-[0.25em] font-bold text-[#5a6e5a] mb-2 uppercase">Education</h2>
          {data.education.map(e => (
            <div key={e.id} className="mb-2 flex justify-between items-baseline">
              <div><div className="font-semibold">{e.degree} {e.field}</div><div className="text-[11px] text-slate-600">{e.school}</div></div>
              <div className="text-[10.5px] text-slate-500">{e.startDate} – {e.endDate}</div>
            </div>
          ))}
        </section>
      )}
      {data.experience.length > 0 && (
        <section className="mt-6">
          <h2 className="text-[12px] tracking-[0.25em] font-bold text-[#5a6e5a] mb-2 uppercase">Experience</h2>
          {data.experience.map(e => (
            <div key={e.id} className="mb-4">
              <div className="flex justify-between items-baseline"><h3 className="font-semibold">{e.position}</h3><span className="text-[10.5px] text-slate-500">{e.startDate} – {e.endDate}</span></div>
              <div className="text-[11px] text-[#5a6e5a]">{e.company}{e.location && ` · ${e.location}`}</div>
              <p className="text-[11.5px] text-slate-700 mt-1 leading-relaxed">{e.description}</p>
            </div>
          ))}
        </section>
      )}
    </main>
  </div>
);

/* ============================================================
 * Batch 2 of community-inspired templates
 * ========================================================== */

/* 7. Wilson — Light teal sidebar, tag chips, community manager */
export const WilsonTemplate = ({ data }: Props) => (
  <div className="flex min-h-[297mm] w-[210mm] bg-white text-slate-900 font-sans text-[12px]">
    <aside className="w-[225px] bg-[#e6eef0] px-6 py-8 space-y-6">
      <Avatar src={data.photo} className="w-32 h-32 rounded-full mx-auto border-[5px] border-white shadow-sm" />
      <section>
        <h3 className="text-[11px] tracking-[0.25em] text-[#3a5a6a] font-bold mb-2">CONTACTO</h3>
        <div className="space-y-1.5 text-[11px] text-slate-700">
          {data.phone && <div className="flex gap-2"><Phone className="w-3 h-3 mt-0.5 shrink-0 text-[#3a5a6a]" />{data.phone}</div>}
          {data.email && <div className="flex gap-2 break-all"><Mail className="w-3 h-3 mt-0.5 shrink-0 text-[#3a5a6a]" />{data.email}</div>}
          {data.location && <div className="flex gap-2"><MapPin className="w-3 h-3 mt-0.5 shrink-0 text-[#3a5a6a]" />{data.location}</div>}
          {data.website && <div className="flex gap-2 break-all"><Globe className="w-3 h-3 mt-0.5 shrink-0 text-[#3a5a6a]" />{data.website}</div>}
        </div>
      </section>
      {data.education.length > 0 && (
        <section>
          <h3 className="text-[11px] tracking-[0.25em] text-[#3a5a6a] font-bold mb-2">EDUCACIÓN</h3>
          {data.education.map(e => <div key={e.id} className="mb-2 text-[11px] text-slate-700"><div className="font-semibold">{e.school}</div><div>{e.degree} {e.field}</div><div className="text-slate-500">{e.startDate} – {e.endDate}</div></div>)}
        </section>
      )}
      {data.languages.length > 0 && (
        <section>
          <h3 className="text-[11px] tracking-[0.25em] text-[#3a5a6a] font-bold mb-2">IDIOMAS</h3>
          {data.languages.map(l => <div key={l.id} className="text-[11px] text-slate-700">{l.name} <span className="text-slate-500">· {l.level}</span></div>)}
        </section>
      )}
    </aside>
    <main className="flex-1 px-10 pt-10 pb-10">
      <div className="border-l-4 border-[#3a5a6a] pl-4">
        <h1 className="text-3xl font-bold text-slate-900 leading-tight">{data.fullName || "Your Name"}</h1>
        <p className="text-[11px] tracking-[0.3em] text-[#3a5a6a] uppercase mt-1">{data.jobTitle}</p>
      </div>
      {data.summary && <section className="mt-5"><h2 className="text-[12px] font-bold text-[#3a5a6a] uppercase tracking-widest mb-2">Perfil</h2><p className="text-[11.5px] text-slate-700 leading-relaxed">{data.summary}</p></section>}
      {data.experience.length > 0 && (
        <section className="mt-6">
          <h2 className="text-[12px] font-bold text-[#3a5a6a] uppercase tracking-widest mb-3">Experiencia Laboral</h2>
          {data.experience.map(e => (
            <div key={e.id} className="mb-4">
              <div className="font-semibold">{e.position}</div>
              <div className="text-[11px] text-[#3a5a6a]">{e.company}{e.location && ` · ${e.location}`} | {e.startDate} – {e.endDate}</div>
              <p className="text-[11.5px] text-slate-700 mt-1 leading-relaxed">{e.description}</p>
            </div>
          ))}
        </section>
      )}
      {data.skills.length > 0 && (
        <section className="mt-6">
          <h2 className="text-[12px] font-bold text-[#3a5a6a] uppercase tracking-widest mb-2">Habilidades</h2>
          <div className="flex flex-wrap gap-1.5">{data.skills.map((s, i) => <span key={i} className="text-[11px] bg-[#e6eef0] text-[#3a5a6a] px-2.5 py-1 rounded-full">{s}</span>)}</div>
        </section>
      )}
    </main>
  </div>
);

/* 8. Gallego — Marketing manager with navy section bands */
export const GallegoTemplate = ({ data }: Props) => (
  <div className="min-h-[297mm] w-[210mm] bg-white text-slate-900 font-sans text-[12px]">
    <header className="bg-[#3a5a8a] text-white px-10 py-6 flex items-center gap-5">
      <Avatar src={data.photo} className="w-20 h-20 rounded-md border-2 border-white/40 shrink-0" />
      <div>
        <h1 className="text-2xl font-bold leading-tight">{data.fullName || "Your Name"}</h1>
        <p className="text-[11px] tracking-[0.3em] uppercase text-white/85 mt-1">{data.jobTitle}</p>
      </div>
    </header>
    <div className="grid grid-cols-[210px_1fr]">
      <aside className="bg-slate-50 px-6 py-6 space-y-5">
        <section>
          <div className="bg-[#3a5a8a] text-white text-[11px] tracking-[0.25em] font-bold px-3 py-1 mb-2">CONTACTO</div>
          <div className="space-y-1 text-[11px] text-slate-700">
            {data.phone && <div className="flex gap-2"><Phone className="w-3 h-3 mt-0.5 shrink-0" />{data.phone}</div>}
            {data.email && <div className="flex gap-2 break-all"><Mail className="w-3 h-3 mt-0.5 shrink-0" />{data.email}</div>}
            {data.location && <div className="flex gap-2"><MapPin className="w-3 h-3 mt-0.5 shrink-0" />{data.location}</div>}
            {data.website && <div className="flex gap-2 break-all"><Globe className="w-3 h-3 mt-0.5 shrink-0" />{data.website}</div>}
          </div>
        </section>
        {data.skills.length > 0 && (
          <section>
            <div className="bg-[#3a5a8a] text-white text-[11px] tracking-[0.25em] font-bold px-3 py-1 mb-2">HABILIDADES</div>
            <ul className="space-y-1 text-[11px] text-slate-700 list-disc list-inside marker:text-[#3a5a8a]">{data.skills.map((s, i) => <li key={i}>{s}</li>)}</ul>
          </section>
        )}
        {data.languages.length > 0 && (
          <section>
            <div className="bg-[#3a5a8a] text-white text-[11px] tracking-[0.25em] font-bold px-3 py-1 mb-2">IDIOMAS</div>
            {data.languages.map(l => <div key={l.id} className="text-[11px] text-slate-700">{l.name} <span className="text-slate-500">· {l.level}</span></div>)}
          </section>
        )}
      </aside>
      <main className="px-9 py-6">
        {data.summary && <section className="mb-5"><div className="bg-[#3a5a8a] text-white text-[11px] tracking-[0.25em] font-bold px-3 py-1 mb-2">SOBRE MÍ</div><p className="text-[11.5px] text-slate-700 leading-relaxed">{data.summary}</p></section>}
        {data.experience.length > 0 && (
          <section className="mb-5">
            <div className="bg-[#3a5a8a] text-white text-[11px] tracking-[0.25em] font-bold px-3 py-1 mb-3">EXPERIENCIA LABORAL</div>
            {data.experience.map(e => (
              <div key={e.id} className="mb-3">
                <div className="font-semibold">{e.company}</div>
                <div className="text-[11px] text-[#3a5a8a]">{e.position} | {e.startDate} – {e.endDate}</div>
                <p className="text-[11.5px] text-slate-700 mt-1 leading-relaxed">{e.description}</p>
              </div>
            ))}
          </section>
        )}
        {data.education.length > 0 && (
          <section>
            <div className="bg-[#3a5a8a] text-white text-[11px] tracking-[0.25em] font-bold px-3 py-1 mb-3">FORMACIÓN ACADÉMICA</div>
            {data.education.map(e => <div key={e.id} className="mb-2"><div className="font-semibold">{e.school}</div><div className="text-[11px] text-slate-600">{e.degree} {e.field} · {e.startDate} – {e.endDate}</div></div>)}
          </section>
        )}
      </main>
    </div>
  </div>
);

/* 9. Zaliyanti — Swiss two-column, label on left */
export const ZaliyantiTemplate = ({ data }: Props) => (
  <div className="min-h-[297mm] w-[210mm] bg-white text-slate-900 font-sans text-[12px] px-12 py-12">
    <header className="border-b-2 border-slate-900 pb-4 mb-6">
      <h1 className="text-4xl font-extrabold tracking-tight">{(data.fullName || "Your Name").toUpperCase()}</h1>
      <div className="flex justify-between items-end mt-2">
        <p className="text-[12px] tracking-[0.3em] uppercase text-slate-600">{data.jobTitle}</p>
        <div className="text-[10.5px] text-slate-600 text-right space-y-0.5">
          {data.phone && <div>{data.phone}</div>}
          {data.email && <div>{data.email}</div>}
          {data.location && <div>{data.location}</div>}
        </div>
      </div>
    </header>
    {[
      { label: "WORK EXPERIENCE", show: data.experience.length > 0, body: (
        <div className="space-y-3">
          {data.experience.map(e => (
            <div key={e.id}>
              <div className="font-semibold">{e.position}</div>
              <div className="text-[11px] text-slate-500">{e.company}{e.location && ` · ${e.location}`} · {e.startDate} – {e.endDate}</div>
              <p className="text-[11.5px] text-slate-700 mt-1 leading-relaxed">{e.description}</p>
            </div>
          ))}
        </div>
      )},
      { label: "EDUCATION", show: data.education.length > 0, body: (
        <div className="space-y-2">
          {data.education.map(e => <div key={e.id}><div className="font-semibold">{e.degree} {e.field}</div><div className="text-[11px] text-slate-500">{e.school} · {e.startDate} – {e.endDate}</div></div>)}
        </div>
      )},
      { label: "SKILL", show: data.skills.length > 0, body: (
        <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-[11.5px] text-slate-700">{data.skills.map((s, i) => <div key={i}>{s}</div>)}</div>
      )},
      { label: "LANGUAGES", show: data.languages.length > 0, body: (
        <div className="text-[11.5px] text-slate-700">{data.languages.map(l => <span key={l.id} className="mr-4">{l.name} <span className="text-slate-500">({l.level})</span></span>)}</div>
      )},
      { label: "PROFILE", show: !!data.summary, body: <p className="text-[11.5px] text-slate-700 leading-relaxed">{data.summary}</p> },
    ].map((row, i) => row.show && (
      <div key={i} className="grid grid-cols-[160px_1fr] gap-6 py-3 border-b border-slate-200">
        <div className="text-[11px] tracking-[0.25em] font-bold text-slate-900">{row.label}</div>
        <div>{row.body}</div>
      </div>
    ))}
  </div>
);

/* 10. Choconta — Organic green leaves, botanical */
export const ChocontaTemplate = ({ data }: Props) => (
  <div className="relative min-h-[297mm] w-[210mm] bg-white text-slate-900 font-sans text-[12px] overflow-hidden">
    <svg viewBox="0 0 100 100" className="absolute -top-8 -left-8 w-56 h-56 opacity-70" preserveAspectRatio="none"><path d="M0,40 Q30,0 70,15 Q100,30 80,70 Q50,100 10,80 Q-10,60 0,40 Z" fill="#cfe0c8" /></svg>
    <svg viewBox="0 0 100 100" className="absolute -bottom-10 -right-10 w-72 h-72 opacity-70" preserveAspectRatio="none"><path d="M20,0 Q60,10 90,40 Q110,80 70,100 Q30,110 0,70 Q-10,30 20,0 Z" fill="#cfe0c8" /></svg>
    <div className="relative px-12 pt-10 pb-10">
      <header className="flex items-center gap-6 mb-6">
        <Avatar src={data.photo} className="w-28 h-28 rounded-full border-[5px] border-white shadow-md shrink-0" />
        <div>
          <h1 className="text-4xl text-[#3a5a3a]" style={{ fontFamily: '"Brush Script MT", "Snell Roundhand", cursive' }}>{data.fullName || "Your Name"}</h1>
          <p className="text-[11px] tracking-[0.3em] text-[#5a7a5a] uppercase mt-1">{data.jobTitle}</p>
        </div>
      </header>
      {data.summary && <p className="text-[11.5px] text-slate-700 leading-relaxed mb-6 max-w-[480px]">{data.summary}</p>}
      <div className="grid grid-cols-2 gap-x-10 gap-y-6">
        {[
          { label: "Contacto", show: true, body: (
            <div className="space-y-1 text-[11px] text-slate-700">
              {data.phone && <div className="flex gap-2"><Phone className="w-3 h-3 mt-0.5 text-[#5a7a5a]" />{data.phone}</div>}
              {data.email && <div className="flex gap-2 break-all"><Mail className="w-3 h-3 mt-0.5 text-[#5a7a5a]" />{data.email}</div>}
              {data.location && <div className="flex gap-2"><MapPin className="w-3 h-3 mt-0.5 text-[#5a7a5a]" />{data.location}</div>}
            </div>
          )},
          { label: "Educación", show: data.education.length > 0, body: <div>{data.education.map(e => <div key={e.id} className="mb-1.5 text-[11px]"><div className="font-semibold">{e.degree} {e.field}</div><div className="text-slate-600">{e.school} · {e.startDate} – {e.endDate}</div></div>)}</div> },
          { label: "Habilidades", show: data.skills.length > 0, body: <ul className="space-y-1 text-[11px] text-slate-700 list-disc list-inside marker:text-[#5a7a5a]">{data.skills.map((s, i) => <li key={i}>{s}</li>)}</ul> },
          { label: "Experiencia Laboral", show: data.experience.length > 0, body: <div>{data.experience.map(e => <div key={e.id} className="mb-2 text-[11px]"><div className="font-semibold">{e.position}</div><div className="text-[#5a7a5a]">{e.company}</div><div className="text-slate-500">{e.startDate} – {e.endDate}</div><p className="text-slate-700 mt-0.5 leading-relaxed">{e.description}</p></div>)}</div> },
        ].map((row, i) => row.show && (
          <section key={i}>
            <h2 className="text-[14px] text-[#3a5a3a] mb-2 pb-1 border-b border-[#a8c4a0]" style={{ fontFamily: '"Brush Script MT", "Snell Roundhand", cursive' }}>{row.label}</h2>
            {row.body}
          </section>
        ))}
      </div>
    </div>
  </div>
);

/* 11. Nasser — Mint sage sidebar with script accent */
export const NasserTemplate = ({ data }: Props) => (
  <div className="flex min-h-[297mm] w-[210mm] bg-white text-slate-900 font-sans text-[12px]">
    <aside className="w-[230px] bg-[#cfdcc8] px-6 py-8 space-y-5">
      <Avatar src={data.photo} className="w-32 h-32 rounded-full mx-auto border-[5px] border-white shadow-sm" />
      <section className="text-center">
        <h3 className="text-[12px] tracking-[0.3em] font-bold text-[#3a5a3a]">{data.jobTitle?.toUpperCase() || "PROFESSION"}</h3>
      </section>
      <section className="bg-white/60 rounded-md p-3">
        <h3 className="text-[11px] tracking-[0.25em] font-bold text-[#3a5a3a] mb-2">FORMACIÓN ACADÉMICA</h3>
        {data.education.map(e => <div key={e.id} className="mb-2 text-[11px] text-slate-700"><div className="font-semibold">{e.school}</div><div>{e.degree} {e.field}</div><div className="text-slate-500">{e.startDate} – {e.endDate}</div></div>)}
      </section>
      {data.skills.length > 0 && (
        <section className="bg-white/60 rounded-md p-3">
          <h3 className="text-[11px] tracking-[0.25em] font-bold text-[#3a5a3a] mb-2">OTROS CONOCIMIENTOS</h3>
          <ul className="space-y-1 text-[11px] text-slate-700 list-disc list-inside marker:text-[#3a5a3a]">{data.skills.map((s, i) => <li key={i}>{s}</li>)}</ul>
        </section>
      )}
      {data.languages.length > 0 && (
        <section className="bg-white/60 rounded-md p-3">
          <h3 className="text-[11px] tracking-[0.25em] font-bold text-[#3a5a3a] mb-2">IDIOMAS</h3>
          {data.languages.map(l => <div key={l.id} className="text-[11px] text-slate-700">{l.name} <span className="text-slate-500">· {l.level}</span></div>)}
        </section>
      )}
      <section className="bg-white/60 rounded-md p-3">
        <h3 className="text-[11px] tracking-[0.25em] font-bold text-[#3a5a3a] mb-2">CONTACTO</h3>
        <div className="space-y-1 text-[11px] text-slate-700">
          {data.phone && <div className="flex gap-2"><Phone className="w-3 h-3 mt-0.5 text-[#3a5a3a]" />{data.phone}</div>}
          {data.email && <div className="flex gap-2 break-all"><Mail className="w-3 h-3 mt-0.5 text-[#3a5a3a]" />{data.email}</div>}
          {data.location && <div className="flex gap-2"><MapPin className="w-3 h-3 mt-0.5 text-[#3a5a3a]" />{data.location}</div>}
        </div>
      </section>
    </aside>
    <main className="flex-1 px-9 pt-12 pb-10">
      <h1 className="text-5xl text-[#3a5a3a] leading-tight" style={{ fontFamily: '"Brush Script MT", "Snell Roundhand", cursive' }}>{data.fullName || "Your Name"}</h1>
      <div className="mt-1 h-[2px] w-32 bg-[#a8c4a0]" />
      {data.experience.length > 0 && (
        <section className="mt-7">
          <h2 className="text-[12px] tracking-[0.3em] font-bold text-[#3a5a3a] mb-3 uppercase">Experiencia Laboral</h2>
          {data.experience.map(e => (
            <div key={e.id} className="mb-4">
              <div className="font-semibold">{e.position}</div>
              <div className="text-[11px] text-[#3a5a3a]">{e.company} · {e.startDate} – {e.endDate}</div>
              <p className="text-[11.5px] text-slate-700 mt-1 leading-relaxed">{e.description}</p>
            </div>
          ))}
        </section>
      )}
      {data.summary && <section className="mt-6"><h2 className="text-[12px] tracking-[0.3em] font-bold text-[#3a5a3a] mb-2 uppercase">Sobre mí</h2><p className="text-[11.5px] text-slate-700 leading-relaxed">{data.summary}</p></section>}
    </main>
  </div>
);

/* 12. Pérez — Soft lavender sidebar, modern feminine */
export const PerezTemplate = ({ data }: Props) => (
  <div className="flex min-h-[297mm] w-[210mm] bg-white text-slate-900 font-sans text-[12px]">
    <aside className="w-[225px] bg-[#dcd2ea] px-6 py-8 space-y-6">
      <Avatar src={data.photo} className="w-28 h-28 rounded-full mx-auto border-[5px] border-white shadow-sm" />
      <section>
        <h3 className="text-[11px] tracking-[0.25em] font-bold text-[#5a3a8a] mb-2">CONTACTO</h3>
        <div className="space-y-1.5 text-[11px] text-slate-700">
          {data.phone && <div className="flex gap-2"><Phone className="w-3 h-3 mt-0.5 text-[#5a3a8a]" />{data.phone}</div>}
          {data.email && <div className="flex gap-2 break-all"><Mail className="w-3 h-3 mt-0.5 text-[#5a3a8a]" />{data.email}</div>}
          {data.location && <div className="flex gap-2"><MapPin className="w-3 h-3 mt-0.5 text-[#5a3a8a]" />{data.location}</div>}
          {data.website && <div className="flex gap-2 break-all"><Globe className="w-3 h-3 mt-0.5 text-[#5a3a8a]" />{data.website}</div>}
        </div>
      </section>
      {data.languages.length > 0 && (
        <section>
          <h3 className="text-[11px] tracking-[0.25em] font-bold text-[#5a3a8a] mb-2">IDIOMAS</h3>
          {data.languages.map(l => <div key={l.id} className="text-[11px] text-slate-700">{l.name} <span className="text-slate-500">· {l.level}</span></div>)}
        </section>
      )}
      {data.skills.length > 0 && (
        <section>
          <h3 className="text-[11px] tracking-[0.25em] font-bold text-[#5a3a8a] mb-2">HABILIDADES</h3>
          <div className="space-y-1.5">{data.skills.map((s, i) => (
            <div key={i}><div className="text-[11px] text-slate-700">{s}</div><div className="h-1 bg-white/70 rounded-full overflow-hidden"><div className="h-full bg-[#7a5aaa] rounded-full" style={{ width: `${65 + (i * 9) % 35}%` }} /></div></div>
          ))}</div>
        </section>
      )}
    </aside>
    <main className="flex-1 px-10 pt-10 pb-10">
      <div className="bg-[#dcd2ea] -mx-10 -mt-10 px-10 py-6 mb-6">
        <h1 className="text-3xl font-bold text-[#3a1a5a] leading-tight">{data.fullName || "Your Name"}</h1>
        <p className="text-[11px] tracking-[0.3em] text-[#5a3a8a] uppercase mt-1">{data.jobTitle}</p>
      </div>
      {data.summary && <section className="mb-5"><h2 className="text-[12px] tracking-[0.3em] font-bold text-[#5a3a8a] uppercase mb-2">Sobre mí</h2><p className="text-[11.5px] text-slate-700 leading-relaxed">{data.summary}</p></section>}
      {data.experience.length > 0 && (
        <section className="mb-5">
          <h2 className="text-[12px] tracking-[0.3em] font-bold text-[#5a3a8a] uppercase mb-3">Experiencia Laboral</h2>
          {data.experience.map(e => (
            <div key={e.id} className="mb-3 pl-3 border-l-2 border-[#7a5aaa]">
              <div className="font-semibold">{e.position}</div>
              <div className="text-[11px] text-[#5a3a8a]">{e.company} · {e.startDate} – {e.endDate}</div>
              <p className="text-[11.5px] text-slate-700 mt-1 leading-relaxed">{e.description}</p>
            </div>
          ))}
        </section>
      )}
      {data.education.length > 0 && (
        <section>
          <h2 className="text-[12px] tracking-[0.3em] font-bold text-[#5a3a8a] uppercase mb-3">Formación</h2>
          {data.education.map(e => <div key={e.id} className="mb-2 pl-3 border-l-2 border-[#7a5aaa]"><div className="font-semibold">{e.degree} {e.field}</div><div className="text-[11px] text-[#5a3a8a]">{e.school} · {e.startDate} – {e.endDate}</div></div>)}
        </section>
      )}
    </main>
  </div>
);

/* ============================ BATCH 3 ============================ */

export const ReyesTemplate = ({ data }: Props) => (
  <div className="min-h-[297mm] w-[210mm] bg-white text-slate-900 font-sans">
    <header className="relative bg-gradient-to-br from-[#e85d4a] to-[#c4391f] text-white px-10 pt-10 pb-16">
      <div className="flex items-center gap-6">
        <Avatar src={data.photo} className="w-28 h-28 rounded-full border-4 border-white object-cover shrink-0" />
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight">{data.fullName || "Your Name"}</h1>
          <p className="mt-1 text-white/90 uppercase tracking-[0.25em] text-xs">{data.jobTitle}</p>
        </div>
      </div>
      <svg className="absolute bottom-0 left-0 w-full" viewBox="0 0 1200 60" preserveAspectRatio="none"><path d="M0,60 L1200,60 L1200,20 Q600,60 0,20 Z" fill="white" /></svg>
    </header>
    <div className="grid grid-cols-3 gap-8 px-10 pt-4 pb-10">
      <aside className="col-span-1 space-y-6 text-sm">
        <div>
          <h3 className="text-xs uppercase tracking-widest font-bold text-[#c4391f] mb-2">Contact</h3>
          {data.email && <p className="break-all">{data.email}</p>}
          {data.phone && <p>{data.phone}</p>}
          {data.location && <p>{data.location}</p>}
          {data.website && <p className="break-all">{data.website}</p>}
        </div>
        {data.skills.length > 0 && (
          <div>
            <h3 className="text-xs uppercase tracking-widest font-bold text-[#c4391f] mb-2">Skills</h3>
            <ul className="space-y-1">{data.skills.map((s, i) => <li key={i}>• {s}</li>)}</ul>
          </div>
        )}
        {data.languages.length > 0 && (
          <div>
            <h3 className="text-xs uppercase tracking-widest font-bold text-[#c4391f] mb-2">Languages</h3>
            {data.languages.map(l => <p key={l.id}><b>{l.name}</b> · {l.level}</p>)}
          </div>
        )}
      </aside>
      <main className="col-span-2 space-y-6 text-sm">
        {data.summary && (<section><h2 className="text-base font-bold text-[#c4391f] mb-1.5 uppercase tracking-wider">Profile</h2><p className="text-slate-700 leading-relaxed">{data.summary}</p></section>)}
        {data.experience.length > 0 && (
          <section><h2 className="text-base font-bold text-[#c4391f] mb-2 uppercase tracking-wider">Experience</h2>
            {data.experience.map(e => (
              <div key={e.id} className="mb-3">
                <div className="flex justify-between"><b>{e.position}</b><span className="text-xs text-slate-500">{e.startDate} – {e.endDate}</span></div>
                <p className="text-[#c4391f] text-xs">{e.company}{e.location && ` · ${e.location}`}</p>
                <p className="text-slate-600 mt-1 leading-relaxed">{e.description}</p>
              </div>
            ))}
          </section>
        )}
        {data.education.length > 0 && (
          <section><h2 className="text-base font-bold text-[#c4391f] mb-2 uppercase tracking-wider">Education</h2>
            {data.education.map(e => (
              <div key={e.id} className="mb-2"><b>{e.degree} {e.field}</b><p className="text-xs text-slate-600">{e.school} · {e.startDate} – {e.endDate}</p></div>
            ))}
          </section>
        )}
      </main>
    </div>
  </div>
);

export const TanakaTemplate = ({ data }: Props) => (
  <div className="min-h-[297mm] w-[210mm] bg-white text-neutral-900 font-sans p-12">
    <header className="flex items-end gap-6 border-b border-neutral-200 pb-6">
      <div className="w-1 h-20 bg-[#a23b2a]" />
      <div>
        <h1 className="text-5xl font-light tracking-tight">{data.fullName || "Your Name"}</h1>
        <p className="text-neutral-500 mt-2 text-sm tracking-[0.3em] uppercase">{data.jobTitle}</p>
      </div>
    </header>
    <div className="grid grid-cols-12 gap-10 mt-8 text-sm">
      <aside className="col-span-4 space-y-6">
        <div>
          <h3 className="text-[10px] tracking-[0.3em] uppercase text-[#a23b2a] mb-2">Contact</h3>
          <div className="space-y-0.5 text-neutral-700">
            {data.email && <p className="break-all">{data.email}</p>}
            {data.phone && <p>{data.phone}</p>}
            {data.location && <p>{data.location}</p>}
            {data.website && <p className="break-all">{data.website}</p>}
          </div>
        </div>
        {data.skills.length > 0 && (
          <div><h3 className="text-[10px] tracking-[0.3em] uppercase text-[#a23b2a] mb-2">Expertise</h3>
            <div className="space-y-1 text-neutral-700">{data.skills.map((s,i)=><p key={i}>{s}</p>)}</div>
          </div>
        )}
        {data.languages.length > 0 && (
          <div><h3 className="text-[10px] tracking-[0.3em] uppercase text-[#a23b2a] mb-2">Languages</h3>
            {data.languages.map(l=><p key={l.id} className="text-neutral-700">{l.name} — {l.level}</p>)}
          </div>
        )}
      </aside>
      <main className="col-span-8 space-y-6">
        {data.summary && (<section><h2 className="text-[10px] tracking-[0.3em] uppercase text-[#a23b2a] mb-2">Profile</h2><p className="text-neutral-700 leading-relaxed">{data.summary}</p></section>)}
        {data.experience.length > 0 && (
          <section><h2 className="text-[10px] tracking-[0.3em] uppercase text-[#a23b2a] mb-3">Experience</h2>
            {data.experience.map(e=>(
              <div key={e.id} className="mb-4 pl-4 border-l border-neutral-200">
                <div className="flex justify-between"><b className="font-medium">{e.position}</b><span className="text-xs text-neutral-500">{e.startDate} – {e.endDate}</span></div>
                <p className="text-neutral-500 text-xs">{e.company}{e.location && ` · ${e.location}`}</p>
                <p className="text-neutral-700 mt-1 leading-relaxed">{e.description}</p>
              </div>
            ))}
          </section>
        )}
        {data.education.length > 0 && (
          <section><h2 className="text-[10px] tracking-[0.3em] uppercase text-[#a23b2a] mb-3">Education</h2>
            {data.education.map(e=>(<div key={e.id} className="mb-2 pl-4 border-l border-neutral-200"><b className="font-medium">{e.degree} {e.field}</b><p className="text-xs text-neutral-500">{e.school} · {e.startDate} – {e.endDate}</p></div>))}
          </section>
        )}
      </main>
    </div>
  </div>
);

export const OkonkwoTemplate = ({ data }: Props) => (
  <div className="min-h-[297mm] w-[210mm] bg-[#fdf6ee] text-stone-900 font-sans relative overflow-hidden">
    <div className="absolute top-0 right-0 w-64 h-64 bg-[#c87b4a] rounded-bl-full opacity-90" />
    <div className="absolute top-12 right-12 w-32 h-32 rounded-full border-4 border-[#fdf6ee] overflow-hidden bg-stone-200">
      <Avatar src={data.photo} className="w-full h-full object-cover" />
    </div>
    <header className="px-12 pt-16 pb-8 relative">
      <h1 className="text-5xl font-bold text-[#5a3520]">{data.fullName || "Your Name"}</h1>
      <p className="mt-1 text-[#c87b4a] tracking-widest uppercase text-sm">{data.jobTitle}</p>
    </header>
    <div className="grid grid-cols-3 gap-8 px-12 pb-12 text-sm">
      <aside className="col-span-1">
        <div className="bg-[#c87b4a]/15 p-4 rounded-lg space-y-5">
          <div>
            <h3 className="text-xs uppercase tracking-widest font-bold text-[#5a3520] mb-2">Contact</h3>
            {data.email && <p className="break-all">{data.email}</p>}
            {data.phone && <p>{data.phone}</p>}
            {data.location && <p>{data.location}</p>}
            {data.website && <p className="break-all">{data.website}</p>}
          </div>
          {data.skills.length > 0 && (
            <div>
              <h3 className="text-xs uppercase tracking-widest font-bold text-[#5a3520] mb-2">Skills</h3>
              <div className="flex flex-wrap gap-1.5">{data.skills.map((s,i)=><span key={i} className="text-xs bg-[#c87b4a] text-white px-2 py-0.5 rounded-full">{s}</span>)}</div>
            </div>
          )}
          {data.languages.length > 0 && (
            <div>
              <h3 className="text-xs uppercase tracking-widest font-bold text-[#5a3520] mb-2">Languages</h3>
              {data.languages.map(l=><p key={l.id}><b>{l.name}</b> · {l.level}</p>)}
            </div>
          )}
        </div>
      </aside>
      <main className="col-span-2 space-y-5">
        {data.summary && (<section><h2 className="text-base font-bold text-[#5a3520] mb-1 uppercase tracking-wider">About Me</h2><p className="text-stone-700 leading-relaxed">{data.summary}</p></section>)}
        {data.experience.length > 0 && (
          <section><h2 className="text-base font-bold text-[#5a3520] mb-2 uppercase tracking-wider">Experience</h2>
            {data.experience.map(e=>(
              <div key={e.id} className="mb-3 relative pl-5">
                <div className="absolute left-0 top-1.5 w-2.5 h-2.5 bg-[#c87b4a] rounded-full" />
                <div className="flex justify-between"><b>{e.position}</b><span className="text-xs text-stone-500">{e.startDate} – {e.endDate}</span></div>
                <p className="text-[#c87b4a] text-xs">{e.company}{e.location && ` · ${e.location}`}</p>
                <p className="text-stone-700 mt-1 leading-relaxed">{e.description}</p>
              </div>
            ))}
          </section>
        )}
        {data.education.length > 0 && (
          <section><h2 className="text-base font-bold text-[#5a3520] mb-2 uppercase tracking-wider">Education</h2>
            {data.education.map(e=>(<div key={e.id} className="mb-2"><b>{e.degree} {e.field}</b><p className="text-xs text-stone-600">{e.school} · {e.startDate} – {e.endDate}</p></div>))}
          </section>
        )}
      </main>
    </div>
  </div>
);

export const PetrovTemplate = ({ data }: Props) => (
  <div className="min-h-[297mm] w-[210mm] bg-[#0e1116] text-slate-100 font-sans">
    <header className="px-10 pt-10 pb-6 border-b border-cyan-500/30">
      <h1 className="text-4xl font-bold"><span className="text-cyan-400">&gt;</span> {data.fullName || "Your Name"}</h1>
      <p className="mt-1 text-cyan-400 font-mono text-sm">{data.jobTitle}</p>
    </header>
    <div className="grid grid-cols-3 gap-8 px-10 py-8 text-sm">
      <aside className="col-span-1 space-y-5">
        <div>
          <h3 className="text-xs uppercase tracking-widest font-bold text-cyan-400 mb-2">// contact</h3>
          <div className="space-y-1 text-slate-300 font-mono text-xs">
            {data.email && <p className="break-all">{data.email}</p>}
            {data.phone && <p>{data.phone}</p>}
            {data.location && <p>{data.location}</p>}
            {data.website && <p className="break-all">{data.website}</p>}
          </div>
        </div>
        {data.skills.length > 0 && (
          <div><h3 className="text-xs uppercase tracking-widest font-bold text-cyan-400 mb-2">// skills</h3>
            <div className="flex flex-wrap gap-1">{data.skills.map((s,i)=><span key={i} className="text-xs bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 px-2 py-0.5 rounded">{s}</span>)}</div>
          </div>
        )}
        {data.languages.length > 0 && (<div><h3 className="text-xs uppercase tracking-widest font-bold text-cyan-400 mb-2">// languages</h3>{data.languages.map(l=><p key={l.id} className="text-slate-300 text-xs">{l.name} — {l.level}</p>)}</div>)}
      </aside>
      <main className="col-span-2 space-y-5">
        {data.summary && (<section><h2 className="text-base font-bold text-cyan-400 mb-1">// profile</h2><p className="text-slate-300 leading-relaxed">{data.summary}</p></section>)}
        {data.experience.length > 0 && (
          <section><h2 className="text-base font-bold text-cyan-400 mb-2">// experience</h2>
            {data.experience.map(e=>(
              <div key={e.id} className="mb-3 border-l-2 border-cyan-500/40 pl-3">
                <div className="flex justify-between"><b className="text-slate-100">{e.position}</b><span className="text-xs text-slate-500 font-mono">{e.startDate} – {e.endDate}</span></div>
                <p className="text-cyan-400 text-xs font-mono">{e.company}{e.location && ` · ${e.location}`}</p>
                <p className="text-slate-300 mt-1 leading-relaxed">{e.description}</p>
              </div>
            ))}
          </section>
        )}
        {data.education.length > 0 && (
          <section><h2 className="text-base font-bold text-cyan-400 mb-2">// education</h2>
            {data.education.map(e=>(<div key={e.id} className="mb-2 border-l-2 border-cyan-500/40 pl-3"><b>{e.degree} {e.field}</b><p className="text-xs text-slate-400 font-mono">{e.school} · {e.startDate} – {e.endDate}</p></div>))}
          </section>
        )}
      </main>
    </div>
  </div>
);

export const DuboisTemplate = ({ data }: Props) => (
  <div className="min-h-[297mm] w-[210mm] bg-[#fbf9f4] text-stone-800 font-serif p-12">
    <header className="text-center pb-6 border-b-2 border-[#b8924a]">
      <h1 className="text-5xl font-light tracking-wide">{data.fullName || "Your Name"}</h1>
      <p className="mt-3 text-[#b8924a] italic tracking-[0.3em] uppercase text-xs">{data.jobTitle}</p>
      <div className="mt-4 flex justify-center gap-4 text-xs text-stone-600">
        {data.email && <span>{data.email}</span>}
        {data.phone && <span>· {data.phone}</span>}
        {data.location && <span>· {data.location}</span>}
        {data.website && <span>· {data.website}</span>}
      </div>
    </header>
    <main className="mt-8 space-y-6 text-sm">
      {data.summary && (
        <section><h2 className="text-center text-[#b8924a] tracking-[0.3em] uppercase text-xs mb-2">— Profile —</h2><p className="text-stone-700 leading-relaxed text-center italic max-w-2xl mx-auto">{data.summary}</p></section>
      )}
      {data.experience.length > 0 && (
        <section><h2 className="text-center text-[#b8924a] tracking-[0.3em] uppercase text-xs mb-3">— Experience —</h2>
          {data.experience.map(e=>(
            <div key={e.id} className="mb-4 text-center">
              <h3 className="font-semibold text-lg">{e.position}</h3>
              <p className="text-[#b8924a] italic">{e.company}{e.location && ` · ${e.location}`} <span className="text-stone-500">· {e.startDate} – {e.endDate}</span></p>
              <p className="text-stone-700 mt-1.5 leading-relaxed max-w-2xl mx-auto">{e.description}</p>
            </div>
          ))}
        </section>
      )}
      {data.education.length > 0 && (
        <section><h2 className="text-center text-[#b8924a] tracking-[0.3em] uppercase text-xs mb-3">— Education —</h2>
          {data.education.map(e=>(<div key={e.id} className="mb-2 text-center"><b>{e.degree} {e.field}</b><p className="text-stone-600 italic">{e.school} · {e.startDate} – {e.endDate}</p></div>))}
        </section>
      )}
      <div className="grid grid-cols-2 gap-8">
        {data.skills.length > 0 && (<section><h2 className="text-center text-[#b8924a] tracking-[0.3em] uppercase text-xs mb-2">— Skills —</h2><p className="text-center text-stone-700">{data.skills.join(" · ")}</p></section>)}
        {data.languages.length > 0 && (<section><h2 className="text-center text-[#b8924a] tracking-[0.3em] uppercase text-xs mb-2">— Languages —</h2><p className="text-center text-stone-700">{data.languages.map(l=>`${l.name} (${l.level})`).join(" · ")}</p></section>)}
      </div>
    </main>
  </div>
);

export const HassanTemplate = ({ data }: Props) => (
  <div className="min-h-[297mm] w-[210mm] bg-[#f6efe5] text-stone-900 font-sans relative overflow-hidden">
    <div className="absolute top-0 left-0 right-0 h-72 bg-gradient-to-b from-[#d9c4a3] to-transparent" style={{ borderBottomLeftRadius: "50% 30%", borderBottomRightRadius: "50% 30%" }} />
    <header className="relative pt-12 px-10 text-center">
      <Avatar src={data.photo} className="w-32 h-32 rounded-full mx-auto border-4 border-white object-cover shadow-lg" />
      <h1 className="text-4xl font-bold mt-4 text-[#6b4f2c]">{data.fullName || "Your Name"}</h1>
      <p className="text-[#a07b48] mt-1 tracking-widest uppercase text-xs">{data.jobTitle}</p>
    </header>
    <div className="grid grid-cols-3 gap-8 px-10 py-10 text-sm">
      <aside className="col-span-1 space-y-5">
        <div>
          <h3 className="text-xs uppercase tracking-widest font-bold text-[#6b4f2c] mb-2 border-b border-[#d9c4a3] pb-1">Contact</h3>
          {data.email && <p className="break-all">{data.email}</p>}
          {data.phone && <p>{data.phone}</p>}
          {data.location && <p>{data.location}</p>}
          {data.website && <p className="break-all">{data.website}</p>}
        </div>
        {data.skills.length > 0 && (<div><h3 className="text-xs uppercase tracking-widest font-bold text-[#6b4f2c] mb-2 border-b border-[#d9c4a3] pb-1">Skills</h3><ul className="space-y-1">{data.skills.map((s,i)=><li key={i}>· {s}</li>)}</ul></div>)}
        {data.languages.length > 0 && (<div><h3 className="text-xs uppercase tracking-widest font-bold text-[#6b4f2c] mb-2 border-b border-[#d9c4a3] pb-1">Languages</h3>{data.languages.map(l=><p key={l.id}><b>{l.name}</b> · {l.level}</p>)}</div>)}
      </aside>
      <main className="col-span-2 space-y-5">
        {data.summary && (<section><h2 className="text-base font-bold text-[#6b4f2c] mb-1 uppercase tracking-wider border-b border-[#d9c4a3] pb-1">Profile</h2><p className="text-stone-700 leading-relaxed mt-1.5">{data.summary}</p></section>)}
        {data.experience.length > 0 && (
          <section><h2 className="text-base font-bold text-[#6b4f2c] mb-2 uppercase tracking-wider border-b border-[#d9c4a3] pb-1">Experience</h2>
            {data.experience.map(e=>(
              <div key={e.id} className="mb-3 mt-2">
                <div className="flex justify-between"><b>{e.position}</b><span className="text-xs text-stone-500">{e.startDate} – {e.endDate}</span></div>
                <p className="text-[#a07b48] text-xs italic">{e.company}{e.location && ` · ${e.location}`}</p>
                <p className="text-stone-700 mt-1 leading-relaxed">{e.description}</p>
              </div>
            ))}
          </section>
        )}
        {data.education.length > 0 && (
          <section><h2 className="text-base font-bold text-[#6b4f2c] mb-2 uppercase tracking-wider border-b border-[#d9c4a3] pb-1">Education</h2>
            {data.education.map(e=>(<div key={e.id} className="mb-2 mt-2"><b>{e.degree} {e.field}</b><p className="text-xs text-stone-600 italic">{e.school} · {e.startDate} – {e.endDate}</p></div>))}
          </section>
        )}
      </main>
    </div>
  </div>
);

/* ============================ BATCH 4 ============================ */

export const KovacsTemplate = ({ data }: Props) => (
  <div className="min-h-[297mm] w-[210mm] bg-white text-slate-900 font-sans">
    <div className="grid grid-cols-12">
      <aside className="col-span-5 bg-[#1c1c1c] text-white p-8 min-h-[297mm]">
        <Avatar src={data.photo} className="w-36 h-36 rounded-none object-cover mb-6" />
        <h1 className="text-3xl font-black uppercase leading-none">{data.fullName || "Your Name"}</h1>
        <div className="w-12 h-1 bg-[#ffd23f] my-3" />
        <p className="text-[#ffd23f] uppercase tracking-[0.25em] text-xs">{data.jobTitle}</p>

        <div className="mt-8 space-y-5 text-sm">
          <div>
            <h3 className="text-[#ffd23f] uppercase text-xs tracking-widest font-bold mb-2">Contact</h3>
            <div className="space-y-1 text-white/80">
              {data.email && <p className="break-all">{data.email}</p>}
              {data.phone && <p>{data.phone}</p>}
              {data.location && <p>{data.location}</p>}
              {data.website && <p className="break-all">{data.website}</p>}
            </div>
          </div>
          {data.skills.length > 0 && (
            <div>
              <h3 className="text-[#ffd23f] uppercase text-xs tracking-widest font-bold mb-2">Skills</h3>
              <ul className="space-y-1 text-white/80">{data.skills.map((s, i) => <li key={i}>— {s}</li>)}</ul>
            </div>
          )}
          {data.languages.length > 0 && (
            <div>
              <h3 className="text-[#ffd23f] uppercase text-xs tracking-widest font-bold mb-2">Languages</h3>
              {data.languages.map(l => <p key={l.id} className="text-white/80"><b className="text-white">{l.name}</b> · {l.level}</p>)}
            </div>
          )}
        </div>
      </aside>
      <main className="col-span-7 p-9 text-sm">
        {data.summary && (
          <section className="mb-6">
            <h2 className="text-2xl font-black uppercase">About</h2>
            <div className="w-12 h-1 bg-[#1c1c1c] my-2" />
            <p className="text-slate-700 leading-relaxed">{data.summary}</p>
          </section>
        )}
        {data.experience.length > 0 && (
          <section className="mb-6">
            <h2 className="text-2xl font-black uppercase">Experience</h2>
            <div className="w-12 h-1 bg-[#1c1c1c] my-2" />
            {data.experience.map(e => (
              <div key={e.id} className="mb-4">
                <div className="flex justify-between items-baseline">
                  <b className="uppercase">{e.position}</b>
                  <span className="text-xs text-slate-500">{e.startDate} – {e.endDate}</span>
                </div>
                <p className="text-[#c19400] text-xs font-bold uppercase tracking-wider">{e.company}{e.location && ` · ${e.location}`}</p>
                <p className="text-slate-700 mt-1.5 leading-relaxed">{e.description}</p>
              </div>
            ))}
          </section>
        )}
        {data.education.length > 0 && (
          <section>
            <h2 className="text-2xl font-black uppercase">Education</h2>
            <div className="w-12 h-1 bg-[#1c1c1c] my-2" />
            {data.education.map(e => (
              <div key={e.id} className="mb-2">
                <b className="uppercase">{e.degree} {e.field}</b>
                <p className="text-xs text-slate-600">{e.school} · {e.startDate} – {e.endDate}</p>
              </div>
            ))}
          </section>
        )}
      </main>
    </div>
  </div>
);

export const LeclercTemplate = ({ data }: Props) => (
  <div className="min-h-[297mm] w-[210mm] bg-[#fafaf7] text-slate-900 font-serif p-12">
    <header className="flex items-center gap-8 pb-6 border-b border-[#7a8c6f]/40">
      <Avatar src={data.photo} className="w-28 h-28 rounded-full object-cover ring-4 ring-[#7a8c6f]/30" />
      <div className="flex-1">
        <h1 className="text-4xl font-light tracking-wide">{data.fullName || "Your Name"}</h1>
        <p className="text-[#7a8c6f] italic mt-1">{data.jobTitle}</p>
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-slate-600 font-sans">
          {data.email && <span>{data.email}</span>}
          {data.phone && <span>· {data.phone}</span>}
          {data.location && <span>· {data.location}</span>}
          {data.website && <span>· {data.website}</span>}
        </div>
      </div>
    </header>
    <div className="grid grid-cols-3 gap-10 mt-8 text-sm font-sans">
      <main className="col-span-2 space-y-6">
        {data.summary && (
          <section>
            <h2 className="font-serif text-xl text-[#7a8c6f] mb-1.5 italic">Profile</h2>
            <p className="text-slate-700 leading-relaxed">{data.summary}</p>
          </section>
        )}
        {data.experience.length > 0 && (
          <section>
            <h2 className="font-serif text-xl text-[#7a8c6f] mb-2 italic">Experience</h2>
            {data.experience.map(e => (
              <div key={e.id} className="mb-4">
                <div className="flex justify-between items-baseline">
                  <b className="font-serif text-base">{e.position}</b>
                  <span className="text-xs text-slate-500">{e.startDate} – {e.endDate}</span>
                </div>
                <p className="text-[#7a8c6f] italic text-xs">{e.company}{e.location && ` · ${e.location}`}</p>
                <p className="text-slate-700 mt-1 leading-relaxed">{e.description}</p>
              </div>
            ))}
          </section>
        )}
        {data.education.length > 0 && (
          <section>
            <h2 className="font-serif text-xl text-[#7a8c6f] mb-2 italic">Education</h2>
            {data.education.map(e => (
              <div key={e.id} className="mb-2">
                <b className="font-serif">{e.degree} {e.field}</b>
                <p className="text-xs text-slate-600 italic">{e.school} · {e.startDate} – {e.endDate}</p>
              </div>
            ))}
          </section>
        )}
      </main>
      <aside className="col-span-1 space-y-5">
        {data.skills.length > 0 && (
          <div>
            <h3 className="font-serif text-lg text-[#7a8c6f] mb-2 italic">Skills</h3>
            <ul className="space-y-1 text-slate-700">{data.skills.map((s, i) => <li key={i}>— {s}</li>)}</ul>
          </div>
        )}
        {data.languages.length > 0 && (
          <div>
            <h3 className="font-serif text-lg text-[#7a8c6f] mb-2 italic">Languages</h3>
            {data.languages.map(l => <p key={l.id} className="text-slate-700"><b>{l.name}</b> · <span className="italic">{l.level}</span></p>)}
          </div>
        )}
      </aside>
    </div>
  </div>
);

/* ============================ BATCH 5 ============================ */

export const MendezTemplate = ({ data }: Props) => (
  <div className="min-h-[297mm] w-[210mm] bg-white text-black font-sans flex">
    <aside className="w-[34%] bg-black text-white p-7 flex flex-col">
      <Avatar src={data.photo} className="w-36 h-36 rounded-full object-cover mx-auto border-4 border-white mb-8" />
      <div className="space-y-7 text-sm">
        <div>
          <h3 className="text-base font-semibold flex items-center gap-2 mb-3">📞 Contacto</h3>
          <div className="space-y-1 text-white/90">
            {data.phone && <p>{data.phone}</p>}
            {data.email && <p className="break-all">{data.email}</p>}
            {data.website && <p className="break-all">{data.website}</p>}
            {data.location && <p className="pt-1 leading-snug">{data.location}</p>}
          </div>
        </div>
        {data.education.length > 0 && (
          <div>
            <h3 className="text-base font-semibold flex items-center gap-2 mb-3">🎓 Formación</h3>
            {data.education.map(e => (
              <div key={e.id} className="mb-3">
                <p className="font-bold">{e.school}</p>
                <p className="italic text-white/80 text-xs">{e.degree} {e.field}</p>
                <p className="text-white/70 text-xs">{e.startDate} – {e.endDate}</p>
              </div>
            ))}
          </div>
        )}
        {data.skills.length > 0 && (
          <div>
            <h3 className="text-base font-semibold flex items-center gap-2 mb-3">⚙ Habilidades</h3>
            <ul className="space-y-1 text-white/90">{data.skills.map((s, i) => <li key={i}>• {s}</li>)}</ul>
          </div>
        )}
      </div>
    </aside>
    <main className="flex-1 p-9">
      <header className="mb-6">
        <h1 className="text-5xl font-extrabold uppercase leading-none tracking-tight">{(data.fullName || "Your Name").split(" ").map((w, i, arr) => <span key={i}>{w}{i < arr.length - 1 && <br />}</span>)}</h1>
        {data.jobTitle && <div className="mt-3 inline-block bg-black text-white px-4 py-1.5 text-xs tracking-[0.25em] uppercase">{data.jobTitle}</div>}
      </header>
      <div className="border-l-2 border-black/20 pl-5 space-y-6 text-sm">
        {data.summary && (
          <section><h2 className="text-lg font-bold mb-1.5 flex items-center gap-2"><span className="w-5 h-5 rounded-full bg-black text-white inline-flex items-center justify-center text-[10px]">i</span> Perfil Personal</h2><p className="text-neutral-700 leading-relaxed">{data.summary}</p></section>
        )}
        {data.experience.length > 0 && (
          <section><h2 className="text-lg font-bold mb-2 flex items-center gap-2"><span className="w-5 h-5 rounded-full bg-black text-white inline-flex items-center justify-center text-[10px]">▣</span> Experiencia Laboral</h2>
            {data.experience.map(e => (
              <div key={e.id} className="mb-4">
                <p className="uppercase tracking-wider text-sm">{e.position}</p>
                <p className="italic font-semibold">• {e.company} <span className="font-normal">({e.startDate} – {e.endDate})</span></p>
                <p className="text-neutral-700 mt-1 leading-relaxed">{e.description}</p>
              </div>
            ))}
          </section>
        )}
        {data.languages.length > 0 && (
          <section><h2 className="text-lg font-bold mb-2 flex items-center gap-2"><span className="w-5 h-5 rounded-full bg-black text-white inline-flex items-center justify-center text-[10px]">🌐</span> Idiomas</h2>
            <ul className="space-y-0.5 pl-4">{data.languages.map(l => <li key={l.id}>• {l.name} {l.level}</li>)}</ul>
          </section>
        )}
      </div>
    </main>
  </div>
);

export const NavarroProTemplate = ({ data }: Props) => (
  <div className="min-h-[297mm] w-[210mm] bg-white text-slate-900 font-sans p-4">
    <div className="grid grid-cols-12 gap-5 h-full">
      <aside className="col-span-5 bg-[#243a55] text-white rounded-2xl p-7 relative overflow-hidden">
        <div className="bg-white/10 rounded-2xl p-2 mb-4">
          <Avatar src={data.photo} className="w-full aspect-square rounded-xl object-cover" />
        </div>
        <h1 className="text-4xl font-light leading-tight">{(data.fullName || "Your Name").split(" ").map((w, i) => <div key={i} className={i === 0 ? "" : "font-bold"}>{w}</div>)}</h1>
        {data.jobTitle && <div className="mt-3 inline-block bg-white text-[#243a55] px-3 py-1 rounded-full text-[10px] tracking-[0.25em] uppercase font-semibold">{data.jobTitle}</div>}
        <div className="mt-7 space-y-5 text-sm">
          <div>
            <h3 className="uppercase tracking-widest font-bold text-base mb-2">Contacto</h3>
            <div className="space-y-1.5 text-white/90 text-xs">
              {data.phone && <p>📞 {data.phone}</p>}
              {data.email && <p className="break-all">✉ {data.email}</p>}
              {data.website && <p className="break-all">🌐 {data.website}</p>}
              {data.location && <p>📍 {data.location}</p>}
            </div>
          </div>
          {data.languages.length > 0 && (
            <div>
              <h3 className="uppercase tracking-widest font-bold text-base mb-2">Idiomas</h3>
              {data.languages.map(l => <p key={l.id} className="text-xs"><b className="uppercase">{l.name}</b> · {l.level}</p>)}
            </div>
          )}
        </div>
      </aside>
      <main className="col-span-7 space-y-3 text-sm">
        {data.summary && (
          <section>
            <div className="bg-[#243a55] text-white rounded-r-full px-4 py-1.5 inline-block min-w-[60%]"><h2 className="font-bold tracking-wider uppercase text-sm">Mi Perfil</h2></div>
            <p className="text-slate-700 leading-relaxed mt-2 px-1">{data.summary}</p>
          </section>
        )}
        {data.experience.length > 0 && (
          <section>
            <div className="bg-[#243a55] text-white rounded-r-full px-4 py-1.5 inline-block min-w-[60%]"><h2 className="font-bold tracking-wider uppercase text-sm">Experiencia</h2></div>
            <div className="mt-2 px-1">
              {data.experience.map(e => (
                <div key={e.id} className="mb-3">
                  <p className="font-bold uppercase text-xs tracking-wider">{e.position}</p>
                  <p className="italic font-semibold">{e.company} ({e.startDate} – {e.endDate})</p>
                  <p className="text-slate-700 mt-0.5 leading-relaxed">{e.description}</p>
                </div>
              ))}
            </div>
          </section>
        )}
        {data.education.length > 0 && (
          <section>
            <div className="bg-[#243a55] text-white rounded-r-full px-4 py-1.5 inline-block min-w-[60%]"><h2 className="font-bold tracking-wider uppercase text-sm">Formación</h2></div>
            <div className="mt-2 px-1">
              {data.education.map(e => (
                <div key={e.id} className="mb-2">
                  <p className="font-bold uppercase text-xs">{e.school}</p>
                  <p className="text-xs">({e.startDate} – {e.endDate})</p>
                  <p className="text-slate-700 text-xs">{e.degree} {e.field}</p>
                </div>
              ))}
            </div>
          </section>
        )}
        {data.skills.length > 0 && (
          <section>
            <div className="bg-[#243a55] text-white rounded-r-full px-4 py-1.5 inline-block min-w-[60%]"><h2 className="font-bold tracking-wider uppercase text-sm">Herramientas</h2></div>
            <div className="mt-2 px-1 space-y-1">
              {data.skills.slice(0, 6).map((s, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="uppercase text-xs font-semibold w-32 shrink-0">{s}</span>
                  <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-[#243a55]" style={{ width: `${70 + ((i * 17) % 25)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  </div>
);

export const GrassoTemplate = ({ data }: Props) => (
  <div className="min-h-[297mm] w-[210mm] bg-gradient-to-br from-[#fdf3f0] via-white to-[#fce5e0] text-stone-900 font-serif">
    <div className="grid grid-cols-12 border-b border-stone-300">
      <div className="col-span-4 bg-stone-100">
        <Avatar src={data.photo} className="w-full h-64 object-cover" />
      </div>
      <div className="col-span-8 p-8 flex flex-col justify-center">
        <p className="italic text-3xl text-stone-700">Ciao, sono</p>
        <h1 className="text-5xl font-light italic leading-tight mt-1">{data.fullName || "Your Name"}</h1>
        <div className="mt-5 pt-4 border-t border-stone-300 font-sans">
          <p className="text-base">{data.jobTitle}</p>
          {data.summary && <p className="text-xs uppercase tracking-wider font-bold mt-1">{data.summary.slice(0, 80)}</p>}
        </div>
      </div>
    </div>
    <div className="grid grid-cols-12 min-h-[calc(297mm-16rem)]">
      <aside className="col-span-4 p-7 font-sans text-sm space-y-6">
        <div className="inline-block px-4 py-1.5 border border-stone-400 rounded-full text-xs tracking-wider">EUROPEAN CV</div>
        <div>
          <h3 className="font-serif italic text-2xl mb-2">Dati personali</h3>
          <div className="space-y-2 text-xs">
            {data.location && (<div><p className="font-bold uppercase">Indirizzo</p><p>{data.location}</p></div>)}
            {data.phone && (<div><p className="font-bold uppercase">Cell</p><p>{data.phone}</p></div>)}
            {data.email && (<div><p className="font-bold uppercase">Mail</p><p className="break-all">{data.email}</p></div>)}
            {data.website && (<div><p className="font-bold uppercase">Web</p><p className="break-all">{data.website}</p></div>)}
          </div>
        </div>
        {data.languages.length > 0 && (
          <div>
            <p className="font-bold uppercase text-xs mb-1">Lingue</p>
            {data.languages.map(l => <p key={l.id} className="text-xs">{l.name} — {l.level}</p>)}
          </div>
        )}
        <div className="pt-4">
          <p className="font-bold uppercase text-xs">A lavoro</p>
          <p className="font-bold uppercase text-xs">dico sempre:</p>
          <p className="font-serif italic text-xl mt-3 leading-snug">"Il talento vince le partite, ma il lavoro di squadra vince i campionati."</p>
        </div>
      </aside>
      <main className="col-span-8 border-l border-stone-300 p-7 space-y-5">
        {data.summary && (
          <section className="font-sans text-sm">
            <p className="text-stone-700 leading-relaxed">{data.summary}</p>
          </section>
        )}
        {data.experience.length > 0 && (
          <section className="border-t border-stone-300 pt-4">
            <h2 className="font-serif italic text-2xl mb-2">Esperienze professionali:</h2>
            <div className="font-sans text-sm space-y-3">
              {data.experience.map(e => (
                <div key={e.id}>
                  <p className="font-bold uppercase text-xs">{e.position}</p>
                  <p className="text-xs text-stone-600">{e.company}{e.location && ` (${e.location})`} · {e.startDate} – {e.endDate}</p>
                  <p className="text-stone-700 mt-0.5 text-xs leading-relaxed">{e.description}</p>
                </div>
              ))}
            </div>
          </section>
        )}
        {data.skills.length > 0 && (
          <section className="border-t border-stone-300 pt-4">
            <h2 className="font-serif italic text-2xl mb-2">Competenze Principali</h2>
            <ul className="font-sans text-sm list-disc pl-5 space-y-0.5">{data.skills.map((s, i) => <li key={i}>{s}</li>)}</ul>
          </section>
        )}
        {data.education.length > 0 && (
          <section className="border-t border-stone-300 pt-4">
            <h2 className="font-serif italic text-2xl mb-2">Formazione</h2>
            <div className="font-sans text-sm space-y-2">
              {data.education.map(e => (
                <div key={e.id}>
                  <p className="font-bold uppercase text-xs">{e.degree} {e.field}</p>
                  <p className="text-xs text-stone-600">{e.school} · {e.startDate} – {e.endDate}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  </div>
);

/* ============================ BATCH 6 ============================ */

export const GibbonsTemplate = ({ data }: Props) => (
  <div className="min-h-[297mm] w-[210mm] bg-[#f5f7fa] text-slate-900 font-sans relative overflow-hidden">
    <div className="absolute top-0 right-0 w-44 h-44 rounded-full border-8 border-[#dbe6f0] opacity-60 -translate-y-12 translate-x-12" />
    <div className="absolute bottom-10 right-6 w-40 h-40 rounded-full border-8 border-[#dbe6f0] opacity-60" />
    <header className="bg-[#1f3b5c] text-white px-8 py-5 flex items-center gap-5 relative z-10">
      <Avatar src={data.photo} className="w-20 h-20 rounded-full object-cover border-2 border-white" />
      <div>
        <h1 className="text-3xl font-bold">{data.fullName || "Your Name"}</h1>
        <p className="text-[#bcd0e6] text-sm mt-1">{data.jobTitle}</p>
      </div>
    </header>
    <div className="grid grid-cols-12 gap-6 p-7 relative z-10">
      <aside className="col-span-5 space-y-5 text-sm">
        {data.summary && (
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <h3 className="font-bold text-[#1f3b5c] mb-1">About Me</h3>
            <p className="text-slate-700 text-xs leading-relaxed">{data.summary}</p>
          </div>
        )}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <h3 className="font-bold text-[#1f3b5c] mb-2">Contact</h3>
          <div className="space-y-1 text-xs text-slate-700">
            {data.phone && <p>📞 {data.phone}</p>}
            {data.email && <p className="break-all">✉ {data.email}</p>}
            {data.location && <p>📍 {data.location}</p>}
            {data.website && <p className="break-all">🌐 {data.website}</p>}
          </div>
        </div>
        {data.languages.length > 0 && (
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <h3 className="font-bold text-[#1f3b5c] mb-2">Lingue</h3>
            {data.languages.map(l => (
              <div key={l.id} className="mb-1.5">
                <p className="text-xs"><b>{l.name}</b> · {l.level}</p>
              </div>
            ))}
          </div>
        )}
        {data.skills.length > 0 && (
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <h3 className="font-bold text-[#1f3b5c] mb-2">Competenze tecniche</h3>
            <ul className="space-y-1 text-xs text-slate-700">{data.skills.map((s, i) => <li key={i}>• {s}</li>)}</ul>
          </div>
        )}
      </aside>
      <main className="col-span-7 space-y-5 text-sm">
        {data.experience.length > 0 && (
          <section>
            <h2 className="text-lg font-bold text-[#1f3b5c] mb-2 border-b-2 border-[#1f3b5c] pb-1">Experience</h2>
            {data.experience.map(e => (
              <div key={e.id} className="mb-3">
                <p className="font-bold">{e.position}</p>
                <p className="text-[#1f3b5c] text-xs italic">{e.company}{e.location && ` · ${e.location}`} — {e.startDate} – {e.endDate}</p>
                <p className="text-slate-700 text-xs mt-1 leading-relaxed">{e.description}</p>
              </div>
            ))}
          </section>
        )}
        {data.education.length > 0 && (
          <section>
            <h2 className="text-lg font-bold text-[#1f3b5c] mb-2 border-b-2 border-[#1f3b5c] pb-1">Education</h2>
            {data.education.map(e => (
              <div key={e.id} className="mb-2">
                <p className="font-bold text-sm">{e.school}</p>
                <p className="text-xs italic text-slate-600">{e.degree} {e.field} · {e.startDate} – {e.endDate}</p>
              </div>
            ))}
          </section>
        )}
      </main>
    </div>
  </div>
);

export const GallegoProTemplate = ({ data }: Props) => (
  <div className="min-h-[297mm] w-[210mm] bg-white text-slate-900 font-sans">
    <header className="bg-[#cfd5db] px-9 py-7 flex items-center gap-7">
      <Avatar src={data.photo} className="w-32 h-32 rounded-full object-cover border-4 border-white" />
      <div className="flex-1">
        <h1 className="text-5xl font-extrabold tracking-tight uppercase">{(data.fullName || "Your Name")}</h1>
        <p className="text-slate-700 text-sm tracking-[0.3em] uppercase mt-1">{data.jobTitle}</p>
      </div>
    </header>
    <div className="grid grid-cols-12 gap-7 px-9 py-7">
      <aside className="col-span-4 space-y-5 text-xs">
        {data.summary && (
          <div>
            <h3 className="font-bold text-[#5b8da3] uppercase tracking-wider mb-1.5">Su di me</h3>
            <p className="text-slate-700 leading-relaxed">{data.summary}</p>
          </div>
        )}
        <div>
          <h3 className="font-bold text-[#5b8da3] uppercase tracking-wider mb-1.5">Età</h3>
          <p>30 anni</p>
        </div>
        <div>
          <h3 className="font-bold text-[#5b8da3] uppercase tracking-wider mb-1.5">Residenza</h3>
          <p>{data.location}</p>
        </div>
        <div>
          <h3 className="font-bold text-[#5b8da3] uppercase tracking-wider mb-1.5">Numero telefonico</h3>
          <p>{data.phone}</p>
        </div>
        <div>
          <h3 className="font-bold text-[#5b8da3] uppercase tracking-wider mb-1.5">Indirizzo posta elettronica</h3>
          <p className="break-all">{data.email}</p>
          {data.website && <p className="break-all mt-1">{data.website}</p>}
        </div>
      </aside>
      <main className="col-span-8 space-y-5 text-sm">
        {data.experience.length > 0 && (
          <section>
            <h2 className="text-base font-bold text-[#5b8da3] uppercase tracking-wider mb-2">Esperienze lavorative</h2>
            {data.experience.map(e => (
              <div key={e.id} className="mb-3 pl-4 border-l-2 border-slate-200">
                <p className="font-bold text-xs">{e.position} · {e.company}</p>
                <p className="text-slate-500 text-xs italic">{e.startDate} – {e.endDate}</p>
                <p className="text-slate-700 text-xs mt-1 leading-relaxed">{e.description}</p>
              </div>
            ))}
          </section>
        )}
        {data.skills.length > 0 && (
          <section>
            <h2 className="text-base font-bold text-[#5b8da3] uppercase tracking-wider mb-2">Hard skills</h2>
            <div className="grid grid-cols-2 gap-x-5 gap-y-1.5">
              {data.skills.map((s, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#5b8da3]" />
                  <span className="text-xs">{s}</span>
                </div>
              ))}
            </div>
          </section>
        )}
        {data.education.length > 0 && (
          <section>
            <h2 className="text-base font-bold text-[#5b8da3] uppercase tracking-wider mb-2">Esperienze formative</h2>
            {data.education.map(e => (
              <div key={e.id} className="mb-2 pl-4 border-l-2 border-slate-200">
                <p className="font-bold text-xs">{e.school}</p>
                <p className="text-xs italic text-slate-600">{e.degree} {e.field} · {e.startDate} – {e.endDate}</p>
              </div>
            ))}
          </section>
        )}
      </main>
    </div>
  </div>
);

export const MaeEvansTemplate = ({ data }: Props) => (
  <div className="min-h-[297mm] w-[210mm] bg-[#f4ead8] text-stone-900 font-serif p-10">
    <header className="grid grid-cols-12 gap-6 items-center pb-4 border-b border-stone-400">
      <div className="col-span-3">
        <Avatar src={data.photo} className="w-32 h-32 rounded-full object-cover border-4 border-white mx-auto" />
      </div>
      <div className="col-span-9">
        <h1 className="text-5xl font-bold leading-tight">{data.fullName || "Your Name"}</h1>
        <p className="text-stone-600 italic mt-1">{data.jobTitle}</p>
      </div>
    </header>
    <div className="grid grid-cols-12 gap-8 mt-6 text-sm">
      <aside className="col-span-3 space-y-5 font-sans">
        <div>
          <h3 className="font-bold mb-2 text-base">Contatti</h3>
          <div className="space-y-1 text-xs">
            {data.phone && <p>📞 {data.phone}</p>}
            {data.email && <p className="break-all">✉ {data.email}</p>}
            {data.website && <p className="break-all">🌐 {data.website}</p>}
            {data.location && <p>📍 {data.location}</p>}
          </div>
        </div>
        {data.languages.length > 0 && (
          <div>
            <h3 className="font-bold mb-2 text-base">Lingue</h3>
            {data.languages.map(l => (
              <div key={l.id} className="text-xs mb-1"><b>{l.name}</b> — {l.level}</div>
            ))}
          </div>
        )}
        {data.skills.length > 0 && (
          <div>
            <h3 className="font-bold mb-2 text-base">Capacità relazionali e organizzative</h3>
            <ul className="space-y-1 text-xs">{data.skills.map((s, i) => <li key={i}>· {s}</li>)}</ul>
          </div>
        )}
      </aside>
      <main className="col-span-9 space-y-5 border-l border-stone-400 pl-7">
        {data.summary && (
          <section className="font-sans"><p className="text-stone-700 leading-relaxed text-sm">{data.summary}</p></section>
        )}
        {data.experience.length > 0 && (
          <section>
            <h2 className="text-2xl font-semibold mb-2 border-b border-stone-300 pb-1">Esperienze professionali</h2>
            <div className="font-sans space-y-3">
              {data.experience.map(e => (
                <div key={e.id}>
                  <p className="text-xs text-stone-500">{e.startDate} – {e.endDate} | {e.company.toUpperCase()}</p>
                  <p className="font-bold text-sm">{e.position}</p>
                  <p className="text-xs text-stone-700 mt-0.5 leading-relaxed">{e.description}</p>
                </div>
              ))}
            </div>
          </section>
        )}
        {data.education.length > 0 && (
          <section>
            <h2 className="text-2xl font-semibold mb-2 border-b border-stone-300 pb-1">Istruzione e formazione</h2>
            <div className="font-sans space-y-2">
              {data.education.map(e => (
                <div key={e.id}>
                  <p className="text-xs text-stone-500">{e.startDate} – {e.endDate} | {e.school.toUpperCase()}</p>
                  <p className="font-bold text-sm">{e.degree} {e.field}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  </div>
);

export const NapolitaniTemplate = ({ data }: Props) => (
  <div className="min-h-[297mm] w-[210mm] bg-white text-slate-900 font-serif p-12">
    <header className="grid grid-cols-12 gap-6 items-center pb-5 border-b-2 border-[#d97757]">
      <div className="col-span-9">
        <h1 className="text-5xl font-bold text-[#d97757]">{data.fullName || "Your Name"}</h1>
        <p className="text-slate-600 mt-1 font-sans text-sm">{data.jobTitle}</p>
        <div className="mt-3 flex items-center gap-3 text-xs font-sans text-slate-700">
          {data.phone && <span>📞 {data.phone}</span>}
          {data.email && <span>· ✉ {data.email}</span>}
          {data.location && <span>· 📍 {data.location}</span>}
        </div>
      </div>
      <div className="col-span-3">
        <Avatar src={data.photo} className="w-28 h-28 rounded-full object-cover ml-auto border-2 border-[#d97757]" />
      </div>
    </header>
    <main className="mt-6 space-y-5 text-sm font-sans">
      {data.summary && (
        <section>
          <h2 className="font-serif text-lg uppercase tracking-widest text-[#d97757] mb-1">Profilo professionale</h2>
          <p className="text-slate-700 leading-relaxed">{data.summary}</p>
        </section>
      )}
      {data.experience.length > 0 && (
        <section>
          <h2 className="font-serif text-lg uppercase tracking-widest text-[#d97757] mb-2">Esperienza lavorativa</h2>
          {data.experience.map(e => (
            <div key={e.id} className="mb-3">
              <p className="font-bold">{e.startDate} – {e.endDate} <span className="text-[#d97757]">| {e.company}</span></p>
              <p className="italic text-slate-700">{e.position}</p>
              <p className="text-slate-700 text-xs mt-1 leading-relaxed">{e.description}</p>
            </div>
          ))}
        </section>
      )}
      {data.education.length > 0 && (
        <section>
          <h2 className="font-serif text-lg uppercase tracking-widest text-[#d97757] mb-2">Istruzione</h2>
          {data.education.map(e => (
            <div key={e.id} className="mb-2">
              <p className="font-bold">{e.school} <span className="text-[#d97757]">| {e.startDate} – {e.endDate}</span></p>
              <p className="italic text-slate-700 text-xs">{e.degree} {e.field}</p>
            </div>
          ))}
        </section>
      )}
      <div className="grid grid-cols-2 gap-8">
        {data.skills.length > 0 && (
          <section>
            <h2 className="font-serif text-lg uppercase tracking-widest text-[#d97757] mb-2">Competenze</h2>
            <ul className="space-y-1 text-xs">{data.skills.map((s, i) => <li key={i}>· {s}</li>)}</ul>
          </section>
        )}
        {data.languages.length > 0 && (
          <section>
            <h2 className="font-serif text-lg uppercase tracking-widest text-[#d97757] mb-2">Lingue</h2>
            {data.languages.map(l => <p key={l.id} className="text-xs"><b>{l.name}</b> — {l.level}</p>)}
          </section>
        )}
      </div>
    </main>
  </div>
);

/* ============================ BATCH 7 ============================ */

export const OliviaWilsonTemplate = ({ data }: Props) => (
  <div className="min-h-[297mm] w-[210mm] bg-[#f4f1ec] text-stone-900 font-serif p-10">
    <header className="grid grid-cols-12 gap-6 items-center pb-5 border-b border-stone-300">
      <div className="col-span-3">
        <Avatar src={data.photo} className="w-28 h-28 rounded-full object-cover" />
      </div>
      <div className="col-span-9">
        <h1 className="text-5xl font-light tracking-[0.15em] uppercase">{data.fullName || "Your Name"}</h1>
        <div className="mt-2 flex flex-wrap gap-x-5 gap-y-0.5 text-xs font-sans text-stone-600">
          {data.email && <span>✉ {data.email}</span>}
          {data.website && <span>🌐 {data.website}</span>}
          {data.phone && <span>📞 {data.phone}</span>}
        </div>
      </div>
    </header>
    {data.summary && (
      <section className="text-center my-7">
        <h2 className="text-3xl font-light italic mb-2">Introduction</h2>
        <p className="font-sans text-xs text-stone-700 leading-relaxed max-w-3xl mx-auto">{data.summary}</p>
      </section>
    )}
    <div className="grid grid-cols-2 gap-8 text-sm">
      {data.experience.length > 0 && (
        <section>
          <h2 className="text-xs uppercase tracking-[0.3em] font-bold text-center pb-2 border-b border-stone-300 mb-3">Esperienze Lavorative</h2>
          <div className="font-sans space-y-3">
            {data.experience.map(e => (
              <div key={e.id}>
                <p className="text-[10px] uppercase tracking-wider text-stone-500">{e.company} ({e.startDate} – {e.endDate})</p>
                <p className="font-bold text-xs">{e.position}</p>
                <p className="text-xs text-stone-700 mt-0.5 leading-relaxed">{e.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}
      {data.education.length > 0 && (
        <section>
          <h2 className="text-xs uppercase tracking-[0.3em] font-bold text-center pb-2 border-b border-stone-300 mb-3">Istruzione</h2>
          <div className="font-sans space-y-3">
            {data.education.map(e => (
              <div key={e.id}>
                <p className="text-[10px] uppercase tracking-wider text-stone-500">{e.school} ({e.startDate} – {e.endDate})</p>
                <p className="font-bold text-xs">{e.degree} {e.field}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
    {data.skills.length > 0 && (
      <section className="mt-7">
        <div className="grid grid-cols-2 gap-8 font-sans">
          {[data.skills.slice(0, Math.ceil(data.skills.length / 2)), data.skills.slice(Math.ceil(data.skills.length / 2))].map((col, ci) => (
            <div key={ci} className="space-y-2">
              {col.map((s, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="bg-stone-800 text-white text-[10px] rounded-full w-10 h-10 flex items-center justify-center shrink-0">★</span>
                  <span className="text-xs">{s}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>
    )}
  </div>
);

/* ============================ BATCH 8 ============================ */

export const GretaDarkTemplate = ({ data }: Props) => (
  <div className="min-h-[297mm] w-[210mm] bg-[#1f3324] text-[#e9e3d4] font-serif">
    <header className="grid grid-cols-12 gap-5 p-8 border-b border-[#3a4f3e]">
      <div className="col-span-4">
        <Avatar src={data.photo} className="w-full h-44 object-cover rounded-sm" />
      </div>
      <div className="col-span-8 flex flex-col justify-center">
        <h1 className="text-4xl font-bold leading-tight">{data.fullName || "Your Name"}</h1>
        <p className="italic text-[#c9bf9e] mt-1">{data.jobTitle}</p>
      </div>
    </header>
    <div className="grid grid-cols-12 gap-7 p-8 text-sm">
      <aside className="col-span-4 space-y-5 font-sans text-xs">
        <div>
          <h3 className="font-bold mb-2 text-base">Contatti</h3>
          <div className="space-y-1 text-[#d6cfb9]">
            {data.phone && <p>📞 {data.phone}</p>}
            {data.email && <p className="break-all">✉ {data.email}</p>}
            {data.website && <p className="break-all">🌐 {data.website}</p>}
            {data.location && <p>📍 {data.location}</p>}
          </div>
        </div>
        {data.languages.length > 0 && (
          <div>
            <h3 className="font-bold mb-2 text-base">Lingue</h3>
            <div className="space-y-1 text-[#d6cfb9]">{data.languages.map(l => <p key={l.id}><b className="text-[#e9e3d4]">{l.name}</b> · {l.level}</p>)}</div>
          </div>
        )}
        {data.summary && (
          <div>
            <h3 className="font-bold mb-2 text-base">Su di me</h3>
            <p className="text-[#d6cfb9] leading-relaxed">{data.summary}</p>
          </div>
        )}
      </aside>
      <main className="col-span-8 space-y-5 border-l border-[#3a4f3e] pl-7">
        {data.experience.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold mb-2 border-b border-[#3a4f3e] pb-1">Esperienze professionali</h2>
            <div className="font-sans space-y-3">
              {data.experience.map(e => (
                <div key={e.id}>
                  <p className="text-[10px] uppercase tracking-wider text-[#a89e7e]">{e.startDate} – {e.endDate} | {e.company}</p>
                  <p className="font-bold text-xs text-[#e9e3d4]">{e.position}</p>
                  <p className="text-xs text-[#d6cfb9] mt-0.5 leading-relaxed">{e.description}</p>
                </div>
              ))}
            </div>
          </section>
        )}
        {data.education.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold mb-2 border-b border-[#3a4f3e] pb-1">Istruzione e formazione</h2>
            <div className="font-sans space-y-2">
              {data.education.map(e => (
                <div key={e.id}>
                  <p className="text-[10px] uppercase tracking-wider text-[#a89e7e]">{e.startDate} – {e.endDate} | {e.school}</p>
                  <p className="font-bold text-xs">{e.degree} {e.field}</p>
                </div>
              ))}
            </div>
          </section>
        )}
        {data.skills.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold mb-2 border-b border-[#3a4f3e] pb-1">Capacità e competenze</h2>
            <ul className="font-sans grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-[#d6cfb9]">
              {data.skills.map((s, i) => <li key={i}>· {s}</li>)}
            </ul>
          </section>
        )}
      </main>
    </div>
  </div>
);

export const AlfredoTemplate = ({ data }: Props) => (
  <div className="min-h-[297mm] w-[210mm] bg-white text-slate-900 font-sans grid grid-cols-12">
    <aside className="col-span-4 bg-[#e7eaee] p-7">
      <div className="border-2 border-white shadow-sm overflow-hidden mb-5">
        <Avatar src={data.photo} className="w-full aspect-square object-cover" />
      </div>
      <div className="space-y-5 text-xs">
        <div>
          <h3 className="font-bold uppercase text-sm mb-1.5 border-b border-slate-400 pb-1">Contact</h3>
          <div className="space-y-0.5 text-slate-700">
            {data.phone && <p>{data.phone}</p>}
            {data.email && <p className="break-all">{data.email}</p>}
            {data.location && <p>{data.location}</p>}
            {data.website && <p className="break-all">{data.website}</p>}
          </div>
        </div>
        {data.summary && (
          <div>
            <h3 className="font-bold uppercase text-sm mb-1.5 border-b border-slate-400 pb-1">Profile</h3>
            <p className="text-slate-700 leading-relaxed">{data.summary}</p>
          </div>
        )}
        {data.education.length > 0 && (
          <div>
            <h3 className="font-bold uppercase text-sm mb-1.5 border-b border-slate-400 pb-1">Education</h3>
            {data.education.map(e => (
              <div key={e.id} className="mb-2">
                <p className="font-bold">{e.school}</p>
                <p className="italic text-slate-600">{e.degree} {e.field}</p>
                <p className="text-slate-600">{e.startDate} – {e.endDate}</p>
              </div>
            ))}
          </div>
        )}
        {data.skills.length > 0 && (
          <div>
            <h3 className="font-bold uppercase text-sm mb-1.5 border-b border-slate-400 pb-1">Skills</h3>
            <div className="space-y-1.5">
              {data.skills.slice(0, 6).map((s, i) => (
                <div key={i}>
                  <p className="text-slate-700">{s}</p>
                  <div className="h-1 bg-white rounded-full overflow-hidden mt-0.5">
                    <div className="h-full bg-slate-700" style={{ width: `${65 + ((i * 13) % 30)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {data.languages.length > 0 && (
          <div>
            <h3 className="font-bold uppercase text-sm mb-1.5 border-b border-slate-400 pb-1">Languages</h3>
            <div className="space-y-1">{data.languages.map(l => <p key={l.id}><b>{l.name}</b> · {l.level}</p>)}</div>
          </div>
        )}
      </div>
    </aside>
    <main className="col-span-8 p-8">
      <header className="border-b-2 border-slate-800 pb-3 mb-5">
        <h1 className="text-4xl font-extrabold uppercase tracking-tight">{data.fullName || "Your Name"}</h1>
        <p className="text-slate-600 text-sm mt-1">[{data.jobTitle}]</p>
      </header>
      {data.experience.length > 0 && (
        <section className="text-sm">
          <h2 className="text-lg font-bold uppercase tracking-wider mb-3">Work Experience</h2>
          {data.experience.map(e => (
            <div key={e.id} className="mb-4 grid grid-cols-12 gap-3">
              <div className="col-span-4">
                <p className="font-bold text-sm">{e.company}</p>
                <p className="text-xs text-slate-600">{e.startDate} – {e.endDate}</p>
                <p className="text-xs italic text-slate-600">{e.location}</p>
              </div>
              <div className="col-span-8">
                <p className="font-semibold text-sm">{e.position}</p>
                <p className="text-xs text-slate-700 mt-0.5 leading-relaxed">{e.description}</p>
              </div>
            </div>
          ))}
        </section>
      )}
      {data.projects.length > 0 && (
        <section className="text-sm mt-4">
          <h2 className="text-lg font-bold uppercase tracking-wider mb-2">Projects</h2>
          {data.projects.map(p => (
            <div key={p.id} className="mb-2">
              <p className="font-semibold">{p.name}</p>
              <p className="text-xs text-slate-700">{p.description}</p>
              {p.link && <p className="text-xs text-slate-500 italic">{p.link}</p>}
            </div>
          ))}
        </section>
      )}
    </main>
  </div>
);
