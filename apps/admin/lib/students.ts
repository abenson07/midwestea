"use client";

console.log("[students.ts] Module loaded");

import { createSupabaseClient } from "@midwestea/utils";
import type { PostgrestError } from "@supabase/supabase-js";
import type { Student } from "@midwestea/types";

export interface StudentWithEmail extends Student {
  email?: string | null;
  name?: string;
}

/**
 * Fetch all students from the students table
 * Uses first_name/last_name for name and email from the database
 */
export async function getStudents(): Promise<{ students: StudentWithEmail[] | null; error: string | null }> {
  try {
    console.log("[getStudents] Starting...");
    const supabase = await createSupabaseClient();
    console.log("[getStudents] Supabase client created");
    const { data, error } = await supabase
      .from("students")
      .select("*")
      .order("created_at", { ascending: false });

    console.log("[getStudents] Query result:", { data, error, dataLength: data?.length });

    if (error) {
      console.error("[getStudents] Error fetching students:", error);
      return { students: null, error: error.message };
    }

    if (!data) {
      console.log("[getStudents] No data returned");
      return { students: [], error: null };
    }

    // Transform students to include formatted name and email from students table
    const studentsWithEmail: StudentWithEmail[] = data.map((student) => {
      const firstName = student.first_name || "";
      const lastName = student.last_name || "";
      const name = firstName || lastName 
        ? `${firstName} ${lastName}`.trim() 
        : "Unknown Student";
      const email = student.email ?? null;

      return {
        ...student,
        name,
        email,
      };
    });

    return { students: studentsWithEmail, error: null };
  } catch (err) {
    const error = err as PostgrestError;
    return { students: null, error: error.message || "Failed to fetch students" };
  }
}

/**
 * Fetch students enrolled in a specific class
 */
export async function getStudentsByClassId(classId: string): Promise<{ students: StudentWithEmail[] | null; error: string | null }> {
  try {
    console.log("[getStudentsByClassId] Starting for classId:", classId);
    const supabase = await createSupabaseClient();
    console.log("[getStudentsByClassId] Supabase client created");
    const { data, error } = await supabase
      .from("enrollments")
      .select(`
        *,
        students (*)
      `)
      .eq("class_id", classId)
      .order("enrolled_at", { ascending: false });

    console.log("[getStudentsByClassId] Query result:", { data, error, dataLength: data?.length });

    if (error) {
      console.error("[getStudentsByClassId] Error fetching students for class:", error);
      return { students: null, error: error.message };
    }

    if (!data) {
      console.log("[getStudentsByClassId] No data returned");
      return { students: [], error: null };
    }

    // Transform enrollments to extract students with name and email from students table
    const studentsWithEmail: StudentWithEmail[] = data
      .map((enrollment: any) => {
        const student = enrollment.students;
        if (!student) return null;

        const firstName = student.first_name || "";
        const lastName = student.last_name || "";
        const name = firstName || lastName 
          ? `${firstName} ${lastName}`.trim() 
          : "Unknown Student";
        const email = student.email ?? null;

        return {
          ...student,
          name,
          email,
        };
      })
      .filter((student): student is StudentWithEmail => student !== null);

    return { students: studentsWithEmail, error: null };
  } catch (err) {
    const error = err as PostgrestError;
    return { students: null, error: error.message || "Failed to fetch students for class" };
  }
}

