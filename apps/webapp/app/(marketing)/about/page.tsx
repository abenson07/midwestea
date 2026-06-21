import { MarketingPage } from "@/components/marketing/marketing-page";
import type { Metadata } from "next";

const route = "/about";

export const metadata: Metadata = {
  title: "About Midwest Emergency Academy",
  description:
    "Meet the EMS professionals behind Midwest Emergency Academy. Learn about our mission, instructors, and commitment to trusted, state-approved training across the Kansas City region and greater Midwest.",
  openGraph: {
    title: "About Midwest Emergency Academy",
    description:
      "Real training from real instructors. MidwestEA prepares EMS professionals with credible, practical education built for the work you'll actually do.",
    images: [
      "https://cdn.prod.website-files.com/6906768723b00f56b0a6a28e/69224c615f562e6c280cf3e8_emt-meta.png",
    ],
  },
};

export default async function Page() {
  return <MarketingPage route={route} />;
}
