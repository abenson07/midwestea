import { PageRenderer } from "@/components/page-renderer";
import { getPageByRoute } from "@/lib/site-config";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

const route = "/bloodborne-pathogens";

export const metadata: Metadata = {
  title: "Bloodborne Pathogens Training | Midwest Emergency Academy",
  description:
    "Learn how to identify, prevent, and respond to exposure risks with Bloodborne Pathogens training. Covers OSHA requirements, safe practices, and real-world precautions for workplace safety.",
  openGraph: {
    title: "Bloodborne Pathogens Training | Midwest Emergency Academy",
    description:
      "Learn how to identify, prevent, and respond to exposure risks with Bloodborne Pathogens training. Covers OSHA requirements, safe practices, and real-world precautions for workplace safety.",
  },
};

export default function BloodbornePathogensPage() {
  const page = getPageByRoute(route);
  if (!page) notFound();
  return <PageRenderer page={page} />;
}
