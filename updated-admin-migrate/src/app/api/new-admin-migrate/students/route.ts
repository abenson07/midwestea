import { listStudents } from "@/lib/staging/students";
import { stagingError, stagingOk } from "@/lib/staging/apiResponse";

export const runtime = "nodejs";

/**
 * GET /api/new-admin-migrate/students
 * Identity-only student list from staging (service role).
 */
export async function GET() {
  try {
    const students = await listStudents();
    return stagingOk({ students });
  } catch (err) {
    return stagingError(err, "Failed to list students");
  }
}
