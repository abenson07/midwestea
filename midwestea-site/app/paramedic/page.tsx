import { PageRenderer } from "@/components/page-renderer";
import { getPageByRoute } from "@/lib/site-config";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

const route = "/paramedic";

export const metadata: Metadata = {
  title:
    "Paramedic program – Midwest Emergency Academy | Kansas City Emergency Certification Training",
  description:
    "Advance your EMS career with MidwestEA's state-approved Paramedic program. A 12-month, shift-friendly schedule with hands-on labs, hospital rotations, and field internships. Prepare with confidence for NREMT and real-world ALS care.",
  openGraph: {
    title:
      "Paramedic program – Midwest Emergency Academy | Kansas City Emergency Certification Training",
    description:
      "Advance your EMS career with MidwestEA's state-approved Paramedic program. A 12-month, shift-friendly schedule with hands-on labs, hospital rotations, and field internships. Prepare with confidence for NREMT and real-world ALS care.",
    images: [
      "https://cdn.prod.website-files.com/6906768723b00f56b0a6a28e/69224c61dd5644a79fc5fd57_paramedic-meta.png",
    ],
  },
};

export default function ParamedicPage() {
  const page = getPageByRoute(route);
  if (!page) notFound();
  return <PageRenderer page={page} />;
}
