import { NextResponse } from "next/server";
import { getClassById } from "@/lib/staging/classes";
import { stagingError, stagingOk } from "@/lib/staging/apiResponse";
import { requireStagingAdmin } from "@/lib/staging/auth";

export const runtime = "nodejs";

/**
 * GET /api/new-admin-migrate/classes/[id]
 * One class label row from staging (service role).
 */
export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const auth = await requireStagingAdmin(request);
  if (!auth.ok) return auth.response;
  try {
    const { id } = await context.params;
    const stagingClass = await getClassById(id);
    if (!stagingClass) {
      return NextResponse.json({ ok: false, error: "Class not found" }, { status: 404 });
    }
    return stagingOk({ class: stagingClass });
  } catch (err) {
    return stagingError(err, "Failed to load class");
  }
}
