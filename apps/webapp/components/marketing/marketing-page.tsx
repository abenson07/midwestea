import { PageRenderer } from "@/components/marketing/page-renderer";
import { enrichPageWithCheckoutUrls } from "@/lib/marketing/enrich-page-checkout";
import { getPageByRoute } from "@/lib/marketing/site-config";
import { notFound } from "next/navigation";

type MarketingPageProps = {
  route: string;
};

export async function MarketingPage({ route }: MarketingPageProps) {
  const page = getPageByRoute(route);
  if (!page) notFound();
  const enriched = await enrichPageWithCheckoutUrls(page);
  return <PageRenderer page={enriched} />;
}
