import { NextResponse } from "next/server";
import { getCourseById } from "@/lib/staging/courses";
import { stagingError, stagingOk } from "@/lib/staging/apiResponse";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
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
