import { MarketingPage } from "@/components/marketing/marketing-page";
import type { Metadata } from "next";

const route = "/cpr-first-aid";

export const metadata: Metadata = {
  title: "CPR & First Aid Certification | Midwest Emergency Academy",
  description:
    "Learn essential CPR and first aid skills for adults, children, and infants. State-approved training with hands-on practice, scenario work, and flexible delivery options.",
  openGraph: {
    title: "CPR & First Aid Certification | Midwest Emergency Academy",
    description:
      "Learn essential CPR and first aid skills for adults, children, and infants. State-approved training with hands-on practice, scenario work, and flexible delivery options.",
    images: [
      "https://cdn.prod.website-files.com/6906768723b00f56b0a6a28e/69224c613f4cd0cdf66ee01d_cpr.png",
    ],
  },
};

export default async function Page() {
  return <MarketingPage route={route} />;
}
