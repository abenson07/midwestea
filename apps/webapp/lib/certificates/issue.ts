import type { SupabaseClient } from "@supabase/supabase-js";
import { renderCompletionCertificatePdf } from "./render";
import { getCertificateExpiresAt } from "./types";
import { getSuggestedFollowUps, type UpsellCourseLookup } from "../course-upsells";
import { sendCertificateIssuedEmail } from "../react-emails";
import { insertLog } from "../logging";

const CERTIFICATES_BUCKET = "certificates";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://midwestea.com";

export type IssueCertificateInput = {
  enrollmentId: string;
  /** `YYYY-MM-DD`. Shared across a bulk batch by the caller. */
  issuedAt: string;
  /** Admin-confirmed override; falls back to the class's certification_length. */
  durationYearsOverride?: number | null;
  adminId?: string | null;
};

export type IssueCertificateResult = {
  enrollmentId: string;
  success: boolean;
  error?: string;
};

/**
 * Generates the certificate PDF for one enrollment from real student/class
 * data, stores it, flips the certificate row to issued, marks the enrollment
 * outcome as Graduated, and emails the student. Never throws — failures come
 * back in the result so bulk callers can report partial failures.
 */
export async function issueCertificate(
  input: IssueCertificateInput,
  supabase: SupabaseClient,
): Promise<IssueCertificateResult> {
  const { enrollmentId, issuedAt, durationYearsOverride, adminId } = input;

  try {
    const { data: enrollment, error: enrollmentError } = await supabase
      .from("enrollments")
      .select("id, student_id, class_id")
      .eq("id", enrollmentId)
      .maybeSingle();
    if (enrollmentError) throw new Error(enrollmentError.message);
    if (!enrollment) throw new Error("Enrollment not found");

    const [classResult, studentResult] = await Promise.all([
      supabase
        .from("classes")
        .select("class_name, course_code, certification_length")
        .eq("id", enrollment.class_id)
        .maybeSingle(),
      supabase.from("students").select("full_name").eq("id", enrollment.student_id).maybeSingle(),
    ]);
    if (classResult.error) throw new Error(classResult.error.message);
    if (studentResult.error) throw new Error(studentResult.error.message);
    if (!classResult.data) throw new Error("Class not found");
    if (!studentResult.data) throw new Error("Student not found");
    const classRow = classResult.data;
    const student = studentResult.data;

    // Every enrollment gets an auto-provisioned 'pending' row (migration 18);
    // create one defensively in case that trigger ever misses.
    let certificateId: string;
    const { data: existingCertificate, error: findCertificateError } = await supabase
      .from("certificates")
      .select("id")
      .eq("enrollment_id", enrollmentId)
      .maybeSingle();
    if (findCertificateError) throw new Error(findCertificateError.message);
    if (existingCertificate) {
      certificateId = existingCertificate.id;
    } else {
      const { data: createdCertificate, error: createCertificateError } = await supabase
        .from("certificates")
        .insert({ student_id: enrollment.student_id, enrollment_id: enrollmentId, status: "pending" })
        .select("id")
        .single();
      if (createCertificateError) throw new Error(createCertificateError.message);
      certificateId = createdCertificate.id;
    }

    const durationYears = durationYearsOverride ?? classRow.certification_length ?? null;
    const studentName = student.full_name || "Student";
    const courseName = classRow.class_name || classRow.course_code || "Course";

    const pdfBlob = await renderCompletionCertificatePdf({
      studentName,
      courseName,
      completionDate: issuedAt,
      durationYears,
      assetBaseUrl: SITE_URL,
    });

    const objectPath = `${enrollment.student_id}/${certificateId}.pdf`;
    const { error: uploadError } = await supabase.storage
      .from(CERTIFICATES_BUCKET)
      .upload(objectPath, pdfBlob, { contentType: "application/pdf", upsert: true });
    if (uploadError) throw new Error(uploadError.message);

    const expiresAt = getCertificateExpiresAt(issuedAt, durationYears);
    const { error: updateCertificateError } = await supabase
      .from("certificates")
      .update({
        status: "issued",
        issued_at: issuedAt,
        expires_at: expiresAt,
        file_url: objectPath,
        updated_at: new Date().toISOString(),
      })
      .eq("id", certificateId);
    if (updateCertificateError) throw new Error(updateCertificateError.message);

    const { error: updateEnrollmentError } = await supabase
      .from("enrollments")
      .update({ outcome: "Graduated", updated_at: new Date().toISOString() })
      .eq("id", enrollmentId);
    if (updateEnrollmentError) throw new Error(updateEnrollmentError.message);

    await sendCertificateEmail(supabase, {
      studentId: enrollment.student_id,
      studentName,
      className: courseName,
      courseCode: classRow.course_code,
    }).catch((error) => {
      console.error("[issueCertificate] Failed to send certificate email:", error);
    });

    await insertLog({
      admin_user_id: adminId ?? null,
      reference_id: enrollment.class_id,
      reference_type: "class",
      action_type: "certificate_issued",
      student_id: enrollment.student_id,
      class_id: enrollment.class_id,
    });

    return { enrollmentId, success: true };
  } catch (error: any) {
    return { enrollmentId, success: false, error: error?.message || "Failed to issue certificate" };
  }
}

async function sendCertificateEmail(
  supabase: SupabaseClient,
  args: { studentId: string; studentName: string; className: string; courseCode: string | null },
): Promise<void> {
  const { studentId, studentName, className, courseCode } = args;

  const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(studentId);
  if (authError || !authUser?.user?.email) return;

  const { data: pastCertificates } = await supabase
    .from("certificates")
    .select("enrollments(classes(course_code))")
    .eq("student_id", studentId)
    .eq("status", "issued");

  const heldCourseCodes = (pastCertificates ?? [])
    .map((row: any) => row.enrollments?.classes?.course_code as string | null)
    .filter((code: string | null): code is string => Boolean(code));

  const { data: courseRows } = await supabase.from("courses").select("course_code, course_name");
  const courseLookup: UpsellCourseLookup = new Map(
    (courseRows ?? [])
      .filter((row: any) => row.course_code)
      .map((row: any) => [row.course_code as string, { name: row.course_name || row.course_code }]),
  );

  const suggestedFollowUps = getSuggestedFollowUps(courseCode, heldCourseCodes, courseLookup, SITE_URL);

  await sendCertificateIssuedEmail(authUser.user.email, {
    studentName,
    className,
    certificateUrl: `${SITE_URL}/student/certificates`,
    suggestedFollowUps,
    allCoursesUrl: `${SITE_URL}/courses`,
  });
}
