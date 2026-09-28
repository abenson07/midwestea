"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { sampleTransactions, type TransactionRow } from "@/data/mocks/transactions";

type TransactionStore = {
  transactions: TransactionRow[];
  updateTransaction: (id: string, patch: Partial<TransactionRow>) => void;
  addTransaction: (row: TransactionRow) => void;
};

const TransactionRowsContext = createContext<TransactionStore | null>(null);

let rows: TransactionRow[] = sampleTransactions.map((row) => ({ ...row }));
const listeners = new Set<() => void>();

function notify() {
  for (const listener of listeners) listener();
}

function useSingletonTransactions(): TransactionStore {
  const [, bump] = useState(0);

  useEffect(() => {
    const listener = () => bump((value) => value + 1);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  return {
    transactions: rows,
    updateTransaction(id, patch) {
      rows = rows.map((row) => (row.id === id ? { ...row, ...patch } : row));
      notify();
    },
    addTransaction(row) {
      rows = [row, ...rows];
      notify();
    },
  };
}

export function TransactionRowsProvider({
  rows: seed,
  children,
}: {
  rows: TransactionRow[];
  children: ReactNode;
}) {
  const [local, setLocal] = useState(seed);

  useEffect(() => {
    setLocal(seed);
  }, [seed]);

  const value = useMemo<TransactionStore>(
    () => ({
      transactions: local,
      updateTransaction(id, patch) {
        setLocal((prev) => prev.map((row) => (row.id === id ? { ...row, ...patch } : row)));
      },
      addTransaction(row) {
        setLocal((prev) => [row, ...prev]);
      },
    }),
    [local],
  );

  return <TransactionRowsContext.Provider value={value}>{children}</TransactionRowsContext.Provider>;
}

export function useTransactions(): TransactionStore {
  const override = useContext(TransactionRowsContext);
  const fallback = useSingletonTransactions();
  return override ?? fallback;
}
