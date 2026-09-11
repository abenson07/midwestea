import { StudentSuccessStoryTemplate } from "../../_landing-pages/student-success-story-emr/template";
import { danaStoryContent } from "../../_landing-pages/student-success-story-emr/content";

export const metadata = {
  title: "Student Success — EMR",
};

export default function PreviewPage() {
  return <StudentSuccessStoryTemplate content={danaStoryContent} />;
}
