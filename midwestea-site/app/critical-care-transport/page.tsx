import { PageRenderer } from "@/components/page-renderer";
import { getPageByRoute } from "@/lib/site-config";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

const route = "/critical-care-transport";

export const metadata: Metadata = {
  title:
    "Critical Care Transport Program | Advanced Critical Care Training in Kansas City",
  description:
    "Train for high-acuity ground and air transport. MidwestEA's Critical Care Transport program prepares Paramedics, Nurses, and medical professionals to manage critically ill and injured patients during interfacility and emergency transport. State-approved, hands-on, and expert-led.",
  openGraph: {
    title:
      "Critical Care Transport Program | Advanced Critical Care Training in Kansas City",
    description:
      "Train for high-acuity ground and air transport. MidwestEA's Critical Care Transport program prepares Paramedics, Nurses, and medical professionals to manage critically ill and injured patients during interfacility and emergency transport. State-approved, hands-on, and expert-led.",
    images: [
      "https://cdn.prod.website-files.com/6906768723b00f56b0a6a28e/69224c61c257d57b2e3f74d6_ccp-meta.png",
    ],
  },
};

export default function CriticalCareTransportPage() {
  const page = getPageByRoute(route);
  if (!page) notFound();
  return <PageRenderer page={page} />;
}
