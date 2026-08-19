"use client";

import { createSupabaseClient } from "@midwestea/utils";
import type { Class } from "@midwestea/types";
import type { PostgrestError } from "@supabase/supabase-js";

export type StudentClassEnrollment = {
  enrollmentId: string;
  enrollmentStatus: string | null;
  enrolledAt: string | null;
  class: Class;
};

export function isActiveClassEnrollment(row: StudentClassEnrollment, asOf: Date = new Date()): boolean {
  if (row.enrollmentStatus === "removed") return false;
  const close = row.class.class_close_date;
  if (!close) return true;
  const closeMs = Date.parse(`${close}T00:00:00Z`);
  const asOfMs = Date.UTC(asOf.getUTCFullYear(), asOf.getUTCMonth(), asOf.getUTCDate());
  return closeMs >= asOfMs;
}

export async function getMyClassEnrollments(): Promise<{
  enrollments: StudentClassEnrollment[] | null;
  error: string | null;
}> {
  try {
    const supabase = await createSupabaseClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      return { enrollments: null, error: "Not authenticated" };
    }

    const { data, error } = await supabase
      .from("enrollments")
      .select(`
        id,
        enrollment_status,
        enrolled_at,
        classes (*)
      `)
      .eq("student_id", session.user.id)
      .order("enrolled_at", { ascending: false });

    if (error) {
      return { enrollments: null, error: error.message };
    }

    const enrollments: StudentClassEnrollment[] = (data || [])
      .map((row: { id: string; enrollment_status: string | null; enrolled_at: string | null; classes: Class | Class[] | null }) => {
        const classRecord = Array.isArray(row.classes) ? row.classes[0] : row.classes;
        if (!classRecord) return null;
        return {
          enrollmentId: row.id,
          enrollmentStatus: row.enrollment_status,
          enrolledAt: row.enrolled_at,
          class: classRecord,
        };
      })
      .filter((row): row is StudentClassEnrollment => row !== null);

    return { enrollments, error: null };
  } catch (err) {
    const error = err as PostgrestError;
    return { enrollments: null, error: error.message || "Failed to fetch classes" };
  }
}

export function formatClassDate(dateString: string | null | undefined): string {
  if (!dateString) return "—";
  return new Date(`${dateString}T00:00:00`).toLocaleDateString();
}
