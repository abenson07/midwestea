import { MarketingPage } from "@/components/marketing/marketing-page";
import { MARKETING_OG_IMAGES } from "@/lib/marketing/metadata";
import type { Metadata } from "next";

const route = "/emergency-use-of-medical-oxygen";

export const metadata: Metadata = {
  title: "Emergency Use of Medical Oxygen Certification | MidwestEA",
  description:
    "Learn how to assess hypoxia, set up oxygen delivery systems, and safely administer emergency medical oxygen. Designed for BLS, First Aid/CPR AED providers, and non-medical personnel who may need to respond to oxygen-related emergencies.",
  openGraph: {
    title: "Emergency Use of Medical Oxygen Certification | MidwestEA",
    description:
      "Learn how to assess hypoxia, set up oxygen delivery systems, and safely administer emergency medical oxygen. Designed for BLS, First Aid/CPR AED providers, and non-medical personnel who may need to respond to oxygen-related emergencies.",
    images: [MARKETING_OG_IMAGES.courses],
  },
};

export default async function Page() {
  return <MarketingPage route={route} />;
}
