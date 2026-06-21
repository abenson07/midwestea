import { MarketingPage } from "@/components/marketing/marketing-page";
import type { Metadata } from "next";

const route = "/bloodborne-pathogens";

export const metadata: Metadata = {
  title: "Bloodborne Pathogens Training | Midwest Emergency Academy",
  description:
    "Learn how to identify, prevent, and respond to exposure risks with Bloodborne Pathogens training. Covers OSHA requirements, safe practices, and real-world precautions for workplace safety.",
  openGraph: {
    title: "Bloodborne Pathogens Training | Midwest Emergency Academy",
    description:
      "Learn how to identify, prevent, and respond to exposure risks with Bloodborne Pathogens training. Covers OSHA requirements, safe practices, and real-world precautions for workplace safety.",
  },
};

export default async function Page() {
  return <MarketingPage route={route} />;
}
