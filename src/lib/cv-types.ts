export interface CVData {
  fullName: string;
  jobTitle: string;
  email: string;
  phone: string;
  location: string;
  website: string;
  summary: string;
  photo?: string;
  experience: Experience[];
  education: Education[];
  skills: string[];
  languages: Language[];
  projects: Project[];
  /** ISO 639-1 code of the document's primary language (e.g. "en", "ar", "zh", "kk", "bg", "tk", "id"). */
  language?: string;
  /** Text direction inferred from language: "ltr" or "rtl". */
  direction?: "ltr" | "rtl";
}

export interface Experience {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  location: string;
  description: string;
}

export interface Education {
  id: string;
  school: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
}

export interface Language {
  id: string;
  name: string;
  level: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  link: string;
}

export type TemplateId =
  | "modern" | "classic" | "minimal" | "creative" | "executive" | "tech"
  | "elegant" | "professional" | "corporate" | "designer" | "academic"
  | "compact" | "bold" | "photo"
  | "navarro" | "mitchell" | "flores" | "cortes" | "alvarez" | "silva"
  | "wilson" | "gallego" | "zaliyanti" | "choconta" | "nasser" | "perez"
  | "reyes" | "tanaka" | "okonkwo" | "petrov" | "dubois" | "hassan"
  | "kovacs" | "leclerc"
  | "mendez" | "navarro-pro" | "grasso"
  | "gibbons" | "gallego-pro" | "mae-evans" | "napolitani"
  | "olivia-wilson"
  | "greta-dark" | "alfredo";

export interface TemplateMeta {
  id: TemplateId;
  name: string;
  description: string;
  accent: string;
}

export const TEMPLATES: TemplateMeta[] = [
  { id: "modern", name: "Modern", description: "Clean two-column layout with accent sidebar", accent: "from-indigo-500 to-violet-500" },
  { id: "elegant", name: "Elegant", description: "Refined serif headers with photo banner", accent: "from-stone-700 to-stone-900" },
  { id: "professional", name: "Professional", description: "Photo + dark header, perfect for corporate", accent: "from-slate-800 to-slate-950" },
  { id: "classic", name: "Classic", description: "Traditional single column, ATS-friendly", accent: "from-slate-700 to-slate-900" },
  { id: "minimal", name: "Minimal", description: "Whitespace-rich, elegant typography", accent: "from-zinc-400 to-zinc-600" },
  { id: "corporate", name: "Corporate", description: "Navy sidebar with crisp structure", accent: "from-blue-800 to-blue-950" },
  { id: "designer", name: "Designer", description: "Pastel header with circular photo frame", accent: "from-rose-300 to-amber-200" },
  { id: "creative", name: "Creative", description: "Bold colors and modern grid", accent: "from-pink-500 to-orange-500" },
  { id: "executive", name: "Executive", description: "Sophisticated serif headers", accent: "from-emerald-700 to-emerald-900" },
  { id: "academic", name: "Academic", description: "Centered name, traditional CV format", accent: "from-neutral-600 to-neutral-800" },
  { id: "compact", name: "Compact", description: "Dense layout maximizing space", accent: "from-gray-600 to-gray-800" },
  { id: "bold", name: "Bold", description: "Large typography, statement header", accent: "from-red-500 to-rose-700" },
  { id: "photo", name: "Photo Pro", description: "Large photo banner with dark overlay", accent: "from-teal-600 to-emerald-700" },
  { id: "tech", name: "Tech", description: "Monospace accents, developer focus", accent: "from-cyan-500 to-blue-600" },
  { id: "navarro", name: "Navarro", description: "Navy sidebar with circular photo and wave divider", accent: "from-[#2c4a6b] to-[#1d3550]" },
  { id: "mitchell", name: "Mitchell", description: "Navy header band with skill bars", accent: "from-[#2d4a6b] to-[#1d3550]" },
  { id: "flores", name: "Flores", description: "Peach sidebar with elegant script name", accent: "from-[#f4d4c4] to-[#f4a48a]" },
  { id: "cortes", name: "Cortés", description: "Script header with peach right sidebar", accent: "from-[#f4d4c4] to-[#e8b4a0]" },
  { id: "alvarez", name: "Álvarez", description: "Pink curved shapes, modern feminine", accent: "from-[#fde0e8] to-[#f8b4c4]" },
  { id: "silva", name: "Silva", description: "Sage green sidebar, wellness vibe", accent: "from-[#5a6e5a] to-[#3a4e3a]" },
  { id: "wilson", name: "Wilson", description: "Light teal sidebar with skill tags", accent: "from-[#e6eef0] to-[#3a5a6a]" },
  { id: "gallego", name: "Gallego", description: "Navy header with section bands", accent: "from-[#3a5a8a] to-[#1d3550]" },
  { id: "zaliyanti", name: "Zaliyanti", description: "Swiss two-column, label-on-left", accent: "from-slate-700 to-slate-900" },
  { id: "choconta", name: "Choconta", description: "Botanical leaves with script accents", accent: "from-[#cfe0c8] to-[#5a7a5a]" },
  { id: "nasser", name: "Nasser", description: "Mint sage sidebar with script header", accent: "from-[#cfdcc8] to-[#3a5a3a]" },
  { id: "perez", name: "Pérez", description: "Soft lavender sidebar, modern feminine", accent: "from-[#dcd2ea] to-[#5a3a8a]" },
  { id: "reyes", name: "Reyes", description: "Coral header with wave divider", accent: "from-[#e85d4a] to-[#c4391f]" },
  { id: "tanaka", name: "Tanaka", description: "Minimal Japanese-inspired with red accent", accent: "from-[#a23b2a] to-[#5a1f15]" },
  { id: "okonkwo", name: "Okonkwo", description: "Earth tones with terracotta circle accent", accent: "from-[#c87b4a] to-[#5a3520]" },
  { id: "petrov", name: "Petrov", description: "Dark mode developer with neon cyan", accent: "from-cyan-400 to-cyan-700" },
  { id: "dubois", name: "Dubois", description: "Centered French elegance with gold rules", accent: "from-[#b8924a] to-[#7a5e2a]" },
  { id: "hassan", name: "Hassan", description: "Warm beige with arch dome header", accent: "from-[#d9c4a3] to-[#6b4f2c]" },
  { id: "kovacs", name: "Kovács", description: "Bold editorial with yellow accent and grayscale photo", accent: "from-[#1c1c1c] to-[#ffd23f]" },
  { id: "leclerc", name: "Leclerc", description: "French sage serif with elegant proportions", accent: "from-[#7a8c6f] to-[#4a5c3f]" },
  { id: "mendez", name: "Méndez", description: "Bold B&W with circular photo and icon sections", accent: "from-black to-neutral-700" },
  { id: "navarro-pro", name: "Navarro Pro", description: "Navy rounded sidebar with pill section headers", accent: "from-[#243a55] to-[#1a2a3e]" },
  { id: "grasso", name: "Grasso", description: "Editorial split with script italics and pink wash", accent: "from-[#fdf3f0] to-[#fce5e0]" },
  { id: "gibbons", name: "Gibbons", description: "Navy header on light card grid with abstract shapes", accent: "from-[#1f3b5c] to-[#3a5a7a]" },
  { id: "gallego-pro", name: "Gallego Pro", description: "Gray photo header with teal accent labels", accent: "from-[#cfd5db] to-[#5b8da3]" },
  { id: "mae-evans", name: "Mae Evans", description: "Warm cream serif with circular photo", accent: "from-[#f4ead8] to-[#c9b88a]" },
  { id: "napolitani", name: "Napolitani", description: "Clean serif with coral accents and right photo", accent: "from-[#d97757] to-[#a8593f]" },
  { id: "olivia-wilson", name: "Olivia Wilson", description: "Centered editorial with grayscale photo and star skill chips", accent: "from-stone-700 to-stone-900" },
  { id: "greta-dark", name: "Greta Dark", description: "Dark forest green editorial with cream serif text", accent: "from-[#1f3324] to-[#3a4f3e]" },
  { id: "alfredo", name: "Alfredo", description: "Gray sidebar with skill bars and clean two-column body", accent: "from-[#e7eaee] to-slate-700" },
];

export const EMPTY_CV: CVData = {
  fullName: "",
  jobTitle: "",
  email: "",
  phone: "",
  location: "",
  website: "",
  summary: "",
  experience: [],
  education: [],
  skills: [],
  languages: [],
  projects: [],
  language: "en",
  direction: "ltr",
};

export const SAMPLE_CV: CVData = {
  fullName: "Alex Morgan",
  jobTitle: "Senior Product Designer",
  email: "alex.morgan@example.com",
  phone: "+1 (555) 123-4567",
  location: "San Francisco, CA",
  website: "alexmorgan.design",
  summary:
    "Product designer with 7+ years building delightful, accessible interfaces for fintech and SaaS. Passionate about design systems, user research and shipping fast.",
  experience: [
    {
      id: "1",
      company: "Linear",
      position: "Senior Product Designer",
      startDate: "2022",
      endDate: "Present",
      location: "Remote",
      description: "Lead design for core workflow features used by 100k+ teams. Built the design system from the ground up.",
    },
    {
      id: "2",
      company: "Stripe",
      position: "Product Designer",
      startDate: "2019",
      endDate: "2022",
      location: "San Francisco",
      description: "Designed checkout flows that increased conversion by 23%. Collaborated with engineering on the dashboard redesign.",
    },
  ],
  education: [
    { id: "1", school: "Stanford University", degree: "B.S.", field: "Human-Computer Interaction", startDate: "2014", endDate: "2018" },
  ],
  skills: ["Figma", "Design Systems", "Prototyping", "User Research", "React", "Accessibility", "Motion Design"],
  languages: [
    { id: "1", name: "English", level: "Native" },
    { id: "2", name: "Spanish", level: "Fluent" },
  ],
  projects: [
    { id: "1", name: "Open Design Kit", description: "Open-source design system used by 5k+ designers.", link: "github.com/alex/odk" },
  ],
};
