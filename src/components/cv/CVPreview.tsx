import { CVData, TemplateId } from "@/lib/cv-types";
import {
  ModernTemplate, ClassicTemplate, MinimalTemplate, CreativeTemplate, ExecutiveTemplate, TechTemplate,
  ElegantTemplate, ProfessionalTemplate, CorporateTemplate, DesignerTemplate, AcademicTemplate,
  CompactTemplate, BoldTemplate, PhotoTemplate,
} from "./templates";
import { UserTemplatePreview } from "./UserTemplatePreview";

interface Props {
  data: CVData;
  template: TemplateId | string; // string allows custom template ids
  userTemplateHtml?: string;     // when set, render this instead of built-in
}

export const CVPreview = ({ data, template, userTemplateHtml }: Props) => {
  if (userTemplateHtml) return <UserTemplatePreview html={userTemplateHtml} data={data} />;
  switch (template as TemplateId) {
    case "classic": return <ClassicTemplate data={data} />;
    case "minimal": return <MinimalTemplate data={data} />;
    case "creative": return <CreativeTemplate data={data} />;
    case "executive": return <ExecutiveTemplate data={data} />;
    case "tech": return <TechTemplate data={data} />;
    case "elegant": return <ElegantTemplate data={data} />;
    case "professional": return <ProfessionalTemplate data={data} />;
    case "corporate": return <CorporateTemplate data={data} />;
    case "designer": return <DesignerTemplate data={data} />;
    case "academic": return <AcademicTemplate data={data} />;
    case "compact": return <CompactTemplate data={data} />;
    case "bold": return <BoldTemplate data={data} />;
    case "photo": return <PhotoTemplate data={data} />;
    default: return <ModernTemplate data={data} />;
  }
};
