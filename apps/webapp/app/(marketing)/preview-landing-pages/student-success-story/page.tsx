import { StudentSuccessStoryTemplate } from "../../_landing-pages/student-success-story/template";
import { gregStoryContent } from "../../_landing-pages/student-success-story/content";

export const metadata = {
  title: "Student Success — Paramedic",
};

export default function PreviewPage() {
  return <StudentSuccessStoryTemplate content={gregStoryContent} />;
}
