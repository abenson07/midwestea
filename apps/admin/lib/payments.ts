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

export interface TransactionWithDetails {
  id: string;
  invoice_number: string | null;
  student_id: string | null;
  class_id: string | null;
  transaction_type: 'registration_fee' | 'tuition_a' | 'tuition_b' | null;
  quantity: number | null;
  amount_due: number | null;
  transaction_status: string | null;
  due_date: string | null;
  student_name?: string;
  student_email?: string | null;
  class_id_display?: string; // The actual class_id from classes table
}

/**
 * Fetch all transactions with joins to students and classes
 */
export async function getTransactions(): Promise<{ transactions: TransactionWithDetails[] | null; error: string | null }> {
  try {
    console.log("[getTransactions] Starting...");
    const supabase = await createSupabaseClient();
    console.log("[getTransactions] Supabase client created");
    const { data, error } = await supabase
      .from("transactions")
      .select(`
        *,
        students (
          id,
          full_name
        ),
        classes (
          id,
          class_id
        )
      `)
      .order("created_at", { ascending: false });

    console.log("[getTransactions] Query result:", { data, error, dataLength: data?.length });

    if (error) {
      console.error("[getTransactions] Error fetching transactions:", error);
      return { transactions: null, error: error.message };
    }

    if (!data) {
      console.log("[getTransactions] No data returned");
      return { transactions: [], error: null };
    }

    // Get unique student IDs to fetch emails
    const studentIds = [...new Set(data.map((t: any) => t.student_id).filter(Boolean))];
    
    // Fetch emails from auth.users via API route
    const emailMap = new Map<string, string | null>();
    if (studentIds.length > 0) {
      try {
        // Get session token for authorization
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;
        
        if (token) {
          const basePath = typeof window !== 'undefined' 
            ? (window.location.pathname.startsWith('/app') ? '/app' : '')
            : '';
          
          // Fetch emails in batches
          const emailPromises = studentIds.map(async (studentId: string) => {
            try {
              const response = await fetch(`${basePath}/api/students/${studentId}/email`, {
                headers: {
                  'Authorization': `Bearer ${token}`,
                },
              });
              if (response.ok) {
                const result = await response.json();
                if (result.success) {
                  return { studentId, email: result.email };
                }
              }
            } catch (err) {
              console.warn(`[getTransactions] Failed to fetch email for student ${studentId}:`, err);
            }
            return { studentId, email: null };
          });
          
          const emailResults = await Promise.all(emailPromises);
          emailResults.forEach(({ studentId, email }) => {
            emailMap.set(studentId, email);
          });
        }
      } catch (err) {
        console.warn("[getTransactions] Error fetching emails:", err);
        // Continue without emails
      }
    }

    // Transform transactions to include student and class details
    const transactionsWithDetails: TransactionWithDetails[] = data.map((transaction: any) => {
      const student = transaction.students;
      const classRecord = transaction.classes;

      // Get student name from full_name
      const studentName = student?.full_name || "Unknown Student";

      // Get student email from emailMap
      const studentEmail = transaction.student_id ? emailMap.get(transaction.student_id) || null : null;

      // Get class_id from classes table
      const classIdDisplay = classRecord?.class_id || transaction.class_id || "N/A";

      return {
        id: transaction.id,
        invoice_number: transaction.invoice_number,
        student_id: transaction.student_id,
        class_id: transaction.class_id,
        transaction_type: transaction.transaction_type,
        quantity: transaction.quantity,
        amount_due: transaction.amount_due,
        transaction_status: transaction.transaction_status,
        due_date: transaction.due_date,
        student_name: studentName,
        student_email: studentEmail,
        class_id_display: classIdDisplay,
      };
    });

    return { transactions: transactionsWithDetails, error: null };
  } catch (err) {
    const error = err as PostgrestError;
    return { transactions: null, error: error.message || "Failed to fetch transactions" };
  }
}

