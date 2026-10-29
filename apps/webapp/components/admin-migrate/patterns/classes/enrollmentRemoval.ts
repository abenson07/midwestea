import { getSession } from "@/lib/auth";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RouteResult = { ok: true; data?: any } | { ok: false; error: string };

export type RemoveEnrollmentResult =
  | {
      ok: true;
      refundedCents: number;
      manualRefundNeeded: { transactionId: string; amountCents: number }[];
    }
  | { ok: false; error: string };

async function callEnrollmentRoute(
  path: string,
  method: "DELETE" | "POST",
  body: Record<string, unknown>,
  failure: string,
): Promise<RouteResult> {
  try {
    const { session } = await getSession();
    if (!session) return { ok: false, error: "Not authenticated" };

    const response = await fetch(path, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify(body),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok || !result?.success) {
      return { ok: false, error: result?.error || failure };
    }
    return { ok: true, data: result };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : failure };
  }
}

/**
 * Soft-removes an enrollment via DELETE /api/enrollments/remove. The route takes a
 * refund PERCENTAGE (0-100); when above 0 it refunds each paid transaction through
 * Stripe before recording it. Rows with no Stripe payment come back in
 * `manualRefundNeeded`. Pass `null` to remove without touching any transactions.
 */
export function removeEnrollment(params: {
  studentId: string;
  classId: string;
  refundPercentage: number | null;
}): Promise<RemoveEnrollmentResult> {
  return callEnrollmentRoute(
    "/api/enrollments/remove",
    "DELETE",
    {
      student_id: params.studentId,
      class_id: params.classId,
      refund_percentage: params.refundPercentage,
    },
    "Failed to remove student",
  ).then((res): RemoveEnrollmentResult => {
    if (!res.ok) return res;
    const manual = Array.isArray(res.data?.manualRefundNeeded) ? res.data.manualRefundNeeded : [];
    return {
      ok: true,
      refundedCents: typeof res.data?.refundedCents === "number" ? res.data.refundedCents : 0,
      manualRefundNeeded: manual,
    };
  });
}

/** Restores a soft-removed enrollment via POST /api/enrollments/restore. Does not touch transactions. */
export function restoreEnrollment(params: { studentId: string; classId: string }): Promise<RouteResult> {
  return callEnrollmentRoute(
    "/api/enrollments/restore",
    "POST",
    { student_id: params.studentId, class_id: params.classId },
    "Failed to restore student",
  );
}
