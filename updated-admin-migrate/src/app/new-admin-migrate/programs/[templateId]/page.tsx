"use client";

import { use } from "react";
import { CatalogDetailDemo } from "@/components/patterns/client-templates-migrate/catalog";

export default function ProgramDetailRoute({
  params,
}: {
  params: Promise<{ templateId: string }>;
}) {
  const { templateId } = use(params);
  return <CatalogDetailDemo key={templateId} templateId={templateId} />;
}
