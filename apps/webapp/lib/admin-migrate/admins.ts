import { createStagingAdminClient } from "./adminClient";

export type StagingAdmin = { id: string; displayName: string; email: string };

export async function listAdmins(): Promise<StagingAdmin[]> {
  const supabase = createStagingAdminClient();
  const { data, error } = await supabase
    .from("admins")
    .select("id, display_name, email")
    .is("deleted_at", null)
    .order("display_name");

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((row) => ({
    id: row.id as string,
    displayName: row.display_name as string,
    email: row.email as string,
  }));
}
