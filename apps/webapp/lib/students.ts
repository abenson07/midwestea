"use client";

import { createSupabaseClient } from "@midwestea/utils";
import type { PostgrestError } from "@supabase/supabase-js";
import type { Student } from "@midwestea/types";

export interface StudentWithEmail extends Student {
  email?: string | null;
  name?: string;
}

/**
 * Fetch all students from the students table
 * Note: Email is stored in auth.users, so we'll attempt to get it via auth admin API
 * For now, we'll return students with name formatted from first_name + last_name
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

    // Transform students to include formatted name and attempt to get email
    const studentsWithEmail: StudentWithEmail[] = data.map((student) => {
      const firstName = student.first_name || "";
      const lastName = student.last_name || "";
      const name = firstName || lastName 
        ? `${firstName} ${lastName}`.trim() 
        : "Unknown Student";
      
      return {
        ...student,
        name,
        email: null, // Email will need to be fetched separately or via database view
      };
    });

    return { students: studentsWithEmail, error: null };
  } catch (err) {
    const error = err as PostgrestError;
    return { students: null, error: error.message || "Failed to fetch students" };
  }
}

/**
 * Fetch a single student by ID
 */
export async function getStudentById(id: string): Promise<{ student: StudentWithEmail | null; error: string | null }> {
  try {
    console.log("[getStudentById] Starting for id:", id);
    const supabase = await createSupabaseClient();
    console.log("[getStudentById] Supabase client created");
    const { data, error } = await supabase
      .from("students")
      .select("*")
      .eq("id", id)
      .single();

    console.log("[getStudentById] Query result:", { data, error });

    if (error) {
      console.error("[getStudentById] Error fetching student:", error);
      return { student: null, error: error.message };
    }

    if (!data) {
      console.log("[getStudentById] No data returned");
      return { student: null, error: null };
    }

    // Transform student to include formatted name
    const firstName = data.first_name || "";
    const lastName = data.last_name || "";
    const name = firstName || lastName 
      ? `${firstName} ${lastName}`.trim() 
      : "Unknown Student";

    // Fetch email from auth via API route
    let email: string | null = null;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const basePath = typeof window !== 'undefined' 
          ? (window.location.pathname.startsWith('/app') ? '/app' : '')
          : '';
        
        const emailResponse = await fetch(`${basePath}/api/students/${id}/email`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
        });

        if (emailResponse.ok) {
          const emailResult = await emailResponse.json();
          if (emailResult.success) {
            email = emailResult.email;
          }
        }
      }
    } catch (emailError) {
      console.warn("[getStudentById] Failed to fetch email:", emailError);
      // Don't fail the whole request if email fetch fails
    }

    const studentWithEmail: StudentWithEmail = {
      ...data,
      name,
      email,
    };

    return { student: studentWithEmail, error: null };
  } catch (err) {
    const error = err as PostgrestError;
    return { student: null, error: error.message || "Failed to fetch student" };
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

    // Transform enrollments to extract students
    const studentsWithEmail: StudentWithEmail[] = data
      .map((enrollment: any) => {
        const student = enrollment.students;
        if (!student) return null;

        const firstName = student.first_name || "";
        const lastName = student.last_name || "";
        const name = firstName || lastName 
          ? `${firstName} ${lastName}`.trim() 
          : "Unknown Student";

        return {
          ...student,
          name,
          email: null, // Email will need to be fetched separately or via database view
        };
      })
      .filter((student): student is StudentWithEmail => student !== null);

    return { students: studentsWithEmail, error: null };
  } catch (err) {
    const error = err as PostgrestError;
    return { students: null, error: error.message || "Failed to fetch students for class" };
  }
}

/**
 * Update a student in the students table
 */
export async function updateStudent(
  id: string,
  firstName?: string | null,
  lastName?: string | null,
  phone?: string | null,
  tShirtSize?: string | null,
  emergencyContactName?: string | null,
  emergencyContactPhone?: string | null,
  hasRequiredInfo?: boolean | null,
  email?: string | null
): Promise<{ success: boolean; error: string | null }> {
  try {
    const supabase = await createSupabaseClient();
    
    // If email is provided and not null/empty, update it via API route (requires admin access)
    if (email !== undefined && email !== null && email.trim() !== '') {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          return { success: false, error: "Not authenticated" };
        }

        const basePath = typeof window !== 'undefined' 
          ? (window.location.pathname.startsWith('/app') ? '/app' : '')
          : '';
        
        console.log(`[updateStudent] Calling update-email API for student ${id} with email: ${email.trim()}`);
        
        const emailResponse = await fetch(`${basePath}/api/students/${id}/update-email`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ email: email.trim() }),
        });

        console.log(`[updateStudent] Email API response status: ${emailResponse.status}`);

        if (!emailResponse.ok) {
          let errorMessage = `HTTP ${emailResponse.status}: Failed to update email`;
          try {
            const errorText = await emailResponse.text();
            console.error(`[updateStudent] Email API error response:`, errorText);
            try {
              const errorData = JSON.parse(errorText);
              errorMessage = errorData.error || errorMessage;
            } catch {
              errorMessage = errorText || errorMessage;
            }
          } catch (parseError) {
            console.error('[updateStudent] Error parsing error response:', parseError);
            errorMessage = emailResponse.statusText || errorMessage;
          }
          return { success: false, error: errorMessage };
        }

        const emailResult = await emailResponse.json();
        console.log(`[updateStudent] Email API result:`, emailResult);
        
        if (!emailResult.success) {
          return { success: false, error: emailResult.error || "Failed to update email" };
        }
      } catch (emailError: any) {
        console.error('[updateStudent] Exception updating email:', emailError);
        return { success: false, error: emailError.message || "Failed to update email" };
      }
    }

    // Update student table fields
    const updateData: any = {};

    if (firstName !== undefined) updateData.first_name = firstName;
    if (lastName !== undefined) updateData.last_name = lastName;
    if (phone !== undefined) updateData.phone = phone;
    if (tShirtSize !== undefined) updateData.t_shirt_size = tShirtSize;
    if (emergencyContactName !== undefined) updateData.emergency_contact_name = emergencyContactName;
    if (emergencyContactPhone !== undefined) updateData.emergency_contact_phone = emergencyContactPhone;
    if (hasRequiredInfo !== undefined) updateData.has_required_info = hasRequiredInfo;

    const { error } = await supabase
      .from("students")
      .update(updateData)
      .eq("id", id);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, error: null };
  } catch (err) {
    const error = err as PostgrestError;
    return { success: false, error: error.message || "Failed to update student" };
  }
}

