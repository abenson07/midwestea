import { MarketingPage } from "@/components/marketing/marketing-page";
import type { Metadata } from "next";

const route = "/emergency-medical-responder";

export const metadata: Metadata = {
  title: "Emergency Medical Responder (EMR) Training | Midwest Emergency Academy",
  description:
    "Become a trusted Emergency Medical Responder with state-approved training from MidwestEA. Learn essential life-saving skills from real EMS professionals through hands-on, practical instruction in Kansas City.",
  openGraph: {
    title: "Emergency Medical Responder (EMR) Training | Midwest Emergency Academy",
    description:
      "Become a trusted Emergency Medical Responder with state-approved training from MidwestEA. Learn essential life-saving skills from real EMS professionals through hands-on, practical instruction in Kansas City.",
    images: [
      "https://cdn.prod.website-files.com/6906768723b00f56b0a6a28e/69224c61eaf244c8c13bda44_emr-meta.png",
    ],
  },
};

export default async function Page() {
  return <MarketingPage route={route} />;
}
