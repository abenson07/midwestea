import { listCourses } from "@/lib/staging/courses";
import { stagingError, stagingOk } from "@/lib/staging/apiResponse";
import { requireStagingAdmin } from "@/lib/staging/auth";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const auth = await requireStagingAdmin(request);
  if (!auth.ok) return auth.response;
  try {
    const courses = await listCourses();
    return stagingOk({ courses });
  } catch (err) {
    return stagingError(err, "Failed to list courses");
  }
}
