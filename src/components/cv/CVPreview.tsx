import { CVData, TemplateId } from "@/lib/cv-types";
import { ModernTemplate, ClassicTemplate, MinimalTemplate, CreativeTemplate, ExecutiveTemplate, TechTemplate } from "./templates";

export const CVPreview = ({ data, template }: { data: CVData; template: TemplateId }) => {
  switch (template) {
    case "classic": return <ClassicTemplate data={data} />;
    case "minimal": return <MinimalTemplate data={data} />;
    case "creative": return <CreativeTemplate data={data} />;
    case "executive": return <ExecutiveTemplate data={data} />;
    case "tech": return <TechTemplate data={data} />;
    default: return <ModernTemplate data={data} />;
  }
};
