"use client";

import { createSupabaseClient } from "@midwestea/utils";
import type { PostgrestError } from "@supabase/supabase-js";
import type { Certificate } from "@midwestea/types";

export interface CertificateWithClass extends Certificate {
  class_name: string | null;
  course_code: string | null;
}

/**
 * Fetch all certificates for a student, joined with class info, newest first.
 */
export async function getCertificatesByStudentId(
  studentId: string
): Promise<{ certificates: CertificateWithClass[] | null; error: string | null }> {
  try {
    const supabase = await createSupabaseClient();
    const { data, error } = await supabase
      .from("certificates")
      .select(`*, enrollments (id, class_id, classes (class_name, course_code))`)
      .eq("student_id", studentId)
      .order("created_at", { ascending: false });

    if (error) {
      return { certificates: null, error: error.message };
    }

    if (!data) {
      return { certificates: [], error: null };
    }

    const certificates: CertificateWithClass[] = data.map((row: any) => {
      const classInfo = row.enrollments?.classes;
      const { enrollments, ...certFields } = row;
      return {
        ...certFields,
        class_name: classInfo?.class_name ?? null,
        course_code: classInfo?.course_code ?? null,
      };
    });

    return { certificates, error: null };
  } catch (err) {
    const error = err as PostgrestError;
    return { certificates: null, error: error.message || "Failed to fetch certificates" };
  }
}

export function getCertificateDisplayStatus(
  certificate: Pick<Certificate, "status" | "expires_at">
): "pending" | "active" | "expired" {
  if (certificate.status !== "issued") return "pending";
  if (!certificate.expires_at) return "active";
  return new Date(certificate.expires_at) > new Date() ? "active" : "expired";
}
