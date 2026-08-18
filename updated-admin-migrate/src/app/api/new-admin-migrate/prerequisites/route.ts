import { listPrerequisiteTypes } from "@/lib/staging/prerequisites";
import { stagingError, stagingOk } from "@/lib/staging/apiResponse";

export const runtime = "nodejs";

export async function GET() {
  try {
    const prerequisites = await listPrerequisiteTypes();
    return stagingOk({ prerequisites });
  } catch (err) {
    return stagingError(err, "Failed to list prerequisites");
  }
}
