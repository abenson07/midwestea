export type TransactionType =
  | "registration_fee"
  | "tuition_a"
  | "tuition_b"
  | "custom"
  | "pay_in_full";

export type TransactionStatus = "pending" | "paid" | "cancelled" | "refunded";

export type TransactionRow = {
  id: string;
  invoiceNumber: string | null;
  studentId: string;
  studentName: string;
  studentEmail: string | null;
  classId: string;
  classCode: string;
  className: string;
  courseCode: string;
  courseName: string;
  classType: "course" | "program";
  /** Null for cash/global payments with no invoice type — UI shows N/A. */
  transactionType: TransactionType | null;
  quantity: number;
  /** Cents, pre-quantity — mirrors the `transactions.amount_due` DB column. */
  amountDueCents: number;
  amountPaidCents: number | null;
  transactionStatus: TransactionStatus;
  dueDate: string | null;
  paymentDate: string | null;
  createdAt: string;
  discountPercent: number | null;
  originalAmountDueCents: number | null;
  /** Class status is "enrolling"/"active" (open for enrollment or in progress). */
  isActiveClass: boolean;
  /** Stripe hosted invoice URL when one was issued. Demo fixtures are null. */
  stripeHostedInvoiceUrl?: string | null;
};

/**
 * Empty on purpose — this held ~80 fake transaction rows in the source app,
 * used as a demo-mode fallback (PaymentsDemo only reads real `rows` in the
 * live app; this array was never meant to render there). Dropped rather
 * than carried over so nothing here can ever accidentally display as real
 * data. download-invoices.ts derives from this array, so zeroing it here
 * empties that too. (payouts.ts was removed — Reconcile now reads real
 * transactions via lib/payments.ts instead.)
 */
export const sampleTransactions: TransactionRow[] = [];
