import { PageRenderer } from "@/components/page-renderer";
import { getPageByRoute } from "@/lib/site-config";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

const route = "/purchase-confirmation/avert";

export const metadata: Metadata = {
  title: "AVERT",
  openGraph: {
    title: "AVERT",
  },
  robots: {
    index: false,
    follow: false,
    noarchive: true,
    nosnippet: true,
  },
};

export default function PurchaseConfirmationAvertPage() {
  const page = getPageByRoute(route);
  if (!page) notFound();
  return <PageRenderer page={page} />;
}
