import { CVData, Experience, Education, Language, Project } from "@/lib/cv-types";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Plus, Trash2, X } from "lucide-react";
import { useState } from "react";

interface Props {
  data: CVData;
  onChange: (data: CVData) => void;
}

const newId = () => Math.random().toString(36).slice(2, 9);

export const CVForm = ({ data, onChange }: Props) => {
  const [skillInput, setSkillInput] = useState("");

  const update = (patch: Partial<CVData>) => onChange({ ...data, ...patch });

  const addExperience = () => update({
    experience: [...data.experience, { id: newId(), company: "", position: "", startDate: "", endDate: "", location: "", description: "" }]
  });
  const updateExperience = (id: string, patch: Partial<Experience>) =>
    update({ experience: data.experience.map(e => e.id === id ? { ...e, ...patch } : e) });
  const removeExperience = (id: string) => update({ experience: data.experience.filter(e => e.id !== id) });

  const addEducation = () => update({
    education: [...data.education, { id: newId(), school: "", degree: "", field: "", startDate: "", endDate: "" }]
  });
  const updateEducation = (id: string, patch: Partial<Education>) =>
    update({ education: data.education.map(e => e.id === id ? { ...e, ...patch } : e) });
  const removeEducation = (id: string) => update({ education: data.education.filter(e => e.id !== id) });

  const addSkill = () => {
    const s = skillInput.trim();
    if (s && !data.skills.includes(s)) update({ skills: [...data.skills, s] });
    setSkillInput("");
  };
  const removeSkill = (s: string) => update({ skills: data.skills.filter(x => x !== s) });

  const addLanguage = () => update({ languages: [...data.languages, { id: newId(), name: "", level: "" }] });
  const updateLanguage = (id: string, patch: Partial<Language>) =>
    update({ languages: data.languages.map(l => l.id === id ? { ...l, ...patch } : l) });
  const removeLanguage = (id: string) => update({ languages: data.languages.filter(l => l.id !== id) });

  const addProject = () => update({ projects: [...data.projects, { id: newId(), name: "", description: "", link: "" }] });
  const updateProject = (id: string, patch: Partial<Project>) =>
    update({ projects: data.projects.map(p => p.id === id ? { ...p, ...patch } : p) });
  const removeProject = (id: string) => update({ projects: data.projects.filter(p => p.id !== id) });

  return (
    <Accordion type="multiple" defaultValue={["personal", "experience"]} className="space-y-2">
      <AccordionItem value="personal" className="border rounded-lg px-4 bg-card">
        <AccordionTrigger className="hover:no-underline">Personal Info</AccordionTrigger>
        <AccordionContent className="space-y-3 pt-2">
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Full name</Label><Input value={data.fullName} onChange={e => update({ fullName: e.target.value })} /></div>
            <div><Label>Job title</Label><Input value={data.jobTitle} onChange={e => update({ jobTitle: e.target.value })} /></div>
            <div><Label>Email</Label><Input type="email" value={data.email} onChange={e => update({ email: e.target.value })} /></div>
            <div><Label>Phone</Label><Input value={data.phone} onChange={e => update({ phone: e.target.value })} /></div>
            <div><Label>Location</Label><Input value={data.location} onChange={e => update({ location: e.target.value })} /></div>
            <div><Label>Website</Label><Input value={data.website} onChange={e => update({ website: e.target.value })} /></div>
          </div>
          <div><Label>Summary</Label><Textarea rows={4} value={data.summary} onChange={e => update({ summary: e.target.value })} /></div>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="experience" className="border rounded-lg px-4 bg-card">
        <AccordionTrigger className="hover:no-underline">Experience</AccordionTrigger>
        <AccordionContent className="space-y-3 pt-2">
          {data.experience.map(e => (
            <div key={e.id} className="border rounded-lg p-3 space-y-2 bg-muted/30">
              <div className="flex justify-between items-center"><span className="text-sm font-medium">{e.position || "New role"}</span>
                <Button size="sm" variant="ghost" onClick={() => removeExperience(e.id)}><Trash2 className="w-4 h-4" /></Button></div>
              <div className="grid grid-cols-2 gap-2">
                <Input placeholder="Position" value={e.position} onChange={ev => updateExperience(e.id, { position: ev.target.value })} />
                <Input placeholder="Company" value={e.company} onChange={ev => updateExperience(e.id, { company: ev.target.value })} />
                <Input placeholder="Start" value={e.startDate} onChange={ev => updateExperience(e.id, { startDate: ev.target.value })} />
                <Input placeholder="End" value={e.endDate} onChange={ev => updateExperience(e.id, { endDate: ev.target.value })} />
                <Input className="col-span-2" placeholder="Location" value={e.location} onChange={ev => updateExperience(e.id, { location: ev.target.value })} />
              </div>
              <Textarea rows={3} placeholder="Description" value={e.description} onChange={ev => updateExperience(e.id, { description: ev.target.value })} />
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={addExperience}><Plus className="w-4 h-4 mr-1" /> Add experience</Button>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="education" className="border rounded-lg px-4 bg-card">
        <AccordionTrigger className="hover:no-underline">Education</AccordionTrigger>
        <AccordionContent className="space-y-3 pt-2">
          {data.education.map(e => (
            <div key={e.id} className="border rounded-lg p-3 space-y-2 bg-muted/30">
              <div className="flex justify-between"><span className="text-sm font-medium">{e.school || "New entry"}</span>
                <Button size="sm" variant="ghost" onClick={() => removeEducation(e.id)}><Trash2 className="w-4 h-4" /></Button></div>
              <div className="grid grid-cols-2 gap-2">
                <Input placeholder="School" value={e.school} onChange={ev => updateEducation(e.id, { school: ev.target.value })} />
                <Input placeholder="Degree" value={e.degree} onChange={ev => updateEducation(e.id, { degree: ev.target.value })} />
                <Input placeholder="Field" value={e.field} onChange={ev => updateEducation(e.id, { field: ev.target.value })} />
                <div className="grid grid-cols-2 gap-2">
                  <Input placeholder="Start" value={e.startDate} onChange={ev => updateEducation(e.id, { startDate: ev.target.value })} />
                  <Input placeholder="End" value={e.endDate} onChange={ev => updateEducation(e.id, { endDate: ev.target.value })} />
                </div>
              </div>
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={addEducation}><Plus className="w-4 h-4 mr-1" /> Add education</Button>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="skills" className="border rounded-lg px-4 bg-card">
        <AccordionTrigger className="hover:no-underline">Skills</AccordionTrigger>
        <AccordionContent className="space-y-3 pt-2">
          <div className="flex gap-2">
            <Input placeholder="Add a skill" value={skillInput} onChange={e => setSkillInput(e.target.value)} onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addSkill())} />
            <Button onClick={addSkill} variant="secondary">Add</Button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {data.skills.map(s => (
              <span key={s} className="inline-flex items-center gap-1 text-xs bg-accent text-accent-foreground px-2 py-1 rounded">
                {s}<button onClick={() => removeSkill(s)}><X className="w-3 h-3" /></button>
              </span>
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="languages" className="border rounded-lg px-4 bg-card">
        <AccordionTrigger className="hover:no-underline">Languages</AccordionTrigger>
        <AccordionContent className="space-y-2 pt-2">
          {data.languages.map(l => (
            <div key={l.id} className="flex gap-2">
              <Input placeholder="Language" value={l.name} onChange={e => updateLanguage(l.id, { name: e.target.value })} />
              <Input placeholder="Level" value={l.level} onChange={e => updateLanguage(l.id, { level: e.target.value })} />
              <Button size="icon" variant="ghost" onClick={() => removeLanguage(l.id)}><Trash2 className="w-4 h-4" /></Button>
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={addLanguage}><Plus className="w-4 h-4 mr-1" /> Add language</Button>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="projects" className="border rounded-lg px-4 bg-card">
        <AccordionTrigger className="hover:no-underline">Projects</AccordionTrigger>
        <AccordionContent className="space-y-3 pt-2">
          {data.projects.map(p => (
            <div key={p.id} className="border rounded-lg p-3 space-y-2 bg-muted/30">
              <div className="flex justify-between"><span className="text-sm font-medium">{p.name || "New project"}</span>
                <Button size="sm" variant="ghost" onClick={() => removeProject(p.id)}><Trash2 className="w-4 h-4" /></Button></div>
              <Input placeholder="Name" value={p.name} onChange={e => updateProject(p.id, { name: e.target.value })} />
              <Textarea rows={2} placeholder="Description" value={p.description} onChange={e => updateProject(p.id, { description: e.target.value })} />
              <Input placeholder="Link" value={p.link} onChange={e => updateProject(p.id, { link: e.target.value })} />
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={addProject}><Plus className="w-4 h-4 mr-1" /> Add project</Button>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};
