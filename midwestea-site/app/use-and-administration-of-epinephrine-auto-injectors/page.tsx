import { PageRenderer } from "@/components/page-renderer";
import { getPageByRoute } from "@/lib/site-config";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

const route = "/use-and-administration-of-epinephrine-auto-injectors";

export const metadata: Metadata = {
  title: "Use and Administration of Epinephrine Auto-Injectors Certification | MidwestEA",
  description:
    "Learn to recognize anaphylaxis and safely administer epinephrine with hands-on training. This course teaches emergency recognition, auto-injector use, and legal considerations for responding to severe allergic reactions.",
  openGraph: {
    title: "Use and Administration of Epinephrine Auto-Injectors Certification | MidwestEA",
    description:
      "Learn to recognize anaphylaxis and safely administer epinephrine with hands-on training. This course teaches emergency recognition, auto-injector use, and legal considerations for responding to severe allergic reactions.",
    images: [
      "https://cdn.prod.website-files.com/6906768723b00f56b0a6a28e/69224c617727d2fbca8cd337_epi-meta.png",
    ],
  },
};

export default function UseAndAdministrationOfEpinephrineAutoInjectorsPage() {
  const page = getPageByRoute(route);
  if (!page) notFound();
  return <PageRenderer page={page} />;
}
