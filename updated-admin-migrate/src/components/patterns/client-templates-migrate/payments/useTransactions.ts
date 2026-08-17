"use client";

import { useEffect, useState } from "react";
import { sampleTransactions, type TransactionRow } from "@/data/mocks/transactions";

let rows: TransactionRow[] = sampleTransactions.map((row) => ({ ...row }));
const listeners = new Set<() => void>();

function notify() {
  for (const listener of listeners) listener();
}

export function useTransactions() {
  const [, bump] = useState(0);

  useEffect(() => {
    const listener = () => bump((value) => value + 1);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  function updateTransaction(id: string, patch: Partial<TransactionRow>) {
    rows = rows.map((row) => (row.id === id ? { ...row, ...patch } : row));
    notify();
  }

  function addTransaction(row: TransactionRow) {
    rows = [row, ...rows];
    notify();
  }

  return { transactions: rows, updateTransaction, addTransaction };
}
