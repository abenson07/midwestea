import { getSession } from "@/lib/auth";

export type AddStudentInput =
  | { classId: string; studentId: string }
  | { classId: string; email: string; fullName: string; phone?: string };

export type AddStudentResult =
  | { ok: true; studentId: string; enrollmentId: string; restored: boolean; name: string | null; email: string | null }
  | { ok: false; error: string };

/** POST /api/admin/enrollments with the admin session token. Enrolls only; no invoices, email or Stripe. */
export async function addStudentToClass(input: AddStudentInput): Promise<AddStudentResult> {
  try {
    const { session } = await getSession();
    if (!session) return { ok: false, error: "Not authenticated" };
    const response = await fetch("/api/admin/enrollments", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
      body: JSON.stringify(input),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok || !result?.success) {
      return { ok: false, error: result?.error || "Failed to add student" };
    }
    return {
      ok: true,
      studentId: result.student?.id,
      enrollmentId: result.enrollment?.id,
      restored: result.restored === true,
      name: result.student?.name ?? null,
      email: result.student?.email ?? null,
    };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Failed to add student" };
  }
}

export type StudentOption = { id: string; name: string; email: string };

/** Existing (non-deleted) students for the search list, via GET /api/admin/students. */
export async function listStudentOptions(): Promise<
  { ok: true; students: StudentOption[] } | { ok: false; error: string }
> {
  try {
    const { session } = await getSession();
    if (!session) return { ok: false, error: "Not authenticated" };
    const response = await fetch("/api/admin/students", {
      headers: { Authorization: `Bearer ${session.access_token}` },
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok || !Array.isArray(result?.students)) {
      return { ok: false, error: result?.error || "Failed to load students" };
    }
    return {
      ok: true,
      students: result.students.map((s: { id: string; name: string; email: string }) => ({
        id: s.id,
        name: s.name,
        email: s.email,
      })),
    };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Failed to load students" };
  }
}
