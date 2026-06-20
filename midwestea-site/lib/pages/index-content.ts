import type { PageSection } from "@/lib/site-config";
import { homeFaqQuestions } from "@/lib/home-page-data";

export const indexSections: PageSection[] = [
  { type: "custom", label: "HomeHero" },
  { type: "custom", label: "HomePrograms" },
  { type: "custom", label: "WaysToLearn" },
  { type: "custom", label: "HomeTestimonial" },
  { type: "custom", label: "CoursesHome" },
  {
    type: "component",
    component: "FAQ 6",
    props: {
      heading: "Questions?",
      description:
        "Visit our FAQ section for more information regarding programs, courses, certifications, and more.",
      button: {
        title: "See all FAQs",
        url: "/faq",
      },
      questions: homeFaqQuestions,
    },
  },
];
