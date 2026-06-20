import { MarketingPage } from "@/components/marketing/marketing-page";
import type { Metadata } from "next";

const route = "/contact";

export const metadata: Metadata = {
  title: "Contact Midwest Emergency Academy",
  description:
    "Get in touch with Midwest Emergency Academy. Whether you have questions about enrollment, programs, schedules, or certification courses, our team is here to help. Reach out for support and guidance.",
  openGraph: {
    title: "Contact Midwest Emergency Academy",
    description:
      "Get in touch with Midwest Emergency Academy. Whether you have questions about enrollment, programs, schedules, or certification courses, our team is here to help. Reach out for support and guidance.",
    images: [
      "https://cdn.prod.website-files.com/6906768723b00f56b0a6a28e/69224c619e3ead5c44aaff28_cp-meta.png",
    ],
  },
};

export default async function Page() {
  return <MarketingPage route={route} />;
}
