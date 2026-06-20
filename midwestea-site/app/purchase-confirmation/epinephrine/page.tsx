import { PageRenderer } from "@/components/page-renderer";
import { getPageByRoute } from "@/lib/site-config";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

const route = "/purchase-confirmation/epinephrine";

export const metadata: Metadata = {
  title: "Epinephrine",
  openGraph: {
    title: "Epinephrine",
  },
  robots: {
    index: false,
    follow: false,
    noarchive: true,
    nosnippet: true,
  },
};

export default function PurchaseConfirmationEpinephrinePage() {
  const page = getPageByRoute(route);
  if (!page) notFound();
  return <PageRenderer page={page} />;
}
