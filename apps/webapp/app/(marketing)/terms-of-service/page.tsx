import { MarketingPage } from "@/components/marketing/marketing-page";
import type { Metadata } from "next";

const route = "/terms-of-service";

export const metadata: Metadata = {
  title: "Terms of Service",
  openGraph: {
    title: "Terms of Service",
  },
};

export default async function Page() {
  return <MarketingPage route={route} />;
}
