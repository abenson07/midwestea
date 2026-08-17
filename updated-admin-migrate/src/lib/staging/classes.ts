import { createStagingAdminClient } from "./adminClient";

export type StagingClass = {
  id: string;
  classCode: string | null;
  name: string | null;
  courseCode: string | null;
  enrollmentStart: string | null;
  enrollmentClose: string | null;
  classStart: string | null;
  classEnd: string | null;
};

export async function listClasses(): Promise<StagingClass[]> {
  const supabase = createStagingAdminClient();
  const { data, error } = await supabase
    .from("classes")
    .select(
      "id, class_id, class_name, course_code, enrollment_start, enrollment_close, class_start_date, class_close_date",
    )
    .order("class_id");

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((row) => ({
    id: row.id as string,
    classCode: (row.class_id as string | null) ?? null,
    name: (row.class_name as string | null) ?? null,
    courseCode: (row.course_code as string | null) ?? null,
    enrollmentStart: (row.enrollment_start as string | null) ?? null,
    enrollmentClose: (row.enrollment_close as string | null) ?? null,
    classStart: (row.class_start_date as string | null) ?? null,
    classEnd: (row.class_close_date as string | null) ?? null,
  }));
}
