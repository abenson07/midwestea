import { getSession } from "@/lib/auth";

type RouteResult = { ok: true } | { ok: false; error: string };

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
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : failure };
  }
}

/**
 * Soft-removes an enrollment via DELETE /api/enrollments/remove. The route takes a
 * refund PERCENTAGE (0-100) and only records it on the paid transactions in the
 * database; it does not call Stripe or move money. Pass `null` to remove without
 * touching any transactions.
 */
export function removeEnrollment(params: {
  studentId: string;
  classId: string;
  refundPercentage: number | null;
}): Promise<RouteResult> {
  return callEnrollmentRoute(
    "/api/enrollments/remove",
    "DELETE",
    {
      student_id: params.studentId,
      class_id: params.classId,
      refund_percentage: params.refundPercentage,
    },
    "Failed to remove student",
  );
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
