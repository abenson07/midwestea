import { MarketingPage } from "@/components/marketing/marketing-page";
import type { Metadata } from "next";

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

export default async function Page() {
  return <MarketingPage route={route} />;
}
