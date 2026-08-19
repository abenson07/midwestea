import { listTransactions } from "@/lib/staging/transactions";
import { stagingError, stagingOk } from "@/lib/staging/apiResponse";
import { requireStagingAdmin } from "@/lib/staging/auth";

export const runtime = "nodejs";

/**
 * GET /api/new-admin-migrate/transactions
 * Transaction rows from staging — enough to derive paid / pending / past due later.
 */
export async function GET(request: Request) {
  const auth = await requireStagingAdmin(request);
  if (!auth.ok) return auth.response;
  try {
    const transactions = await listTransactions();
    return stagingOk({ transactions });
  } catch (err) {
    return stagingError(err, "Failed to list transactions");
  }
}
