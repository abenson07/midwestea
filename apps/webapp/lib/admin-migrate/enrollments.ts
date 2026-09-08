import { createStagingAdminClient } from "./adminClient";
import { isUuid } from "./ids";

export type StagingEnrollment = {
  id: string;
  studentId: string;
  classId: string;
  enrollmentStatus: string | null;
  enrolledAt: string | null;
  outcome: string | null;
};

export type ListEnrollmentsOptions = {
  studentId?: string;
  classId?: string;
};

export async function listEnrollments(
  options: ListEnrollmentsOptions = {},
): Promise<StagingEnrollment[]> {
  const supabase = createStagingAdminClient();
  let query = supabase
    .from("enrollments")
    .select("id, student_id, class_id, enrollment_status, enrolled_at, outcome")
    .order("enrolled_at", { ascending: false });

  if (options.studentId) {
    if (!isUuid(options.studentId)) return [];
    query = query.eq("student_id", options.studentId);
  }
  if (options.classId) {
    if (!isUuid(options.classId)) return [];
    query = query.eq("class_id", options.classId);
  }

  const { data, error } = await query;
  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((row) => ({
    id: row.id as string,
    studentId: row.student_id as string,
    classId: row.class_id as string,
    enrollmentStatus: (row.enrollment_status as string | null) ?? null,
    enrolledAt: (row.enrolled_at as string | null) ?? null,
    outcome: (row.outcome as string | null) ?? null,
  }));
}

export function countEnrollmentsByClass(enrollments: StagingEnrollment[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const enrollment of enrollments) {
    if (enrollment.enrollmentStatus === "removed") continue;
    counts.set(enrollment.classId, (counts.get(enrollment.classId) ?? 0) + 1);
  }
  return counts;
}
