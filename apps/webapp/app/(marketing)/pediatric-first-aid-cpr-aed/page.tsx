import { MarketingPage } from "@/components/marketing/marketing-page";
import type { Metadata } from "next";

const route = "/pediatric-first-aid-cpr-aed";

export const metadata: Metadata = {
  title: "Pediatric CPR & First Aid Certification | Midwest Emergency Academy",
  description:
    "Learn essential pediatric CPR and first aid skills for infants and children. Hands-on, supportive training aligned with the latest AHA and ILCOR guidelines. Available in English and Spanish.",
  openGraph: {
    title: "Pediatric CPR & First Aid Certification | Midwest Emergency Academy",
    description:
      "Learn essential pediatric CPR and first aid skills for infants and children. Hands-on, supportive training aligned with the latest AHA and ILCOR guidelines. Available in English and Spanish.",
    images: [
      "https://cdn.prod.website-files.com/6906768723b00f56b0a6a28e/69224c61af3f8676a9998fdd_pals-meta.png",
    ],
  },
};

export default async function Page() {
  return <MarketingPage route={route} />;
}
