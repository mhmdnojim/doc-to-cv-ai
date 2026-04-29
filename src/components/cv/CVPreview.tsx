import { CVData, TemplateId } from "@/lib/cv-types";
import {
  ModernTemplate, ClassicTemplate, MinimalTemplate, CreativeTemplate, ExecutiveTemplate, TechTemplate,
  ElegantTemplate, ProfessionalTemplate, CorporateTemplate, DesignerTemplate, AcademicTemplate,
  CompactTemplate, BoldTemplate, PhotoTemplate,
} from "./templates";

export const CVPreview = ({ data, template }: { data: CVData; template: TemplateId }) => {
  switch (template) {
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
