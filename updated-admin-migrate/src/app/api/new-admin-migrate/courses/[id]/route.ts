import { NextResponse } from "next/server";
import { getCourseById } from "@/lib/staging/courses";
import { stagingError, stagingOk } from "@/lib/staging/apiResponse";
import { requireStagingAdmin } from "@/lib/staging/auth";

export const runtime = "nodejs";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const auth = await requireStagingAdmin(request);
  if (!auth.ok) return auth.response;
  try {
    const { id } = await context.params;
    const course = await getCourseById(id);
    if (!course) {
      return NextResponse.json({ ok: false, error: "Course not found" }, { status: 404 });
    }
    return stagingOk({ course });
  } catch (err) {
    return stagingError(err, "Failed to load course");
  }
}
