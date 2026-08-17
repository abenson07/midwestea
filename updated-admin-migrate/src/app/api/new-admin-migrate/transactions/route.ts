import { listTransactions } from "@/lib/staging/transactions";
import { stagingError, stagingOk } from "@/lib/staging/apiResponse";

export const runtime = "nodejs";

/**
 * GET /api/new-admin-migrate/transactions
 * Transaction rows from staging — enough to derive paid / pending / past due later.
 */
export async function GET() {
  try {
    const transactions = await listTransactions();
    return stagingOk({ transactions });
  } catch (err) {
    return stagingError(err, "Failed to list transactions");
  }
}
