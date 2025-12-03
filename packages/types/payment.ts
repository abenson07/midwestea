// Payment type definitions

export type Payment = {
  id: string; // UUID
  enrollment_id: string; // UUID, references enrollments.id
  amount_cents: number; // integer
  stripe_payment_intent_id: string | null;
  stripe_receipt_url: string | null;
  payment_status: string | null; // default: 'paid'
  paid_at: string | null; // timestamp with time zone
  created_at: string | null; // timestamp with time zone
};


