import { CatalogDetailMigrate } from "../../catalog/CatalogDetailMigrate";

export default async function ProgramDetailRoute({
  params,
}: {
  params: Promise<{ templateId: string }>;
}) {
  const { templateId } = await params;
  return <CatalogDetailMigrate templateId={templateId} />;
}
