"use client";

import { createSupabaseClient } from "@midwestea/utils";
import type { PostgrestError } from "@supabase/supabase-js";

export interface Course {
  id: string;
  course_name: string;
  course_code: string;
}

export interface ClassResponse {
  success: boolean;
  error?: string;
}

/**
 * Fetch all courses from the courses table
 */
export async function getCourses(): Promise<{ courses: Course[] | null; error: string | null }> {
  try {
    const supabase = createSupabaseClient();
    const { data, error } = await supabase
      .from("courses")
      .select("id, course_name, course_code")
      .order("course_code");

    if (error) {
      return { courses: null, error: error.message };
    }

    return { courses: data as Course[], error: null };
  } catch (err) {
    const error = err as PostgrestError;
    return { courses: null, error: error.message || "Failed to fetch courses" };
  }
}

/**
 * Generate a class_id by finding the max existing class_id for a given course_code
 * Format: course_code + 4-digit number (e.g., EMR0001)
 */
export async function generateClassId(courseCode: string): Promise<{ classId: string | null; error: string | null }> {
  try {
    const supabase = createSupabaseClient();
    
    // Query all classes with the same course_code
    const { data, error } = await supabase
      .from("classes")
      .select("class_id")
      .eq("course_code", courseCode);

    if (error) {
      return { classId: null, error: error.message };
    }

    // If no existing classes, start at 0001
    if (!data || data.length === 0) {
      const classId = `${courseCode}0001`;
      return { classId, error: null };
    }

    // Extract numeric suffixes from existing class_ids
    const numericSuffixes = data
      .map((classItem) => {
        const classId = classItem.class_id;
        if (!classId || typeof classId !== "string") return null;
        
        // Extract the numeric part (assumes format: course_code + digits)
        // Remove the course_code prefix to get just the number
        const numericPart = classId.replace(courseCode, "");
        const num = parseInt(numericPart, 10);
        return isNaN(num) ? null : num;
      })
      .filter((num): num is number => num !== null);

    // Find max and increment
    const maxNum = numericSuffixes.length > 0 ? Math.max(...numericSuffixes) : 0;
    const nextNum = maxNum + 1;

    // Format as 4-digit zero-padded string
    const paddedNum = nextNum.toString().padStart(4, "0");
    const classId = `${courseCode}${paddedNum}`;

    return { classId, error: null };
  } catch (err) {
    const error = err as PostgrestError;
    return { classId: null, error: error.message || "Failed to generate class ID" };
  }
}

/**
 * Create a new class in the classes table
 */
export async function createClass(
  courseUuid: string,
  className: string,
  courseCode: string,
  classId: string
): Promise<ClassResponse> {
  try {
    const supabase = createSupabaseClient();
    const { error } = await supabase.from("classes").insert({
      course_uuid: courseUuid,
      class_name: className,
      course_code: courseCode,
      class_id: classId,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    const error = err as PostgrestError;
    return { success: false, error: error.message || "Failed to create class" };
  }
}

