import { NextResponse } from "next/server";
import { getStudentById } from "@/lib/staging/students";
import { stagingError, stagingOk } from "@/lib/staging/apiResponse";
import { requireStagingAdmin } from "@/lib/staging/auth";

export const runtime = "nodejs";

/**
 * GET /api/new-admin-migrate/students/[id]
 * One student identity row from staging (service role).
 */
export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const auth = await requireStagingAdmin(request);
  if (!auth.ok) return auth.response;
  try {
    const { id } = await context.params;
    const student = await getStudentById(id);
    if (!student) {
      return NextResponse.json({ ok: false, error: "Student not found" }, { status: 404 });
    }
    return stagingOk({ student });
  } catch (err) {
    return stagingError(err, "Failed to load student");
  }
}
