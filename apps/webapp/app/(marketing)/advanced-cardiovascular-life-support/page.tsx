import { MarketingPage } from "@/components/marketing/marketing-page";
import type { Metadata } from "next";

const route = "/advanced-cardiovascular-life-support";

export const metadata: Metadata = {
  title: "Advanced Cardiovascular Life Support Certification | Midwest Emergency Academy",
  description:
    "Earn your ACLS certification with state-approved training aligned to the latest AHA guidelines. Hands-on instruction for managing cardiac arrest, respiratory emergencies, and team-based resuscitation.",
  openGraph: {
    title: "Advanced Cardiovascular Life Support Certification | Midwest Emergency Academy",
    description:
      "Earn your ACLS certification with state-approved training aligned to the latest AHA guidelines. Hands-on instruction for managing cardiac arrest, respiratory emergencies, and team-based resuscitation.",
    images: [
      "https://cdn.prod.website-files.com/6906768723b00f56b0a6a28e/69224c61de14cc25708c6f1a_acls.png",
    ],
  },
};

export default async function Page() {
  return <MarketingPage route={route} />;
}
