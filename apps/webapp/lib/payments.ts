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
 * NOTE: Now uses transactions table instead of payments table
 */
export async function getPayments(): Promise<{ payments: PaymentWithDetails[] | null; error: string | null }> {
  try {
    console.log("[getPayments] Starting...");
    const supabase = await createSupabaseClient();
    console.log("[getPayments] Supabase client created");
    const { data, error } = await supabase
      .from("transactions")
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
      console.error("[getPayments] Error fetching transactions:", error);
      return { payments: null, error: error.message };
    }

    if (!data) {
      console.log("[getPayments] No data returned");
      return { payments: [], error: null };
    }

    // Transform transactions to include student and class names
    // Map transaction fields to payment fields for compatibility
    const paymentsWithDetails: PaymentWithDetails[] = data.map((transaction: any) => {
      const enrollment = transaction.enrollments;
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

      // Map transaction fields to payment fields
      return {
        id: transaction.id,
        enrollment_id: transaction.enrollment_id,
        amount_cents: transaction.amount_paid || transaction.amount_due || 0,
        stripe_payment_intent_id: transaction.stripe_payment_intent_id,
        stripe_receipt_url: null, // transactions table doesn't have this field
        payment_status: transaction.transaction_status || 'pending',
        paid_at: transaction.payment_date,
        created_at: transaction.created_at,
        updated_at: transaction.updated_at,
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
 * NOTE: Now uses transactions table instead of payments table
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

    // Now get all transactions for these enrollments
    const { data, error } = await supabase
      .from("transactions")
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
      console.error("[getPaymentsByStudentId] Error fetching transactions for student:", error);
      return { payments: null, error: error.message };
    }

    if (!data) {
      console.log("[getPaymentsByStudentId] No data returned");
      return { payments: [], error: null };
    }

    // Transform transactions to include student and class names
    // Map transaction fields to payment fields for compatibility
    const paymentsWithDetails: PaymentWithDetails[] = data.map((transaction: any) => {
      const enrollment = transaction.enrollments;
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

      // Map transaction fields to payment fields
      return {
        id: transaction.id,
        enrollment_id: transaction.enrollment_id,
        amount_cents: transaction.amount_paid || transaction.amount_due || 0,
        stripe_payment_intent_id: transaction.stripe_payment_intent_id,
        stripe_receipt_url: null, // transactions table doesn't have this field
        payment_status: transaction.transaction_status || 'pending',
        paid_at: transaction.payment_date,
        created_at: transaction.created_at,
        updated_at: transaction.updated_at,
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
  payout_id?: string | null;
  payout_date?: string | null;
  reconciled?: boolean;
  reconciliation_date?: string | null;
  payment_date?: string | null;
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
        payout_id: transaction.payout_id || null,
        payout_date: transaction.payout_date || null,
        reconciled: transaction.reconciled || false,
        reconciliation_date: transaction.reconciliation_date || null,
        payment_date: transaction.payment_date || null,
      };
    });

    return { transactions: transactionsWithDetails, error: null };
  } catch (err) {
    const error = err as PostgrestError;
    return { transactions: null, error: error.message || "Failed to fetch transactions" };
  }
}

/**
 * Update transaction status
 */
export async function updateTransactionStatus(
  transactionId: string,
  status: 'pending' | 'paid' | 'cancelled' | 'refunded'
): Promise<{ success: boolean; error: string | null }> {
  try {
    console.log("[updateTransactionStatus] Updating transaction:", { transactionId, status });
    const supabase = await createSupabaseClient();
    
    const { error } = await supabase
      .from("transactions")
      .update({ transaction_status: status })
      .eq("id", transactionId);

    if (error) {
      console.error("[updateTransactionStatus] Error updating transaction:", error);
      return { success: false, error: error.message };
    }

    console.log("[updateTransactionStatus] Transaction updated successfully");
    return { success: true, error: null };
  } catch (err) {
    const error = err as PostgrestError;
    return { success: false, error: error.message || "Failed to update transaction status" };
  }
}

/**
 * Payout transaction with details for reconciliation
 */
export interface PayoutTransaction {
  id: string;
  invoice_number: string | null;
  student_email: string | null;
  payment_amount: number | null;
  payment_date: string | null;
  payout_date: string | null;
  payout_id: string;
}

/**
 * Payout group with transactions and metadata
 */
export interface PayoutGroup {
  payout_id: string;
  payout_date: string | null;
  payout_total: number;
  transactions: PayoutTransaction[];
}

/**
 * Get payouts to reconcile (grouped by payout_id)
 * Returns transactions that have a payout_id but are not yet reconciled
 */
export async function getPayoutsToReconcile(): Promise<{ 
  payouts: PayoutGroup[]; 
  error: string | null 
}> {
  try {
    console.log("[getPayoutsToReconcile] Starting...");
    const supabase = await createSupabaseClient();
    
    const { data, error } = await supabase
      .from("transactions")
      .select(`
        id,
        invoice_number,
        payout_id,
        payout_date,
        payment_date,
        amount_due,
        quantity,
        student_id,
        students (
          id
        )
      `)
      .not("payout_id", "is", null)
      .eq("reconciled", false)
      .order("payout_date", { ascending: false });

    if (error) {
      console.error("[getPayoutsToReconcile] Error fetching transactions:", error);
      return { payouts: [], error: error.message };
    }

    if (!data || data.length === 0) {
      return { payouts: [], error: null };
    }

    // Get unique student IDs to fetch emails
    const studentIds = [...new Set(data.map((t: any) => t.student_id || t.students?.id).filter(Boolean))];
    const emailMap = new Map<string, string | null>();
    
    if (studentIds.length > 0) {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;
        
        if (token) {
          const basePath = typeof window !== 'undefined' 
            ? (window.location.pathname.startsWith('/app') ? '/app' : '')
            : '';
          
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
              console.warn(`[getPayoutsToReconcile] Failed to fetch email for student ${studentId}:`, err);
            }
            return { studentId, email: null };
          });
          
          const emailResults = await Promise.all(emailPromises);
          emailResults.forEach(({ studentId, email }) => {
            emailMap.set(studentId, email);
          });
        }
      } catch (err) {
        console.warn("[getPayoutsToReconcile] Error fetching emails:", err);
      }
    }

    // Group by payout_id and transform data
    const payoutsMap: Record<string, PayoutTransaction[]> = {};
    
    for (const transaction of data) {
      const payoutId = transaction.payout_id;
      if (!payoutId) continue;

      const studentId = transaction.student_id || transaction.students?.id;
      const studentEmail = studentId ? emailMap.get(studentId) || null : null;
      
      const quantity = transaction.quantity || 1;
      const amountDue = transaction.amount_due || 0;
      const paymentAmount = quantity * amountDue;

      if (!payoutsMap[payoutId]) {
        payoutsMap[payoutId] = [];
      }

      payoutsMap[payoutId].push({
        id: transaction.id,
        invoice_number: transaction.invoice_number,
        student_email: studentEmail,
        payment_amount: paymentAmount,
        payment_date: transaction.payment_date,
        payout_date: transaction.payout_date,
        payout_id: payoutId,
      });
    }

    // Convert to array of PayoutGroup with totals
    const payouts: PayoutGroup[] = Object.entries(payoutsMap).map(([payoutId, transactions]) => {
      const payoutTotal = transactions.reduce((sum, t) => sum + (t.payment_amount || 0), 0);
      const payoutDate = transactions[0]?.payout_date || null;
      
      return {
        payout_id: payoutId,
        payout_date: payoutDate,
        payout_total: payoutTotal,
        transactions,
      };
    });

    // Sort by payout_date descending
    payouts.sort((a, b) => {
      if (!a.payout_date && !b.payout_date) return 0;
      if (!a.payout_date) return 1;
      if (!b.payout_date) return -1;
      return new Date(b.payout_date).getTime() - new Date(a.payout_date).getTime();
    });

    return { payouts, error: null };
  } catch (err) {
    const error = err as PostgrestError;
    return { payouts: [], error: error.message || "Failed to fetch payouts to reconcile" };
  }
}

/**
 * Get reconciled payouts
 * Returns transactions that have been reconciled, sorted by reconciliation_date DESC
 */
export async function getReconciledPayouts(): Promise<{ 
  transactions: PayoutTransaction[]; 
  error: string | null 
}> {
  try {
    console.log("[getReconciledPayouts] Starting...");
    const supabase = await createSupabaseClient();
    
    const { data, error } = await supabase
      .from("transactions")
      .select(`
        id,
        invoice_number,
        payout_id,
        payout_date,
        payment_date,
        amount_due,
        quantity,
        reconciliation_date,
        student_id,
        students (
          id
        )
      `)
      .not("payout_id", "is", null)
      .eq("reconciled", true)
      .order("reconciliation_date", { ascending: false });

    if (error) {
      console.error("[getReconciledPayouts] Error fetching transactions:", error);
      return { transactions: [], error: error.message };
    }

    if (!data || data.length === 0) {
      return { transactions: [], error: null };
    }

    // Get unique student IDs to fetch emails
    const studentIds = [...new Set(data.map((t: any) => t.student_id || t.students?.id).filter(Boolean))];
    const emailMap = new Map<string, string | null>();
    
    if (studentIds.length > 0) {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;
        
        if (token) {
          const basePath = typeof window !== 'undefined' 
            ? (window.location.pathname.startsWith('/app') ? '/app' : '')
            : '';
          
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
              console.warn(`[getReconciledPayouts] Failed to fetch email for student ${studentId}:`, err);
            }
            return { studentId, email: null };
          });
          
          const emailResults = await Promise.all(emailPromises);
          emailResults.forEach(({ studentId, email }) => {
            emailMap.set(studentId, email);
          });
        }
      } catch (err) {
        console.warn("[getReconciledPayouts] Error fetching emails:", err);
      }
    }

    // Transform data
    const transactions: PayoutTransaction[] = data.map((transaction: any) => {
      const studentId = transaction.student_id || transaction.students?.id;
      const studentEmail = studentId ? emailMap.get(studentId) || null : null;
      
      const quantity = transaction.quantity || 1;
      const amountDue = transaction.amount_due || 0;
      const paymentAmount = quantity * amountDue;

      return {
        id: transaction.id,
        invoice_number: transaction.invoice_number,
        student_email: studentEmail,
        payment_amount: paymentAmount,
        payment_date: transaction.payment_date,
        payout_date: transaction.payout_date,
        payout_id: transaction.payout_id,
      };
    });

    return { transactions, error: null };
  } catch (err) {
    const error = err as PostgrestError;
    return { transactions: [], error: error.message || "Failed to fetch reconciled payouts" };
  }
}

/**
 * Reconcile a transaction
 * Calls the reconcile API endpoint to mark a transaction as reconciled
 */
export async function reconcileTransaction(
  transactionId: string
): Promise<{ success: boolean; error: string | null }> {
  try {
    console.log("[reconcileTransaction] Reconciling transaction:", transactionId);
    
    const basePath = typeof window !== 'undefined' 
      ? (window.location.pathname.startsWith('/app') ? '/app' : '')
      : '';
    
    const response = await fetch(`${basePath}/api/transactions/reconcile`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ transactionId }),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      return { success: false, error: result.error || 'Failed to reconcile transaction' };
    }

    console.log("[reconcileTransaction] Transaction reconciled successfully");
    return { success: true, error: null };
  } catch (err: any) {
    console.error("[reconcileTransaction] Error:", err);
    return { success: false, error: err.message || "Failed to reconcile transaction" };
  }
}

/**
 * Fetch transactions for a specific enrollment
 * Returns transactions ordered by: registration_fee, tuition_a, tuition_b
 */
export async function getTransactionsByEnrollment(
  enrollmentId: string
): Promise<{ transactions: TransactionWithDetails[] | null; error: string | null }> {
  try {
    console.log("[getTransactionsByEnrollment] Starting for enrollmentId:", enrollmentId);
    const supabase = await createSupabaseClient();
    
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
      .eq("enrollment_id", enrollmentId)
      .order("created_at", { ascending: true }); // Order by creation time

    console.log("[getTransactionsByEnrollment] Query result:", { data, error, dataLength: data?.length });

    if (error) {
      console.error("[getTransactionsByEnrollment] Error fetching transactions:", error);
      return { transactions: null, error: error.message };
    }

    if (!data) {
      console.log("[getTransactionsByEnrollment] No data returned");
      return { transactions: [], error: null };
    }

    // Transform transactions
    const transactionsWithDetails: TransactionWithDetails[] = data.map((transaction: any) => {
      const student = transaction.students;
      const classRecord = transaction.classes;

      const studentName = student?.full_name || "Unknown Student";
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
        student_email: null, // Not needed for enrollment detail view
        class_id_display: classIdDisplay,
        payout_id: transaction.payout_id || null,
        payout_date: transaction.payout_date || null,
        reconciled: transaction.reconciled || false,
        reconciliation_date: transaction.reconciliation_date || null,
        payment_date: transaction.payment_date || null,
      };
    });

    // Sort transactions by type: registration_fee, tuition_a, tuition_b
    const typeOrder: Record<string, number> = {
      'registration_fee': 1,
      'tuition_a': 2,
      'tuition_b': 3,
    };

    transactionsWithDetails.sort((a, b) => {
      const aOrder = typeOrder[a.transaction_type || ''] || 999;
      const bOrder = typeOrder[b.transaction_type || ''] || 999;
      return aOrder - bOrder;
    });

    return { transactions: transactionsWithDetails, error: null };
  } catch (err) {
    const error = err as PostgrestError;
    return { transactions: null, error: error.message || "Failed to fetch transactions for enrollment" };
  }
}

