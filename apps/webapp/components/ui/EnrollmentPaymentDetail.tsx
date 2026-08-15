"use client";

import { formatCurrency } from "@midwestea/utils";
import type { TransactionWithDetails } from "@/lib/payments";

function formatDate(dateString: string | null | undefined) {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString();
}

function transactionTypeLabel(type: string | null) {
    if (type === 'registration_fee') return 'Registration Fee';
    if (type === 'tuition_a') return 'Tuition A';
    if (type === 'tuition_b') return 'Tuition B';
    if (type === 'custom') return 'Custom Invoice';
    if (type === 'pay_in_full') return 'Pay in Full';
    return type || 'Unknown';
}

// Status here mirrors admin/payments/page.tsx's getInvoiceDisplayStatus() (BEN-1160) —
// 'past_due' (pending + due_date passed) is distinct from plain 'pending', kept in sync
// by hand since this component intentionally has no dependency on that admin-payments-only file.
type CardStatus = 'paid' | 'past_due' | 'pending' | 'cancelled' | 'refunded';

function getCardStatus(transaction: TransactionWithDetails): CardStatus {
    if (transaction.transaction_status === 'paid') return 'paid';
    if (transaction.transaction_status === 'cancelled') return 'cancelled';
    if (transaction.transaction_status === 'refunded') return 'refunded';
    if (transaction.due_date && new Date(transaction.due_date) < new Date()) return 'past_due';
    return 'pending';
}

const STATUS_LABEL: Record<CardStatus, string> = {
    paid: 'Paid', past_due: 'Past due', pending: 'Pending', cancelled: 'Cancelled', refunded: 'Refunded',
};
const STATUS_CLASSES: Record<CardStatus, string> = {
    paid: 'bg-green-100 text-green-800',
    past_due: 'bg-red-100 text-red-800',
    pending: 'bg-yellow-100 text-yellow-800',
    cancelled: 'bg-gray-100 text-gray-800',
    refunded: 'bg-blue-100 text-blue-800',
};

export function EnrollmentPaymentDetail({ transactions }: { transactions: TransactionWithDetails[] }) {
    if (!transactions || transactions.length === 0) {
        return <p className="text-sm text-gray-500">No invoices found for this enrollment.</p>;
    }

    return (
        <div className="space-y-4">
            {transactions.map((transaction) => {
                const status = getCardStatus(transaction);
                const isPaid = status === 'paid';
                const dateLabel = isPaid ? 'Paid Date' : 'Due Date';
                const dateValue = isPaid ? transaction.payment_date : transaction.due_date;

                return (
                    <div key={transaction.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                            <h4 className="text-sm font-medium text-gray-900">{transactionTypeLabel(transaction.transaction_type)}</h4>
                            <span className={`px-2 py-1 text-xs rounded-full ${STATUS_CLASSES[status]}`}>
                                {STATUS_LABEL[status]}
                            </span>
                        </div>
                        <div className="space-y-2">
                            <div>
                                <label className="block text-xs font-medium text-gray-500">Amount Due</label>
                                <p className="mt-1 text-sm text-gray-900">
                                    {transaction.amount_due
                                        ? formatCurrency(transaction.amount_due * (transaction.quantity || 1))
                                        : "—"}
                                </p>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500">{dateLabel}</label>
                                <p className="mt-1 text-sm text-gray-900">{formatDate(dateValue)}</p>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
