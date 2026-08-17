import { listClasses } from "@/lib/staging/classes";
import { stagingError, stagingOk } from "@/lib/staging/apiResponse";

export const runtime = "nodejs";

/**
 * GET /api/new-admin-migrate/classes
 * Class labels from staging (id, code, name, dates).
 */
export async function GET() {
  try {
    const classes = await listClasses();
    return stagingOk({ classes });
  } catch (err) {
    return stagingError(err, "Failed to list classes");
  }
}
