import { createStagingAdminClient } from "./adminClient";
import { isUuid } from "./ids";

export type StagingPrerequisiteType = {
  id: string;
  name: string;
  inputType: string;
  description: string | null;
  requiredByDefault: boolean;
  expirationRule: string | null;
  expirationDurationMonths: number | null;
  archivedAt: string | null;
  createdAt: string | null;
};

export type StagingTemplatePrerequisite = {
  id: string;
  courseUuid: string;
  prerequisiteTypeId: string;
  isRequired: boolean;
  sortOrder: number;
};

export type StagingClassPrerequisite = {
  id: string;
  classId: string;
  prerequisiteTypeId: string;
  isRequired: boolean;
  sortOrder: number;
};

export async function listPrerequisiteTypes(): Promise<StagingPrerequisiteType[]> {
  const supabase = createStagingAdminClient();
  const { data, error } = await supabase
    .from("prerequisite_types")
    .select(
      "id, name, input_type, description, required_by_default, expiration_rule, expiration_duration_months, archived_at, created_at",
    )
    .order("name");

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((row) => ({
    id: row.id as string,
    name: (row.name as string | null) || "Untitled",
    inputType: (row.input_type as string | null) || "text",
    description: (row.description as string | null) ?? null,
    requiredByDefault: Boolean(row.required_by_default),
    expirationRule: (row.expiration_rule as string | null) ?? null,
    expirationDurationMonths: (row.expiration_duration_months as number | null) ?? null,
    archivedAt: (row.archived_at as string | null) ?? null,
    createdAt: (row.created_at as string | null) ?? null,
  }));
}

export async function listTemplatePrerequisites(
  courseUuid?: string,
): Promise<StagingTemplatePrerequisite[]> {
  const supabase = createStagingAdminClient();
  let query = supabase
    .from("template_prerequisites")
    .select("id, course_uuid, prerequisite_type_id, is_required, sort_order")
    .order("sort_order");

  if (courseUuid) {
    query = query.eq("course_uuid", courseUuid);
  }

  const { data, error } = await query;
  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((row) => ({
    id: row.id as string,
    courseUuid: row.course_uuid as string,
    prerequisiteTypeId: row.prerequisite_type_id as string,
    isRequired: Boolean(row.is_required),
    sortOrder: (row.sort_order as number | null) ?? 0,
  }));
}

export async function listClassPrerequisites(classId?: string): Promise<StagingClassPrerequisite[]> {
  const supabase = createStagingAdminClient();
  let query = supabase
    .from("class_prerequisites")
    .select("id, class_id, prerequisite_type_id, is_required, sort_order")
    .order("sort_order");

  if (classId) {
    if (!isUuid(classId)) return [];
    query = query.eq("class_id", classId);
  }

  const { data, error } = await query;
  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((row) => ({
    id: row.id as string,
    classId: row.class_id as string,
    prerequisiteTypeId: row.prerequisite_type_id as string,
    isRequired: Boolean(row.is_required),
    sortOrder: (row.sort_order as number | null) ?? 0,
  }));
}
