import { MarketingPage } from "@/components/marketing/marketing-page";
import type { Metadata } from "next";

const route = "/how-it-works/programs";

export const metadata: Metadata = {
  title: "Programs How it Works",
  openGraph: {
    title: "Programs How it Works",
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
