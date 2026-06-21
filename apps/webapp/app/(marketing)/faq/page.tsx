import { MarketingPage } from "@/components/marketing/marketing-page";
import type { Metadata } from "next";

const route = "/faq";

export const metadata: Metadata = {
  title: "Frequently Asked Questions – Midwest Emergency Academy",
  description:
    "Find answers to common questions about enrollment, payment, program requirements, certification courses, scheduling, and student support at Midwest Emergency Academy. Get clear, helpful information to guide your next steps.",
  openGraph: {
    title: "Have a question? We have the answers.",
    description:
      "Find answers to common questions about enrollment, payment, program requirements, certification courses, scheduling, and student support at Midwest Emergency Academy. Get clear, helpful information to guide your next steps.",
    images: [
      "https://cdn.prod.website-files.com/6906768723b00f56b0a6a28e/692215ea479c8c440dc20f93_avert-threat.png",
    ],
  },
};

export default async function Page() {
  return <MarketingPage route={route} />;
}
