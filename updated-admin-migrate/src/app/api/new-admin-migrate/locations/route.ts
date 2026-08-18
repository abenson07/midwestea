import { listLocations } from "@/lib/staging/locations";
import { stagingError, stagingOk } from "@/lib/staging/apiResponse";

export const runtime = "nodejs";

export async function GET() {
  try {
    const locations = await listLocations();
    return stagingOk({ locations });
  } catch (err) {
    return stagingError(err, "Failed to list locations");
  }
}
