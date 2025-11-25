"use client";

import { createSupabaseClient } from "@midwestea/utils";
import type { PostgrestError } from "@supabase/supabase-js";

export interface Course {
  id: string;
  course_name: string;
  course_code: string;
  length_of_class: string | null;
  certification_length: number | null;
  graduation_rate: number | null;
  registration_limit: number | null;
  price: number | null;
  registration_fee: number | null;
  stripe_product_id: string | null;
}

export interface ClassResponse {
  success: boolean;
  error?: string;
}

export interface Class {
  id: string;
  course_uuid: string;
  class_name: string;
  course_code: string;
  class_id: string;
  enrollment_start: string | null;
  enrollment_close: string | null;
  class_start_date: string | null;
  class_close_date: string | null;
  is_online: boolean;
  length_of_class: string | null;
  certification_length: number | null;
  graduation_rate: number | null;
  registration_limit: number | null;
  price: number | null;
  registration_fee: number | null;
  product_id: string | null;
}

/**
 * Fetch all classes from the classes table
 */
export async function getClasses(): Promise<{ classes: Class[] | null; error: string | null }> {
  try {
    const supabase = createSupabaseClient();
    const { data, error } = await supabase
      .from("classes")
      .select("*")
      .order("class_id");

    if (error) {
      return { classes: null, error: error.message };
    }

    return { classes: data as Class[], error: null };
  } catch (err) {
    const error = err as PostgrestError;
    return { classes: null, error: error.message || "Failed to fetch classes" };
  }
}

/**
 * Fetch all courses from the courses table
 */
export async function getCourses(): Promise<{ courses: Course[] | null; error: string | null }> {
  try {
    const supabase = createSupabaseClient();
    const { data, error } = await supabase
      .from("courses")
      .select("id, course_name, course_code, length_of_class, certification_length, graduation_rate, registration_limit, price, registration_fee, stripe_product_id")
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
 * Format: course_code + "-" + 3-digit number (e.g., CABS-001)
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

    // If no existing classes, start at 001
    if (!data || data.length === 0) {
      const classId = `${courseCode}-001`;
      return { classId, error: null };
    }

    // Extract numeric suffixes from existing class_ids
    // Support both old format (COURSECODE0001) and new format (COURSECODE-001)
    const numericSuffixes = data
      .map((classItem) => {
        const classId = classItem.class_id;
        if (!classId || typeof classId !== "string") return null;
        
        // Try new format first: COURSECODE-001
        if (classId.includes("-")) {
          const parts = classId.split("-");
          if (parts.length === 2 && parts[0] === courseCode) {
            const num = parseInt(parts[1], 10);
            return isNaN(num) ? null : num;
          }
        }
        
        // Fall back to old format: COURSECODE0001 (for backward compatibility)
        const numericPart = classId.replace(courseCode, "").replace("-", "");
        const num = parseInt(numericPart, 10);
        return isNaN(num) ? null : num;
      })
      .filter((num): num is number => num !== null);

    // Find max and increment
    const maxNum = numericSuffixes.length > 0 ? Math.max(...numericSuffixes) : 0;
    const nextNum = maxNum + 1;

    // Format as 3-digit zero-padded string with dash separator
    const paddedNum = nextNum.toString().padStart(3, "0");
    const classId = `${courseCode}-${paddedNum}`;

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
  classId: string,
  enrollmentStart?: string | null,
  enrollmentClose?: string | null,
  classStartDate?: string | null,
  classCloseDate?: string | null,
  isOnline?: boolean,
  lengthOfClass?: string | null,
  certificationLength?: number | null,
  graduationRate?: number | null,
  registrationLimit?: number | null,
  price?: number | null,
  registrationFee?: number | null,
  productId?: string | null
): Promise<ClassResponse> {
  try {
    const supabase = createSupabaseClient();
    const { error } = await supabase.from("classes").insert({
      course_uuid: courseUuid,
      class_name: className,
      course_code: courseCode,
      class_id: classId,
      enrollment_start: enrollmentStart || null,
      enrollment_close: enrollmentClose || null,
      class_start_date: classStartDate || null,
      class_close_date: classCloseDate || null,
      is_online: isOnline || false,
      length_of_class: lengthOfClass || null,
      certification_length: certificationLength || null,
      graduation_rate: graduationRate || null,
      registration_limit: registrationLimit || null,
      price: price || null,
      registration_fee: registrationFee || null,
      product_id: productId || null,
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

/**
 * Fetch a single class by ID
 */
export async function getClassById(id: string): Promise<{ class: Class | null; error: string | null }> {
  try {
    const supabase = createSupabaseClient();
    const { data, error } = await supabase
      .from("classes")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      return { class: null, error: error.message };
    }

    return { class: data as Class, error: null };
  } catch (err) {
    const error = err as PostgrestError;
    return { class: null, error: error.message || "Failed to fetch class" };
  }
}

/**
 * Update a class in the classes table
 */
export async function updateClass(
  id: string,
  enrollmentStart?: string | null,
  enrollmentClose?: string | null,
  classStartDate?: string | null,
  classCloseDate?: string | null,
  isOnline?: boolean,
  lengthOfClass?: string | null,
  certificationLength?: number | null,
  graduationRate?: number | null,
  registrationLimit?: number | null,
  price?: number | null,
  registrationFee?: number | null
): Promise<ClassResponse> {
  try {
    const supabase = createSupabaseClient();
    const updateData: any = {};
    
    if (enrollmentStart !== undefined) updateData.enrollment_start = enrollmentStart;
    if (enrollmentClose !== undefined) updateData.enrollment_close = enrollmentClose;
    if (classStartDate !== undefined) updateData.class_start_date = classStartDate;
    if (classCloseDate !== undefined) updateData.class_close_date = classCloseDate;
    if (isOnline !== undefined) updateData.is_online = isOnline;
    if (lengthOfClass !== undefined) updateData.length_of_class = lengthOfClass;
    if (certificationLength !== undefined) updateData.certification_length = certificationLength;
    if (graduationRate !== undefined) updateData.graduation_rate = graduationRate;
    if (registrationLimit !== undefined) updateData.registration_limit = registrationLimit;
    if (price !== undefined) updateData.price = price;
    if (registrationFee !== undefined) updateData.registration_fee = registrationFee;

    const { error } = await supabase
      .from("classes")
      .update(updateData)
      .eq("id", id);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    const error = err as PostgrestError;
    return { success: false, error: error.message || "Failed to update class" };
  }
}

