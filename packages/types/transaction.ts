// Transaction type definitions

export type Transaction = {
  id: string; // UUID
  enrollment_id: string; // UUID, references enrollments.id
  student_id: string; // UUID, references students.id
  class_id: string; // UUID, references classes.id
  class_type: 'course' | 'program' | null;
  transaction_type: 'registration_fee' | 'tuition_a' | 'tuition_b' | 'custom' | 'pay_in_full' | null;
  quantity: number | null;
  stripe_payment_intent_id: string | null;
  quickbooks_invoice_link: string | null;
  quickbooks_receipt_link: string | null;
  transaction_status: 'pending' | 'paid' | 'cancelled' | 'refunded' | null;
  payment_date: string | null; // timestamp with time zone
  due_date: string | null; // timestamp with time zone
  amount_due: number | null; // cents
  amount_paid: number | null; // cents
  invoice_number: number | null;
  payout_id: string | null;
  payout_date: string | null; // timestamp with time zone
  reconciled: boolean | null; // default: false
  reconciliation_date: string | null; // timestamp with time zone
  refund_percentage: number | null; // e.g. 50.00 for 50%
  refund_amount: number | null; // cents
  created_at: string | null;
  updated_at: string | null;
};
