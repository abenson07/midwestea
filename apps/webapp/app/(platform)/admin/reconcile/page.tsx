"use client";

import { useState, useEffect } from "react";
import { 
    getTransactionsWithPayoutId,
    reconcileTransaction,
    undoReconciliation,
    type TransactionWithDetails,
} from "@/lib/payments";
import { formatCurrency } from "@midwestea/utils";

interface PayoutGroup {
    payout_id: string;
    payout_date: string | null;
    payout_total: number;
    transactions: TransactionWithDetails[];
}

function ReconcilePageContent() {
    const [payoutGroups, setPayoutGroups] = useState<PayoutGroup[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [reconcilingIds, setReconcilingIds] = useState<Set<string>>(new Set());
    const [hoveredId, setHoveredId] = useState<string | null>(null);

    useEffect(() => {
        loadTransactions();
    }, []);

    const loadTransactions = async () => {
        setLoading(true);
        setError("");
        try {
            const { transactions: fetchedTransactions, error: fetchError } = await getTransactionsWithPayoutId();
            if (fetchError) {
                setError(fetchError);
                setPayoutGroups([]);
            } else {
                // Group transactions by payout_id
                const grouped: Record<string, TransactionWithDetails[]> = {};
                
                fetchedTransactions?.forEach((transaction) => {
                    const payoutId = transaction.payout_id;
                    if (!payoutId) return;
                    
                    if (!grouped[payoutId]) {
                        grouped[payoutId] = [];
                    }
                    grouped[payoutId].push(transaction);
                });

                // Convert to PayoutGroup array
                const groups: PayoutGroup[] = Object.entries(grouped).map(([payoutId, transactions]) => {
                    const payoutTotal = transactions.reduce((sum, t) => {
                        const amount = (t.amount_due || 0) * (t.quantity || 1);
                        return sum + amount;
                    }, 0);
                    const payoutDate = transactions[0]?.payout_date || null;
                    
                    return {
                        payout_id: payoutId,
                        payout_date: payoutDate,
                        payout_total: payoutTotal,
                        transactions: transactions.sort((a, b) => {
                            // Sort by created_at descending
                            const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
                            const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
                            return dateB - dateA;
                        }),
                    };
                });

                // Sort groups by payout_date descending
                groups.sort((a, b) => {
                    if (!a.payout_date && !b.payout_date) return 0;
                    if (!a.payout_date) return 1;
                    if (!b.payout_date) return -1;
                    return new Date(b.payout_date).getTime() - new Date(a.payout_date).getTime();
                });

                setPayoutGroups(groups);
            }
        } catch (err: any) {
            setError(err.message || "Failed to load transactions");
            setPayoutGroups([]);
        } finally {
            setLoading(false);
        }
    };

    const handleReconcile = async (transactionId: string) => {
        setReconcilingIds(prev => new Set(prev).add(transactionId));
        try {
            const { success, error: reconcileError } = await reconcileTransaction(transactionId);
            if (reconcileError) {
                setError(reconcileError);
            } else if (success) {
                await loadTransactions();
            }
        } catch (err: any) {
            setError(err.message || "Failed to reconcile transaction");
        } finally {
            setReconcilingIds(prev => {
                const next = new Set(prev);
                next.delete(transactionId);
                return next;
            });
        }
    };

    const handleUndoReconciliation = async (transactionId: string) => {
        setReconcilingIds(prev => new Set(prev).add(transactionId));
        try {
            const { success, error: undoError } = await undoReconciliation(transactionId);
            if (undoError) {
                setError(undoError);
            } else if (success) {
                await loadTransactions();
            }
        } catch (err: any) {
            setError(err.message || "Failed to undo reconciliation");
        } finally {
            setReconcilingIds(prev => {
                const next = new Set(prev);
                next.delete(transactionId);
                return next;
            });
        }
    };

    const formatDate = (dateString: string | null | undefined) => {
        if (!dateString) return "—";
        const date = new Date(dateString);
        return date.toLocaleDateString();
    };

    const formatPayoutDate = (dateString: string | null) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Reconcile</h1>
                    <p className="text-sm text-gray-500 mt-1">Transactions with payout IDs</p>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="flex justify-center py-8">
                    <p className="text-gray-500">Loading transactions...</p>
                </div>
            ) : payoutGroups.length === 0 ? (
                <div className="border border-dashed border-gray-300 rounded-lg p-12 text-center bg-white">
                    <h3 className="mt-2 text-sm font-semibold text-gray-900">No transactions</h3>
                    <p className="mt-1 text-sm text-gray-500">No transactions with payout IDs found.</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {payoutGroups.map((payoutGroup) => (
                        <div key={payoutGroup.payout_id} className="bg-white border border-gray-200 rounded-lg p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                {formatCurrency(payoutGroup.payout_total)} paid out on {formatPayoutDate(payoutGroup.payout_date)}
                            </h3>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Customer Email
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Payment Amount
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Payment Date
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Invoice Number
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Action
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {payoutGroup.transactions.map((transaction) => {
                                            const isReconciled = transaction.reconciled === true;
                                            const isReconciling = reconcilingIds.has(transaction.id);
                                            const isHovered = hoveredId === transaction.id;
                                            const paymentAmount = (transaction.amount_due || 0) * (transaction.quantity || 1);

                                            return (
                                                <tr key={transaction.id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {transaction.student_email || "N/A"}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                        {formatCurrency(paymentAmount)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {formatDate(transaction.payment_date)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {transaction.invoice_number || "N/A"}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                        {isReconciled ? (
                                                            <div
                                                                className="relative"
                                                                onMouseEnter={() => setHoveredId(transaction.id)}
                                                                onMouseLeave={() => setHoveredId(null)}
                                                            >
                                                                {isHovered ? (
                                                                    <button
                                                                        onClick={() => handleUndoReconciliation(transaction.id)}
                                                                        disabled={isReconciling}
                                                                        className="text-blue-600 hover:text-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
                                                                    >
                                                                        {isReconciling ? "Undoing..." : "Undo"}
                                                                    </button>
                                                                ) : (
                                                                    <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 font-medium">
                                                                        Reconciled
                                                                    </span>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <button
                                                                onClick={() => handleReconcile(transaction.id)}
                                                                disabled={isReconciling}
                                                                className={`text-blue-600 hover:text-blue-800 ${
                                                                    isReconciling 
                                                                        ? "opacity-50 cursor-not-allowed" 
                                                                        : ""
                                                                }`}
                                                            >
                                                                {isReconciling ? "Reconciling..." : "Reconcile"}
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default function ReconcilePage() {
    return <ReconcilePageContent />;
}

