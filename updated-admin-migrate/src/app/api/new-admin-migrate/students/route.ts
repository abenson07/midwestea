import { listStudents } from "@/lib/staging/students";
import { stagingError, stagingOk } from "@/lib/staging/apiResponse";
import { requireStagingAdmin } from "@/lib/staging/auth";

export const runtime = "nodejs";

/**
 * GET /api/new-admin-migrate/students
 * Identity-only student list from staging (service role).
 */
export async function GET(request: Request) {
  const auth = await requireStagingAdmin(request);
  if (!auth.ok) return auth.response;
  try {
    const students = await listStudents();
    return stagingOk({ students });
  } catch (err) {
    return stagingError(err, "Failed to list students");
  }
}
