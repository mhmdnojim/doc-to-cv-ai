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

export type TemplateId = "modern" | "classic" | "minimal" | "creative" | "executive" | "tech";

export interface TemplateMeta {
  id: TemplateId;
  name: string;
  description: string;
  accent: string;
}

export const TEMPLATES: TemplateMeta[] = [
  { id: "modern", name: "Modern", description: "Clean two-column layout with accent sidebar", accent: "from-indigo-500 to-violet-500" },
  { id: "classic", name: "Classic", description: "Traditional single column, ATS-friendly", accent: "from-slate-700 to-slate-900" },
  { id: "minimal", name: "Minimal", description: "Whitespace-rich, elegant typography", accent: "from-zinc-400 to-zinc-600" },
  { id: "creative", name: "Creative", description: "Bold colors and modern grid", accent: "from-pink-500 to-orange-500" },
  { id: "executive", name: "Executive", description: "Sophisticated serif headers", accent: "from-emerald-700 to-emerald-900" },
  { id: "tech", name: "Tech", description: "Monospace accents, developer focus", accent: "from-cyan-500 to-blue-600" },
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
