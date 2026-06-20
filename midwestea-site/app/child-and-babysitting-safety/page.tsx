import { PageRenderer } from "@/components/page-renderer";
import { getPageByRoute } from "@/lib/site-config";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

const route = "/child-and-babysitting-safety";

export const metadata: Metadata = {
  title: "Child and Babysitting Safety Certification | Midwest Emergency Academy",
  description:
    "Learn the essentials of safe childcare, supervision, and emergency response with the Child and Babysitting Safety (CABS) course. Designed for new babysitters, youth caregivers, and anyone caring for young children.",
  openGraph: {
    title: "Child and Babysitting Safety Certification | Midwest Emergency Academy",
    description:
      "Learn the essentials of safe childcare, supervision, and emergency response with the Child and Babysitting Safety (CABS) course. Designed for new babysitters, youth caregivers, and anyone caring for young children.",
    images: [
      "https://cdn.prod.website-files.com/6906768723b00f56b0a6a28e/69224c617b6d5584194179b7_babysitting-meta.png",
    ],
  },
};

export default function ChildAndBabysittingSafetyPage() {
  const page = getPageByRoute(route);
  if (!page) notFound();
  return <PageRenderer page={page} />;
}
