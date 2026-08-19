import { listEnrollments } from "@/lib/staging/enrollments";
import { stagingError, stagingOk } from "@/lib/staging/apiResponse";
import { requireStagingAdmin } from "@/lib/staging/auth";

export const runtime = "nodejs";

/**
 * GET /api/new-admin-migrate/enrollments
 * Enrollment rows from staging (service role). Optional studentId / classId.
 */
export async function GET(request: Request) {
  const auth = await requireStagingAdmin(request);
  if (!auth.ok) return auth.response;
  try {
    const { searchParams } = new URL(request.url);
    const enrollments = await listEnrollments({
      studentId: searchParams.get("studentId") ?? undefined,
      classId: searchParams.get("classId") ?? undefined,
    });
    return stagingOk({ enrollments });
  } catch (err) {
    return stagingError(err, "Failed to list enrollments");
  }
}
