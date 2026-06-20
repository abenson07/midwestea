import { PageRenderer } from "@/components/page-renderer";
import { getPageByRoute } from "@/lib/site-config";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

const route = "/pediatric-advanced-life-support";

export const metadata: Metadata = {
  title: "Pediatric Advanced Life Support (PALS) Certification | Midwest Emergency Academy",
  description:
    "Earn your PALS certification with state-approved training for managing pediatric cardiac and respiratory emergencies. Hands-on instruction aligned with the latest AHA guidelines.",
  openGraph: {
    title: "Pediatric Advanced Life Support (PALS) Certification | Midwest Emergency Academy",
    description:
      "Earn your PALS certification with state-approved training for managing pediatric cardiac and respiratory emergencies. Hands-on instruction aligned with the latest AHA guidelines.",
    images: [
      "https://cdn.prod.website-files.com/6906768723b00f56b0a6a28e/69224c61af3f8676a9998fdd_pals-meta.png",
    ],
  },
};

export default function PediatricAdvancedLifeSupportPage() {
  const page = getPageByRoute(route);
  if (!page) notFound();
  return <PageRenderer page={page} />;
}
