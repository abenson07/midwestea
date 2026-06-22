import { MarketingPage } from "@/components/marketing/marketing-page";
import { MARKETING_OG_IMAGES } from "@/lib/marketing/metadata";
import type { Metadata } from "next";

const route = "/policies";

const description =
  "Review Midwest Emergency Academy student policies, including academic standing, attendance, grading, code of conduct, health and safety requirements, and complaint procedures.";

export const metadata: Metadata = {
  title: "Student Policies – Midwest Emergency Academy",
  description,
  openGraph: {
    title: "Student Policies – Midwest Emergency Academy",
    description,
    images: [MARKETING_OG_IMAGES.branded],
  },
};

export default async function Page() {
  return <MarketingPage route={route} />;
}
