import { CVData, TemplateId } from "@/lib/cv-types";
import {
  ModernTemplate, ClassicTemplate, MinimalTemplate, CreativeTemplate, ExecutiveTemplate, TechTemplate,
  ElegantTemplate, ProfessionalTemplate, CorporateTemplate, DesignerTemplate, AcademicTemplate,
  CompactTemplate, BoldTemplate, PhotoTemplate,
  NavarroTemplate, MitchellTemplate, FloresTemplate, CortesTemplate, AlvarezTemplate, SilvaTemplate,
  WilsonTemplate, GallegoTemplate, ZaliyantiTemplate, ChocontaTemplate, NasserTemplate, PerezTemplate,
  ReyesTemplate, TanakaTemplate, OkonkwoTemplate, PetrovTemplate, DuboisTemplate, HassanTemplate,
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
    case "navarro": return <NavarroTemplate data={data} />;
    case "mitchell": return <MitchellTemplate data={data} />;
    case "flores": return <FloresTemplate data={data} />;
    case "cortes": return <CortesTemplate data={data} />;
    case "alvarez": return <AlvarezTemplate data={data} />;
    case "silva": return <SilvaTemplate data={data} />;
    case "wilson": return <WilsonTemplate data={data} />;
    case "gallego": return <GallegoTemplate data={data} />;
    case "zaliyanti": return <ZaliyantiTemplate data={data} />;
    case "choconta": return <ChocontaTemplate data={data} />;
    case "nasser": return <NasserTemplate data={data} />;
    case "perez": return <PerezTemplate data={data} />;
    case "reyes": return <ReyesTemplate data={data} />;
    case "tanaka": return <TanakaTemplate data={data} />;
    case "okonkwo": return <OkonkwoTemplate data={data} />;
    case "petrov": return <PetrovTemplate data={data} />;
    case "dubois": return <DuboisTemplate data={data} />;
    case "hassan": return <HassanTemplate data={data} />;
    default: return <ModernTemplate data={data} />;
  }
};
