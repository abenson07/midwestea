import { PageRenderer } from "@/components/page-renderer";
import { getPageByRoute } from "@/lib/site-config";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

const route = "/terms-of-service";

export const metadata: Metadata = {
  title: "Terms of Service",
  openGraph: {
    title: "Terms of Service",
  },
};

export default function TermsOfServicePage() {
  const page = getPageByRoute(route);
  if (!page) notFound();
  return <PageRenderer page={page} />;
}
