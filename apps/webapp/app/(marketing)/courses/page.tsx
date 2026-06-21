import { MarketingPage } from "@/components/marketing/marketing-page";
import type { Metadata } from "next";

const route = "/courses";

export const metadata: Metadata = {
  title: "Certification Courses - Midwest Emergency Academy",
  description:
    "Browse all certification courses offered by Midwest Emergency Academy, including BLS, ACLS, PALS, CPR/AED, Pediatric CPR, Child & Babysitting Safety, AVERT active violence response, Epinephrine administration, Bloodborne Pathogens, and Emergency Oxygen. Flexible online and blended training taught by expert instructors.",
  openGraph: {
    title: "Certification Courses - Midwest Emergency Academy",
    description:
      "Explore our full catalog of certification courses—BLS, ACLS, PALS, CPR/AED, Pediatric CPR, Babysitting, AVERT, Epinephrine, Bloodborne Pathogens, and Oxygen training. Trusted, flexible, instructor-led education.",
    images: [
      "https://cdn.prod.website-files.com/6906768723b00f56b0a6a28e/69224f8b142e131cf0ad2eee_courses-meta.png",
    ],
  },
};

export default async function Page() {
  return <MarketingPage route={route} />;
}
