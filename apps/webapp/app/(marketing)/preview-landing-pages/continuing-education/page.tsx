import { ContinuingEducationTemplate } from "../../_landing-pages/continuing-education/template";
import { continuingEducationContent } from "../../_landing-pages/continuing-education/content";

export const metadata = {
  title: "Continuing Education",
};

export default function PreviewPage() {
  return <ContinuingEducationTemplate content={continuingEducationContent} />;
}
