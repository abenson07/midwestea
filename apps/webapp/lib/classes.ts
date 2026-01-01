"use client";

import { createSupabaseClient } from "@midwestea/utils";
import type { PostgrestError } from "@supabase/supabase-js";

export interface Course {
  id: string;
  course_name: string;
  course_code: string;
  program_type: string | null;
  programming_offering: string | null;
  course_image: string | null;
  length_of_class: string | null;
  certification_length: number | null;
  registration_limit: number | null;
  price: number | null;
  registration_fee: number | null;
  stripe_product_id: string | null;
}

export interface ClassResponse {
  success: boolean;
  error?: string;
  class?: Class;
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
  programming_offering: string | null;
  length_of_class: string | null;
  certification_length: number | null;
  registration_limit: number | null;
  price: number | null;
  registration_fee: number | null;
  product_id: string | null;
  webflow_item_id: string | null;
  location: string | null;
}

/**
 * Maps Supabase/PostgREST errors to user-friendly messages
 */
function mapDatabaseError(error: PostgrestError | Error, context: string = ""): string {
  const errorMessage = error.message?.toLowerCase() || "";
  const errorCode = (error as PostgrestError).code;

  // Handle "Cannot coerce the result to a single JSON object"
  if (errorMessage.includes("cannot coerce") || errorMessage.includes("coerce the result")) {
    if (context.includes("class")) {
      return "This class doesn't exist or may have been removed.";
    }
    if (context.includes("course")) {
      return "This course doesn't exist or may have been removed.";
    }
    return "We couldn't find what you're looking for.";
  }

  // Handle PGRST116 - No rows returned
  if (errorCode === "PGRST116" || errorMessage.includes("no rows returned")) {
    if (context.includes("class")) {
      return "This class doesn't exist or may have been removed.";
    }
    if (context.includes("course")) {
      return "This course doesn't exist or may have been removed.";
    }
    return "We couldn't find what you're looking for.";
  }

  // Return original message for other errors
  return error.message || "Something went wrong. Please try again.";
}

/**
 * Fetch all classes from the classes table
 */
export async function getClasses(): Promise<{ classes: Class[] | null; error: string | null }> {
  try {
    const supabase = await createSupabaseClient();
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
 * Fetch all courses from the courses table (where program_type is 'course' or null)
 */
export async function getCourses(): Promise<{ courses: Course[] | null; error: string | null }> {
  try {
    const supabase = await createSupabaseClient();
    const { data, error } = await supabase
      .from("courses")
      .select("id, course_name, course_code, program_type, programming_offering, course_image, length_of_class, certification_length, registration_limit, price, registration_fee, stripe_product_id")
      .or("program_type.eq.course,program_type.is.null")
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
 * Fetch all programs from the courses table (where program_type is 'program')
 */
export async function getPrograms(): Promise<{ programs: Course[] | null; error: string | null }> {
  try {
    const supabase = await createSupabaseClient();
    const { data, error } = await supabase
      .from("courses")
      .select("id, course_name, course_code, program_type, programming_offering, course_image, length_of_class, certification_length, registration_limit, price, registration_fee, stripe_product_id")
      .eq("program_type", "program")
      .order("course_code");

    if (error) {
      return { programs: null, error: error.message };
    }

    return { programs: data as Course[], error: null };
  } catch (err) {
    const error = err as PostgrestError;
    return { programs: null, error: error.message || "Failed to fetch programs" };
  }
}

/**
 * Generate a class_id by finding the max existing class_id for a given course_code
 * Format: course_code + "-" + 3-digit number (e.g., CABS-001)
 */
export async function generateClassId(courseCode: string): Promise<{ classId: string | null; error: string | null }> {
  try {
    const supabase = await createSupabaseClient();

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
 * Create a new class in the classes table (via server-side API route)
 * This ensures Webflow sync happens server-side with proper authentication
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
  programmingOffering?: string | null,
  lengthOfClass?: string | null,
  certificationLength?: number | null,
  registrationLimit?: number | null,
  price?: number | null,
  registrationFee?: number | null,
  productId?: string | null,
  location?: string | null
): Promise<ClassResponse> {
  try {
    console.log('[Client] Starting class creation...');
    // Get the current session token for authentication
    const supabase = await createSupabaseClient();
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session) {
      console.error('[Client] Authentication failed:', sessionError);
      return { success: false, error: 'Not authenticated. Please log in.' };
    }

    console.log('[Client] Session found, calling API route...');
    // Determine base path for API route
    const basePath = typeof window !== 'undefined' 
      ? (window.location.pathname.startsWith('/app') ? '/app' : '')
      : '';

    const apiUrl = `${basePath}/api/classes/create`;
    console.log('[Client] Calling API:', apiUrl);

    // Call the server-side API route
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        courseUuid,
        className,
        courseCode,
        classId,
        enrollmentStart,
        enrollmentClose,
        classStartDate,
        classCloseDate,
        isOnline,
        programmingOffering,
        classImage,
        lengthOfClass,
        certificationLength,
        registrationLimit,
        price,
        registrationFee,
        productId,
        location,
      }),
    });

    console.log('[Client] API response status:', response.status);
    const result = await response.json();
    console.log('[Client] API response:', result);

    if (!response.ok) {
      console.error('[Client] API error:', result.error);
      return { success: false, error: result.error || 'Failed to create class' };
    }

    // Log Webflow sync status
    if (result.webflowSync) {
      if (result.webflowSync.success) {
        console.log('[Client] Webflow sync successful, item ID:', result.webflowSync.webflowItemId);
      } else {
        console.error('[Client] Webflow sync failed:', result.webflowSync.error);
      }
    }

    console.log('[Client] Class created successfully, webflow_item_id:', result.class?.webflow_item_id);
    return { success: true, class: result.class as Class };
  } catch (err: any) {
    console.error('[Client] Exception creating class:', err);
    return { success: false, error: err.message || "Failed to create class" };
  }
}

/**
 * Fetch a single class by ID
 */
export async function getClassById(id: string): Promise<{ class: Class | null; error: string | null }> {
  try {
    const supabase = await createSupabaseClient();
    const { data, error } = await supabase
      .from("classes")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      return { class: null, error: mapDatabaseError(error, "class") };
    }

    return { class: data as Class, error: null };
  } catch (err) {
    const error = err as PostgrestError;
    return { class: null, error: mapDatabaseError(error, "class") };
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
  programmingOffering?: string | null,
  lengthOfClass?: string | null,
  certificationLength?: number | null,
  registrationLimit?: number | null,
  price?: number | null,
  registrationFee?: number | null,
  location?: string | null,
  className?: string | null
): Promise<ClassResponse> {
  try {
    const supabase = await createSupabaseClient();
    
    // First, get the current class to check for webflow_item_id
    const { data: currentClass, error: fetchError } = await supabase
      .from("classes")
      .select("webflow_item_id, course_uuid")
      .eq("id", id)
      .single();

    if (fetchError) {
      return { success: false, error: fetchError.message };
    }

    const updateData: any = {};

    if (enrollmentStart !== undefined) updateData.enrollment_start = enrollmentStart;
    if (enrollmentClose !== undefined) updateData.enrollment_close = enrollmentClose;
    if (classStartDate !== undefined) updateData.class_start_date = classStartDate;
    if (classCloseDate !== undefined) updateData.class_close_date = classCloseDate;
    if (isOnline !== undefined) updateData.is_online = isOnline;
    if (programmingOffering !== undefined) updateData.programming_offering = programmingOffering;
    if (lengthOfClass !== undefined) updateData.length_of_class = lengthOfClass;
    if (certificationLength !== undefined) updateData.certification_length = certificationLength;
    if (registrationLimit !== undefined) updateData.registration_limit = registrationLimit;
    if (price !== undefined) updateData.price = price;
    if (registrationFee !== undefined) updateData.registration_fee = registrationFee;
    if (location !== undefined) updateData.location = location;
    if (className !== undefined) updateData.class_name = className;

    const { error } = await supabase
      .from("classes")
      .update(updateData)
      .eq("id", id);

    if (error) {
      return { success: false, error: error.message };
    }

    // TODO: Webflow sync for updates should be moved to a server-side API route
    // For now, updates only happen in Supabase
    // The webflow_item_id is preserved, but Webflow won't be updated until we add an update API route

    return { success: true };
  } catch (err) {
    const error = err as PostgrestError;
    return { success: false, error: error.message || "Failed to update class" };
  }
}


/**
 * Fetch a single course by ID
 */
export async function getCourseById(id: string): Promise<{ course: Course | null; error: string | null }> {
  try {
    const supabase = await createSupabaseClient();
    const { data, error } = await supabase
      .from("courses")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      return { course: null, error: mapDatabaseError(error, "course") };
    }

    return { course: data as Course, error: null };
  } catch (err) {
    const error = err as PostgrestError;
    return { course: null, error: mapDatabaseError(error, "course") };
  }
}

/**
 * Update a course in the courses table
 */
export async function updateCourse(
  id: string,
  courseName?: string,
  courseCode?: string,
  programmingOffering?: string | null,
  courseImage?: string | null,
  lengthOfClass?: string | null,
  certificationLength?: number | null,
  registrationLimit?: number | null,
  price?: number | null,
  registrationFee?: number | null,
  stripeProductId?: string | null
): Promise<ClassResponse> {
  try {
    const supabase = await createSupabaseClient();
    const updateData: any = {};

    if (courseName !== undefined) updateData.course_name = courseName;
    if (courseCode !== undefined) updateData.course_code = courseCode;
    if (programmingOffering !== undefined) updateData.programming_offering = programmingOffering;
    if (courseImage !== undefined) updateData.course_image = courseImage;
    if (courseImage !== undefined) updateData.course_image = courseImage;
    if (lengthOfClass !== undefined) updateData.length_of_class = lengthOfClass;
    if (certificationLength !== undefined) updateData.certification_length = certificationLength;
    if (registrationLimit !== undefined) updateData.registration_limit = registrationLimit;
    if (price !== undefined) updateData.price = price;
    if (registrationFee !== undefined) updateData.registration_fee = registrationFee;
    if (stripeProductId !== undefined) updateData.stripe_product_id = stripeProductId;

    const { error } = await supabase
      .from("courses")
      .update(updateData)
      .eq("id", id);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    const error = err as PostgrestError;
    return { success: false, error: error.message || "Failed to update course" };
  }
}

/**
 * Create a new course in the courses table
 */
export async function createCourse(
  courseName: string,
  courseCode: string,
  lengthOfClass?: string | null,
  certificationLength?: number | null,
  registrationLimit?: number | null,
  price?: number | null,
  registrationFee?: number | null,
  stripeProductId?: string | null
): Promise<{ success: boolean; course?: Course; error?: string }> {
  try {
    const supabase = await createSupabaseClient();
    const { data, error } = await supabase
      .from("courses")
      .insert({
        course_name: courseName,
        course_code: courseCode,
        program_type: "course",
        length_of_class: lengthOfClass || null,
        certification_length: certificationLength || null,
        registration_limit: registrationLimit || null,
        price: price || null,
        registration_fee: registrationFee || null,
        stripe_product_id: stripeProductId || null,
      })
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, course: data as Course };
  } catch (err) {
    const error = err as PostgrestError;
    return { success: false, error: error.message || "Failed to create course" };
  }
}

/**
 * Create a new program in the courses table
 */
export async function createProgram(
  courseName: string,
  courseCode: string,
  lengthOfClass?: string | null,
  certificationLength?: number | null,
  registrationLimit?: number | null,
  price?: number | null,
  registrationFee?: number | null,
  stripeProductId?: string | null
): Promise<{ success: boolean; program?: Course; error?: string }> {
  try {
    const supabase = await createSupabaseClient();
    const { data, error } = await supabase
      .from("courses")
      .insert({
        course_name: courseName,
        course_code: courseCode,
        program_type: "program",
        length_of_class: lengthOfClass || null,
        certification_length: certificationLength || null,
        registration_limit: registrationLimit || null,
        price: price || null,
        registration_fee: registrationFee || null,
        stripe_product_id: stripeProductId || null,
      })
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, program: data as Course };
  } catch (err) {
    const error = err as PostgrestError;
    return { success: false, error: error.message || "Failed to create program" };
  }
}

/**
 * Fetch all classes for a specific student (via enrollments)
 */
export async function getClassesByStudentId(studentId: string): Promise<{ classes: Class[] | null; error: string | null }> {
  try {
    console.log("[getClassesByStudentId] Starting for studentId:", studentId);
    const supabase = await createSupabaseClient();
    const { data, error } = await supabase
      .from("enrollments")
      .select(`
        *,
        classes (*)
      `)
      .eq("student_id", studentId)
      .order("enrolled_at", { ascending: false });

    console.log("[getClassesByStudentId] Query result:", { data, error, dataLength: data?.length });

    if (error) {
      console.error("[getClassesByStudentId] Error fetching classes for student:", error);
      return { classes: null, error: error.message };
    }

    if (!data) {
      console.log("[getClassesByStudentId] No data returned");
      return { classes: [], error: null };
    }

    // Transform enrollments to extract classes
    const classes: Class[] = data
      .map((enrollment: any) => {
        const classRecord = enrollment.classes;
        if (!classRecord) return null;
        return classRecord as Class;
      })
      .filter((classRecord): classRecord is Class => classRecord !== null);

    return { classes, error: null };
  } catch (err) {
    const error = err as PostgrestError;
    return { classes: null, error: error.message || "Failed to fetch classes for student" };
  }
}

/**
 * Delete a class from the classes table (via server-side API route)
 */
export async function deleteClass(classId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createSupabaseClient();
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session) {
      return { success: false, error: 'Not authenticated. Please log in.' };
    }

    const basePath = typeof window !== 'undefined' 
      ? (window.location.pathname.startsWith('/app') ? '/app' : '')
      : '';

    const response = await fetch(`${basePath}/api/classes/${classId}/delete`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
    });

    if (!response.ok) {
      const result = await response.json();
      return { success: false, error: result.error || 'Failed to delete class' };
    }

    return { success: true };
  } catch (err) {
    const error = err as Error;
    return { success: false, error: error.message || 'Failed to delete class' };
  }
}
