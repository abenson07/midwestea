import { StudentSuccessStoryTemplate } from "../../_landing-pages/student-success-story-aemt/template";
import { priyaStoryContent } from "../../_landing-pages/student-success-story-aemt/content";

export const metadata = {
  title: "Student Success — AEMT",
};

export default function PreviewPage() {
  return <StudentSuccessStoryTemplate content={priyaStoryContent} />;
}
