import { CVData } from "@/lib/cv-types";
import { Mail, Phone, MapPin, Globe } from "lucide-react";

interface Props { data: CVData }

export const ModernTemplate = ({ data }: Props) => (
  <div className="flex min-h-[297mm] w-[210mm] bg-white text-slate-900 font-sans">
    <aside className="w-[260px] bg-gradient-to-b from-indigo-600 to-violet-600 text-white p-8">
      {data.photo && <img src={data.photo} alt="" className="w-32 h-32 rounded-full mb-6 object-cover border-4 border-white/20" />}
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
      {data.photo && <img src={data.photo} alt="" className="w-28 h-28 rounded-full object-cover ring-4 ring-white shadow-md" />}
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
      {data.photo && <img src={data.photo} alt="" className="w-24 h-24 rounded-full object-cover border-2 border-white" />}
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
      {data.photo && <img src={data.photo} alt="" className="w-32 h-32 rounded-full object-cover mx-auto mb-6 border-4 border-blue-800" />}
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
      {data.photo && <img src={data.photo} alt="" className="w-32 h-32 rounded-full object-cover ring-8 ring-white shadow-lg" />}
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
        {data.photo && <img src={data.photo} alt="" className="w-44 h-44 rounded-full object-cover ring-4 ring-white/30 shadow-2xl" />}
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
