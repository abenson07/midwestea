import { PageRenderer } from "@/components/page-renderer";
import { getPageByRoute } from "@/lib/site-config";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

const route = "/emergency-medical-technician";

export const metadata: Metadata = {
  title: "Emergency Medical Technician",
  description:
    "Become a trusted Emergency Medical Responder with state-approved training from MidwestEA. Learn essential life-saving skills from real EMS professionals through hands-on, practical instruction in Kansas City.",
  openGraph: {
    title: "Emergency Medical Technician",
    description:
      "Become a trusted Emergency Medical Responder with state-approved training from MidwestEA. Learn essential life-saving skills from real EMS professionals through hands-on, practical instruction in Kansas City.",
    images: [
      "https://cdn.prod.website-files.com/6906768723b00f56b0a6a28e/69224c615f562e6c280cf3e8_emt-meta.png",
    ],
  },
};

export default function EmergencyMedicalTechnicianPage() {
  const page = getPageByRoute(route);
  if (!page) notFound();
  return <PageRenderer page={page} />;
}
