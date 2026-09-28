import { redirect } from "next/navigation";

export default async function CourseSettingsRedirect({
  params,
}: {
  params: Promise<{ templateId: string }>;
}) {
  const { templateId } = await params;
  redirect(`/admin/settings/courses/${templateId}`);
}
