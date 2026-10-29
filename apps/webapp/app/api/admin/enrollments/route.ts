import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@midwestea/utils";
import { getCurrentAdmin, insertLog } from "@/lib/logging";
import {
  DELETED_STUDENT_MESSAGE,
  DeletedStudentError,
  createEnrollment,
  findOrCreateStudent,
  updateStudentNameIfNeeded,
} from "@/lib/enrollments";

export const runtime = "nodejs";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function fail(error: string, status: number) {
  return NextResponse.json({ success: false, error }, { status });
}

/**
 * POST /api/admin/enrollments — add a student to a class (admin only).
 * Mirrors the old admin "Add student" flow: either enroll an existing student
 * (`studentId`) or find/create one by email (`email` + `fullName`, optional `phone`),
 * then create a `registered` enrollment and write a `student_added` log row.
 * Creates NO invoices/transactions and sends NO email or Stripe calls.
 * A previously `removed` enrollment is restored instead of duplicated.
 */
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return fail("Unauthorized - Missing or invalid authorization header", 401);
    }

    const token = authHeader.replace("Bearer ", "");
    const supabase = createSupabaseAdminClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);
    if (authError || !user) return fail("Unauthorized - Invalid session", 401);

    const { admin, error: adminError } = await getCurrentAdmin(user.id);
    if (adminError || !admin) {
      return fail("Admin not found. Please ensure you are registered as an admin.", 403);
    }

    const body = await request.json().catch(() => ({}));
    const { classId, studentId, email, fullName, phone } = body ?? {};

    if (typeof classId !== "string" || !UUID_REGEX.test(classId)) {
      return fail("Invalid class ID", 400);
    }
    if (studentId != null && (typeof studentId !== "string" || !UUID_REGEX.test(studentId))) {
      return fail("Invalid student ID", 400);
    }
    if (!studentId) {
      if (typeof email !== "string" || !email.trim()) return fail("Email is required", 400);
      if (typeof fullName !== "string" || !fullName.trim()) return fail("Full name is required", 400);
      if (!EMAIL_REGEX.test(email.trim())) return fail("Invalid email format", 400);
    }

    const { data: classRecord, error: classError } = await supabase
      .from("classes")
      .select("id, deleted_at")
      .eq("id", classId)
      .maybeSingle();
    if (classError) return fail(classError.message || "Failed to look up class", 500);
    if (!classRecord || classRecord.deleted_at) return fail("Class not found", 404);

    let resolvedStudentId: string;
    let studentName: string | null = null;
    let studentEmail: string | null = null;

    if (studentId) {
      const { data: student, error: studentError } = await supabase
        .from("students")
        .select("id, full_name, deleted_at")
        .eq("id", studentId)
        .maybeSingle();
      if (studentError) return fail(studentError.message || "Failed to look up student", 500);
      if (!student) return fail("Student not found", 404);
      if (student.deleted_at) return fail(DELETED_STUDENT_MESSAGE, 403);
      resolvedStudentId = student.id;
      studentName = student.full_name ?? null;
    } else {
      const student = await findOrCreateStudent(email.trim(), { rejectDeleted: true });
      await updateStudentNameIfNeeded(student.id, fullName.trim());
      if (typeof phone === "string" && phone.trim() !== "") {
        const { error: phoneError } = await supabase
          .from("students")
          .update({ phone: phone.trim() })
          .eq("id", student.id);
        if (phoneError) console.error("[admin/enrollments] Failed to update phone:", phoneError);
      }
      resolvedStudentId = student.id;
      studentName = fullName.trim();
      studentEmail = email.trim();
    }

    const { data: existing, error: existingError } = await supabase
      .from("enrollments")
      .select("id, enrollment_status")
      .eq("student_id", resolvedStudentId)
      .eq("class_id", classId)
      .maybeSingle();
    if (existingError) return fail(existingError.message || "Failed to look up enrollment", 500);

    let enrollmentId: string;
    let restored = false;

    if (existing && existing.enrollment_status !== "removed") {
      return fail("This student is already enrolled in this class", 409);
    }

    if (existing) {
      // Previously removed: same effect as /api/enrollments/restore.
      const { data: updatedRows, error: updateError } = await supabase
        .from("enrollments")
        .update({ enrollment_status: "registered", updated_at: new Date().toISOString() })
        .eq("id", existing.id)
        .select("id");
      if (updateError || !updatedRows || updatedRows.length === 0) {
        return fail(updateError?.message || "Failed to restore enrollment", 500);
      }
      enrollmentId = existing.id;
      restored = true;
    } else {
      const enrollment = await createEnrollment(resolvedStudentId, classId);
      enrollmentId = enrollment.id;
    }

    const logResult = await insertLog({
      admin_user_id: admin.id,
      reference_id: classId,
      reference_type: "class",
      action_type: "student_added",
      student_id: resolvedStudentId,
      class_id: classId,
    });
    if (!logResult.success) {
      console.error("[admin/enrollments] Failed to write student_added log:", logResult.error);
    }

    return NextResponse.json({
      success: true,
      restored,
      enrollment: { id: enrollmentId },
      student: { id: resolvedStudentId, name: studentName, email: studentEmail },
    });
  } catch (err: unknown) {
    console.error("[admin/enrollments] Error:", err);
    if (err instanceof DeletedStudentError) return fail(err.message, 403);
    const message = err instanceof Error ? err.message : "Failed to add student";
    return fail(message, 500);
  }
}
