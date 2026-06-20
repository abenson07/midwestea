import { PageRenderer } from "@/components/page-renderer";
import { getPageByRoute } from "@/lib/site-config";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

const route = "/emergency-use-of-medical-oxygen";

export const metadata: Metadata = {
  title: "Emergency Use of Medical Oxygen Certification | MidwestEA",
  description:
    "Learn how to assess hypoxia, set up oxygen delivery systems, and safely administer emergency medical oxygen. Designed for BLS, First Aid/CPR AED providers, and non-medical personnel who may need to respond to oxygen-related emergencies.",
  openGraph: {
    title: "Emergency Use of Medical Oxygen Certification | MidwestEA",
    description:
      "Learn how to assess hypoxia, set up oxygen delivery systems, and safely administer emergency medical oxygen. Designed for BLS, First Aid/CPR AED providers, and non-medical personnel who may need to respond to oxygen-related emergencies.",
  },
};

export default function EmergencyUseOfMedicalOxygenPage() {
  const page = getPageByRoute(route);
  if (!page) notFound();
  return <PageRenderer page={page} />;
}
