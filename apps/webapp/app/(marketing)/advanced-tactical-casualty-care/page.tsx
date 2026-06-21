import { MarketingPage } from "@/components/marketing/marketing-page";
import type { Metadata } from "next";

const route = "/advanced-tactical-casualty-care";

export const metadata: Metadata = {
  title:
    "Advanced Tactical Casualty Care (ATCC) – Kansas City | Midwest Emergency Academy",
  description:
    "Learn life-saving tactical emergency care with MidwestEA's ATCC course. Hands-on training for managing trauma, bleeding, airway issues, and critical injuries during high-threat situations.",
  openGraph: {
    title:
      "Advanced Tactical Casualty Care (ATCC) – Kansas City | Midwest Emergency Academy",
    description:
      "Learn life-saving tactical emergency care with MidwestEA's ATCC course. Hands-on training for managing trauma, bleeding, airway issues, and critical injuries during high-threat situations.",
    images: [
      "https://cdn.prod.website-files.com/6906768723b00f56b0a6a28e/69224c61619077ba6f2bb5c8_atcc-meta.png",
    ],
  },
};

export default async function Page() {
  return <MarketingPage route={route} />;
}
