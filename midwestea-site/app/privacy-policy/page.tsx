import { PageRenderer } from "@/components/page-renderer";
import { getPageByRoute } from "@/lib/site-config";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

const route = "/privacy-policy";

export const metadata: Metadata = {
  title: "Privacy Policy",
  openGraph: {
    title: "Privacy Policy",
  },
};

export default function PrivacyPolicyPage() {
  const page = getPageByRoute(route);
  if (!page) notFound();
  return <PageRenderer page={page} />;
}
