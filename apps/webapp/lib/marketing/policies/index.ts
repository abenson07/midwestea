import policiesData from "@/lib/marketing/policies/policies.json";

export type PolicyCrossRef = {
  title: string;
  url: string;
};

export type Policy = {
  slug: string;
  title: string;
  category: string;
  crossrefs: PolicyCrossRef[];
  contentHtml: string;
  adoptedBy: string;
  adoptedRole: string;
  adoptedDate: string;
  metaDescription: string;
};

const policies = policiesData as Policy[];

export function getAllPolicies(): Policy[] {
  return policies;
}

export function getPolicyBySlug(slug: string): Policy | undefined {
  return policies.find((policy) => policy.slug === slug);
}

export function getAllPolicySlugs(): string[] {
  return policies.map((policy) => policy.slug);
}
