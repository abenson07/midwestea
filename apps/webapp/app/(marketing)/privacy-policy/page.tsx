import { MarketingPage } from "@/components/marketing/marketing-page";
import type { Metadata } from "next";

const route = "/privacy-policy";

export const metadata: Metadata = {
  title: "Privacy Policy",
  openGraph: {
    title: "Privacy Policy",
  },
};

export default async function Page() {
  return <MarketingPage route={route} />;
}
