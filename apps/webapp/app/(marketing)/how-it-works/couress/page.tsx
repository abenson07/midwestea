import { MarketingPage } from "@/components/marketing/marketing-page";
import type { Metadata } from "next";

const route = "/how-it-works/couress";

export const metadata: Metadata = {
  title: "Courses How it Works",
  openGraph: {
    title: "Courses How it Works",
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
