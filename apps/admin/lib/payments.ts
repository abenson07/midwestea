"use client";

console.log("[payments.ts] Module loaded");

import { createSupabaseClient } from "@midwestea/utils";
import type { PostgrestError } from "@supabase/supabase-js";
import type { Payment } from "@midwestea/types";

export interface PaymentWithDetails extends Payment {
  student_name?: string;
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
      if (student) {
        const firstName = student.first_name || "";
        const lastName = student.last_name || "";
        studentName = firstName || lastName 
          ? `${firstName} ${lastName}`.trim() 
          : "Unknown Student";
      }

      // Get class name
      const className = classRecord?.class_name || "Unknown Class";

      return {
        ...payment,
        enrollment_id: payment.enrollment_id,
        student_name: studentName,
        class_name: className,
      };
    });

    return { payments: paymentsWithDetails, error: null };
  } catch (err) {
    const error = err as PostgrestError;
    return { payments: null, error: error.message || "Failed to fetch payments" };
  }
}

