import { listCourses } from "@/lib/staging/courses";
import { stagingError, stagingOk } from "@/lib/staging/apiResponse";

export const runtime = "nodejs";

export async function GET() {
  try {
    const courses = await listCourses();
    return stagingOk({ courses });
  } catch (err) {
    return stagingError(err, "Failed to list courses");
  }
}
