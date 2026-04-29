import { CVData } from "@/lib/cv-types";
import { renderUserTemplate } from "@/lib/render-user-template";

export const UserTemplatePreview = ({ html, data }: { html: string; data: CVData }) => {
  const rendered = renderUserTemplate(html, data);
  return <div dangerouslySetInnerHTML={{ __html: rendered }} />;
};
