import { MarketingPage } from "@/components/marketing/marketing-page";
import type { Metadata } from "next";

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

export default async function Page() {
  return <MarketingPage route={route} />;
}
