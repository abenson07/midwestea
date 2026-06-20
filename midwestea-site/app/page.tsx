import { PageRenderer } from "@/components/page-renderer";
import { getPageByRoute } from "@/lib/site-config";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

const route = "/";

export const metadata: Metadata = {
  title: "Midwest Emergency Academy – Trusted EMS Training in the Kansas City Area",
  description:
    "Start your EMS training with confidence. Midwest Emergency Academy offers state-approved EMT, Paramedic, BLS, ACLS, and continuing education programs with flexible online and hands-on options. Learn from expert instructors trusted across Missouri and Kansas",
  openGraph: {
    title: "Your Path to Trusted EMS Training Starts Here",
    description:
      "Explore state-approved EMT, Paramedic, and continuing education programs designed for real-world readiness. Flexible learning, expert instructors, and support at every step.",
    images: [
      "https://cdn.prod.website-files.com/6906768723b00f56b0a6a28e/69224c615f562e6c280cf3e8_emt-meta.png",
    ],
  },
};

export default function HomePage() {
  const page = getPageByRoute(route);
  if (!page) notFound();
  return <PageRenderer page={page} />;
}
