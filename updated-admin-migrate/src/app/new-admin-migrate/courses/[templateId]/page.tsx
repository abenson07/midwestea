import { CatalogDetailMigrate } from "../../catalog/CatalogDetailMigrate";

export default async function CourseDetailRoute({
  params,
}: {
  params: Promise<{ templateId: string }>;
}) {
  const { templateId } = await params;
  return <CatalogDetailMigrate templateId={templateId} />;
}
