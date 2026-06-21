import { MarketingPage } from "@/components/marketing/marketing-page";
import type { Metadata } from "next";

const route = "/purchase-confirmation/oxygen";

export const metadata: Metadata = {
  title: "Oxygen",
  openGraph: {
    title: "Oxygen",
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
