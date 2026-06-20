import { PolicyDetail } from "@/components/marketing/policy-detail";
import { getAllPolicySlugs, getPolicyBySlug } from "@/lib/marketing/policies";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

type PolicyPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getAllPolicySlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PolicyPageProps): Promise<Metadata> {
  const { slug } = await params;
  const policy = getPolicyBySlug(slug);
  if (!policy) return {};

  return {
    title: `${policy.title} - Midwest Emergency Academy`,
    description: policy.metaDescription,
    openGraph: {
      title: `${policy.title} - Midwest Emergency Academy`,
      description: policy.metaDescription,
    },
  };
}

export default async function PolicyPage({ params }: PolicyPageProps) {
  const { slug } = await params;
  const policy = getPolicyBySlug(slug);
  if (!policy) notFound();

  return <PolicyDetail policy={policy} />;
}
