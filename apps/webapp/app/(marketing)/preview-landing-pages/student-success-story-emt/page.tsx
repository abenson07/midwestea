import { StudentSuccessStoryTemplate } from "../../_landing-pages/student-success-story-emt/template";
import { marcusStoryContent } from "../../_landing-pages/student-success-story-emt/content";

export const metadata = {
  title: "Student Success — EMT",
};

export default function PreviewPage() {
  return <StudentSuccessStoryTemplate content={marcusStoryContent} />;
}
