import { listPrerequisiteTypes } from "@/lib/staging/prerequisites";
import { stagingError, stagingOk } from "@/lib/staging/apiResponse";
import { requireStagingAdmin } from "@/lib/staging/auth";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const auth = await requireStagingAdmin(request);
  if (!auth.ok) return auth.response;
  try {
    const prerequisites = await listPrerequisiteTypes();
    return stagingOk({ prerequisites });
  } catch (err) {
    return stagingError(err, "Failed to list prerequisites");
  }
}
