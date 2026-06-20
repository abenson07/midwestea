import { PageRenderer } from "@/components/page-renderer";
import { getPageByRoute } from "@/lib/site-config";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

const route = "/programs";

export const metadata: Metadata = {
  title: "EMS Programs - EMR, EMT, Paramedic & Advanced Training | MidwestEA",
  description:
    "Explore all Midwest Emergency Academy programs, including EMR, EMT, Paramedic, Critical Care Transport, Community Paramedic, and Advanced Tactical Casualty Care. State-approved, expert-led training with flexible learning formats in the Kansas City area.",
  openGraph: {
    title: "Answer the Call with MidwestEA",
    description:
      "Explore all Midwest Emergency Academy programs, including EMR, EMT, Paramedic, Critical Care Transport, Community Paramedic, and Advanced Tactical Casualty Care. State-approved, expert-led training with flexible learning formats in the Kansas City area.",
    images: [
      "https://cdn.prod.website-files.com/6906768723b00f56b0a6a28e/69224c61c257d57b2e3f74d6_ccp-meta.png",
    ],
  },
};

export default function ProgramsPage() {
  const page = getPageByRoute(route);
  if (!page) notFound();
  return <PageRenderer page={page} />;
}
