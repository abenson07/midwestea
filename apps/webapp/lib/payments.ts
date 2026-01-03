"use client";

import { createSupabaseClient } from "@midwestea/utils";
import type { PostgrestError } from "@supabase/supabase-js";
import type { Payment } from "@midwestea/types";

export interface PaymentWithDetails extends Payment {
  student_name?: string;
  student_id?: string;
  class_name?: string;
  enrollment_id: string;
}

/**
 * Fetch all payments with joins to enrollments, students, and classes
 */
export async function getPayments(): Promise<{ payments: PaymentWithDetails[] | null; error: string | null }> {
  try {
    console.log("[getPayments] Starting...");
    const supabase = await createSupabaseClient();
    console.log("[getPayments] Supabase client created");
    const { data, error } = await supabase
      .from("payments")
      .select(`
        *,
        enrollments (
          *,
          students (*),
          classes (*)
        )
      `)
      .order("created_at", { ascending: false });

    console.log("[getPayments] Query result:", { data, error, dataLength: data?.length });

    if (error) {
      console.error("[getPayments] Error fetching payments:", error);
      return { payments: null, error: error.message };
    }

    if (!data) {
      console.log("[getPayments] No data returned");
      return { payments: [], error: null };
    }

    // Transform payments to include student and class names
    const paymentsWithDetails: PaymentWithDetails[] = data.map((payment: any) => {
      const enrollment = payment.enrollments;
      const student = enrollment?.students;
      const classRecord = enrollment?.classes;

      // Format student name
      let studentName = "Unknown Student";
      let studentId: string | undefined;
      if (student) {
        studentName = student.full_name || "Unknown Student";
        studentId = student.id;
      }

      // Get class name
      const className = classRecord?.class_name || "Unknown Class";

      return {
        ...payment,
        enrollment_id: payment.enrollment_id,
        student_name: studentName,
        student_id: studentId,
        class_name: className,
      };
    });

    return { payments: paymentsWithDetails, error: null };
  } catch (err) {
    const error = err as PostgrestError;
    return { payments: null, error: error.message || "Failed to fetch payments" };
  }
}

/**
 * Fetch all payments for a specific student (via enrollments)
 */
export async function getPaymentsByStudentId(studentId: string): Promise<{ payments: PaymentWithDetails[] | null; error: string | null }> {
  try {
    console.log("[getPaymentsByStudentId] Starting for studentId:", studentId);
    const supabase = await createSupabaseClient();
    console.log("[getPaymentsByStudentId] Supabase client created");
    
    // First, get all enrollments for this student
    const { data: enrollments, error: enrollmentError } = await supabase
      .from("enrollments")
      .select("id")
      .eq("student_id", studentId);

    if (enrollmentError) {
      console.error("[getPaymentsByStudentId] Error fetching enrollments:", enrollmentError);
      return { payments: null, error: enrollmentError.message };
    }

    if (!enrollments || enrollments.length === 0) {
      console.log("[getPaymentsByStudentId] No enrollments found for student");
      return { payments: [], error: null };
    }

    // Extract enrollment IDs
    const enrollmentIds = enrollments.map((e: any) => e.id);

    // Now get all payments for these enrollments
    const { data, error } = await supabase
      .from("payments")
      .select(`
        *,
        enrollments (
          *,
          students (*),
          classes (*)
        )
      `)
      .in("enrollment_id", enrollmentIds)
      .order("created_at", { ascending: false });

    console.log("[getPaymentsByStudentId] Query result:", { data, error, dataLength: data?.length });

    if (error) {
      console.error("[getPaymentsByStudentId] Error fetching payments for student:", error);
      return { payments: null, error: error.message };
    }

    if (!data) {
      console.log("[getPaymentsByStudentId] No data returned");
      return { payments: [], error: null };
    }

    // Transform payments to include student and class names
    const paymentsWithDetails: PaymentWithDetails[] = data.map((payment: any) => {
      const enrollment = payment.enrollments;
      const student = enrollment?.students;
      const classRecord = enrollment?.classes;

      // Format student name
      let studentName = "Unknown Student";
      let studentId: string | undefined;
      if (student) {
        studentName = student.full_name || "Unknown Student";
        studentId = student.id;
      }

      // Get class name
      const className = classRecord?.class_name || "Unknown Class";

      return {
        ...payment,
        enrollment_id: payment.enrollment_id,
        student_name: studentName,
        student_id: studentId,
        class_name: className,
      };
    });

    return { payments: paymentsWithDetails, error: null };
  } catch (err) {
    const error = err as PostgrestError;
    return { payments: null, error: error.message || "Failed to fetch payments for student" };
  }
}

