import { redirect } from "next/navigation";

export default async function ProgramSettingsRedirect({
  params,
}: {
  params: Promise<{ templateId: string }>;
}) {
  const { templateId } = await params;
  redirect(`/admin/settings/programs/${templateId}`);
}
