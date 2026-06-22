import { MarketingPage } from "@/components/marketing/marketing-page";
import { MARKETING_OG_IMAGES } from "@/lib/marketing/metadata";
import type { Metadata } from "next";

const route = "/privacy-policy";

const description =
  "Review the Midwest Emergency Academy Privacy Policy to learn how we collect, use, store, and protect your personal information when you enroll in courses, create an account, or use our website and training services.";

export const metadata: Metadata = {
  title: "Privacy Policy – Midwest Emergency Academy",
  description,
  openGraph: {
    title: "Privacy Policy – Midwest Emergency Academy",
    description,
    images: [MARKETING_OG_IMAGES.branded],
  },
};

export default async function Page() {
  return <MarketingPage route={route} />;
}
