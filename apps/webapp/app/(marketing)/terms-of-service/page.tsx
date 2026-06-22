import { MarketingPage } from "@/components/marketing/marketing-page";
import { MARKETING_OG_IMAGES } from "@/lib/marketing/metadata";
import type { Metadata } from "next";

const route = "/terms-of-service";

const description =
  "Read the Midwest Emergency Academy Terms of Service. Understand enrollment rules, payment terms, refund policies, account responsibilities, and conditions for using our EMS training programs and certification courses.";

export const metadata: Metadata = {
  title: "Terms of Service – Midwest Emergency Academy",
  description,
  openGraph: {
    title: "Terms of Service – Midwest Emergency Academy",
    description,
    images: [MARKETING_OG_IMAGES.branded],
  },
};

export default async function Page() {
  return <MarketingPage route={route} />;
}
