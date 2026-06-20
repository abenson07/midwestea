import { MarketingPage } from "@/components/marketing/marketing-page";
import type { Metadata } from "next";

const route = "/active-shooter-training";

export const metadata: Metadata = {
  title: "Active Violence Emergency Response Training (AVERT) | Midwest Emergency Academy",
  description:
    "Learn how to recognize warning signs, respond to active violence, and provide lifesaving bleeding control with AVERT training. Offered in-person or blended, designed for schools, workplaces, churches, and public agencies.",
  openGraph: {
    title: "Active Violence Emergency Response Training (AVERT) | Midwest Emergency Academy",
    description:
      "Learn how to recognize warning signs, respond to active violence, and provide lifesaving bleeding control with AVERT training. Offered in-person or blended, designed for schools, workplaces, churches, and public agencies.",
    images: [
      "https://cdn.prod.website-files.com/6906768723b00f56b0a6a28e/69224c6127b26f2cd4f109a1_avert.png",
    ],
  },
};

export default async function Page() {
  return <MarketingPage route={route} />;
}
