import { CareerChangerAdultLearnerTemplate } from "../../_landing-pages/career-changer-adult-learner/template";
import { careerChangerContent } from "../../_landing-pages/career-changer-adult-learner/content";

export const metadata = {
  title: "Changing Career",
};

export default function PreviewPage() {
  return <CareerChangerAdultLearnerTemplate content={careerChangerContent} />;
}
