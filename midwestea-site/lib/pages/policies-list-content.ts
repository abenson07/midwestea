import type { PageSection } from "@/lib/site-config";
import { getAllPolicies } from "@/lib/policies";

export const policiesListSections: PageSection[] = [
  {
    type: "component",
    component: "Policies List",
    props: {
      heading: "Policies",
      description: "Need clarification?",
      email: "hello@midwestea.com",
      policies: getAllPolicies().map((policy) => ({
        title: policy.title,
        category: policy.category,
        url: `/policies/${policy.slug}`,
      })),
    },
  },
];
