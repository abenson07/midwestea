import { PageRenderer } from "@/components/page-renderer";
import { getPageByRoute } from "@/lib/site-config";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

const route = "/contact";

export const metadata: Metadata = {
  title: "Contact Midwest Emergency Academy",
  description:
    "Get in touch with Midwest Emergency Academy. Whether you have questions about enrollment, programs, schedules, or certification courses, our team is here to help. Reach out for support and guidance.",
  openGraph: {
    title: "Contact Midwest Emergency Academy",
    description:
      "Get in touch with Midwest Emergency Academy. Whether you have questions about enrollment, programs, schedules, or certification courses, our team is here to help. Reach out for support and guidance.",
    images: [
      "https://cdn.prod.website-files.com/6906768723b00f56b0a6a28e/69224c619e3ead5c44aaff28_cp-meta.png",
    ],
  },
};

export default function ContactPage() {
  const page = getPageByRoute(route);
  if (!page) notFound();
  return <PageRenderer page={page} />;
}
