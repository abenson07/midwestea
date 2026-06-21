import { MarketingPage } from "@/components/marketing/marketing-page";
import type { Metadata } from "next";

const route = "/advanced-emergency-medical-technician";

export const metadata: Metadata = {
  title: "Advanced Emergency Medical Technician",
  description:
    "Advance your EMS career with state-approved AEMT training from MidwestEA. Build on your EMT foundation with expanded scope skills, hands-on labs, and expert instruction in Topeka, Kansas.",
  openGraph: {
    title: "Advanced Emergency Medical Technician",
    description:
      "Advance your EMS career with state-approved AEMT training from MidwestEA. Build on your EMT foundation with expanded scope skills, hands-on labs, and expert instruction in Topeka, Kansas.",
    images: [
      "https://cdn.prod.website-files.com/6906768723b00f56b0a6a28e/69224c615f562e6c280cf3e8_emt-meta.png",
    ],
  },
};

export default async function Page() {
  return <MarketingPage route={route} />;
}
