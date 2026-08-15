"use client";

import { createSupabaseClient } from "@midwestea/utils";
import type { PostgrestError } from "@supabase/supabase-js";
import type { Transaction } from "@midwestea/types";

export interface StudentInvoice extends Transaction {
  class_name: string | null;
  course_code: string | null;
}

export async function getMyProgramInvoices(): Promise<{ invoices: StudentInvoice[] | null; error: string | null }> {
  try {
    const supabase = await createSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return { invoices: null, error: "Not authenticated" };
    }

    const { data, error } = await supabase
      .from("transactions")
      .select(`*, enrollments (id, class_id, classes (class_name, course_code))`)
      .eq("student_id", session.user.id)
      .order("due_date", { ascending: true });

    if (error) {
      return { invoices: null, error: error.message };
    }
    if (!data) {
      return { invoices: [], error: null };
    }

    const invoices: StudentInvoice[] = data.map((row: any) => {
      const classInfo = row.enrollments?.classes;
      const { enrollments, ...txFields } = row;
      return {
        ...txFields,
        class_name: classInfo?.class_name ?? null,
        course_code: classInfo?.course_code ?? null,
      };
    });

    return { invoices, error: null };
  } catch (err) {
    const error = err as PostgrestError;
    return { invoices: null, error: error.message || "Failed to fetch invoices" };
  }
}

export type InvoiceDisplayStatus = 'paid' | 'past_due' | 'pending' | 'cancelled' | 'refunded';

export function getInvoiceDisplayStatus(
  invoice: Pick<Transaction, 'transaction_status' | 'due_date'>
): InvoiceDisplayStatus {
  if (invoice.transaction_status === 'paid') return 'paid';
  if (invoice.transaction_status === 'cancelled') return 'cancelled';
  if (invoice.transaction_status === 'refunded') return 'refunded';
  if (invoice.due_date && new Date(invoice.due_date) < new Date()) return 'past_due';
  return 'pending';
}

export async function payInvoice(transactionId: string): Promise<{ checkoutUrl: string | null; error: string | null }> {
  try {
    const supabase = await createSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    if (!token) {
      return { checkoutUrl: null, error: "Not authenticated" };
    }
    const response = await fetch(`/api/student/transactions/${transactionId}/pay`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    const result = await response.json();
    if (!response.ok || !result.success) {
      return { checkoutUrl: null, error: result.error || "Failed to start payment" };
    }
    return { checkoutUrl: result.checkoutUrl, error: null };
  } catch (err: any) {
    return { checkoutUrl: null, error: err.message || "Failed to start payment" };
  }
}

export async function payAllRemaining(enrollmentId: string): Promise<{ checkoutUrl: string | null; error: string | null }> {
  try {
    const supabase = await createSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    if (!token) {
      return { checkoutUrl: null, error: "Not authenticated" };
    }
    const response = await fetch(`/api/student/enrollments/${enrollmentId}/pay-remaining`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    const result = await response.json();
    if (!response.ok || !result.success) {
      return { checkoutUrl: null, error: result.error || "Failed to start payment" };
    }
    return { checkoutUrl: result.checkoutUrl, error: null };
  } catch (err: any) {
    return { checkoutUrl: null, error: err.message || "Failed to start payment" };
  }
}

export function groupInvoicesByClass(
  invoices: StudentInvoice[]
): { enrollmentId: string; className: string; invoices: StudentInvoice[] }[] {
  const groups: { enrollmentId: string; className: string; invoices: StudentInvoice[] }[] = [];
  const indexByEnrollment = new Map<string, number>();

  for (const invoice of invoices) {
    const enrollmentId = invoice.enrollment_id || "unknown";
    const className = invoice.class_name || "Unknown Class";
    let index = indexByEnrollment.get(enrollmentId);
    if (index === undefined) {
      index = groups.length;
      indexByEnrollment.set(enrollmentId, index);
      groups.push({ enrollmentId, className, invoices: [] });
    }
    groups[index].invoices.push(invoice);
  }

  return groups;
}
