import { PageRenderer } from "@/components/page-renderer";
import { getPageByRoute } from "@/lib/site-config";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

const route = "/community-paramedic";

export const metadata: Metadata = {
  title: "Community Paramedic – Midwest Emergency Academy | Kansas City Certification",
  description:
    "Advance your EMS career with MidwestEA's Community Paramedic program. A focused, two-week course that builds skills in chronic care, in-home assessments, care coordination, and community health support.",
  openGraph: {
    title: "Community Paramedic – Midwest Emergency Academy | Kansas City Certification",
    description:
      "Advance your EMS career with MidwestEA's Community Paramedic program. A focused, two-week course that builds skills in chronic care, in-home assessments, care coordination, and community health support.",
    images: [
      "https://cdn.prod.website-files.com/6906768723b00f56b0a6a28e/69224c619e3ead5c44aaff28_cp-meta.png",
    ],
  },
};

export default function CommunityParamedicPage() {
  const page = getPageByRoute(route);
  if (!page) notFound();
  return <PageRenderer page={page} />;
}
