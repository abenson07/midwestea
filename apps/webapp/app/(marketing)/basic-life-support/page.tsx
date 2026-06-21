import { MarketingPage } from "@/components/marketing/marketing-page";
import type { Metadata } from "next";

const route = "/basic-life-support";

export const metadata: Metadata = {
  title: "Basic Life Support (BLS) Certification | Midwest Emergency Academy",
  description:
    "Earn your state-approved Basic Life Support (BLS) certification with flexible in-person, blended, or remote skills verification options. Taught by expert instructors and aligned with the latest AHA and ILCOR guidelines.",
  openGraph: {
    title: "Basic Life Support (BLS) Certification | Midwest Emergency Academy",
    description:
      "Earn your state-approved Basic Life Support (BLS) certification with flexible in-person, blended, or remote skills verification options. Taught by expert instructors and aligned with the latest AHA and ILCOR guidelines.",
    images: [
      "https://cdn.prod.website-files.com/6906768723b00f56b0a6a28e/69224c610050220c34955598_bls.png",
    ],
  },
};

export default async function Page() {
  return <MarketingPage route={route} />;
}
