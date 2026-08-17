import {
  sampleTransactions,
  type TransactionRow,
  type TransactionType,
} from "@/data/mocks/transactions";

const TUITION_TYPES: ReadonlySet<TransactionType> = new Set([
  "tuition_a",
  "tuition_b",
  "pay_in_full",
  "custom",
]);

export type RevenueScope = "open" | "this_year" | "all";

export type ClassRevenueRow = {
  classId: string;
  className: string;
  classCode: string;
  courseName: string;
  courseCode: string;
  isActiveClass: boolean;
  registrationIncome: number;
  tuitionIncome: number;
  totalExpected: number;
  totalReceived: number;
};

function dueCents(row: TransactionRow): number {
  return Math.round(row.amountDueCents * row.quantity);
}

function paidCents(row: TransactionRow): number {
  if (row.transactionStatus !== "paid") return 0;
  if (row.amountPaidCents == null) return dueCents(row);
  return Math.round(row.amountPaidCents * row.quantity);
}

function isOnBooks(row: TransactionRow): boolean {
  return row.transactionStatus === "pending" || row.transactionStatus === "paid";
}

function inCalendarYear(row: TransactionRow, year: number): boolean {
  return [row.createdAt, row.dueDate, row.paymentDate].some(
    (value) => value != null && new Date(value).getFullYear() === year,
  );
}

export function formatRevenueUsd(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

export function matchesRevenueSearch(row: ClassRevenueRow, search: string): boolean {
  if (!search) return true;
  const q = search.toLowerCase();
  return (
    row.className.toLowerCase().includes(q) ||
    row.classCode.toLowerCase().includes(q) ||
    row.courseName.toLowerCase().includes(q)
  );
}

/** Unique course names present in the rolled-up rows, for the type filter. */
export function revenueCourseTypeOptions(rows: ClassRevenueRow[]): { value: string; label: string }[] {
  const seen = new Map<string, string>();
  for (const row of rows) {
    if (!seen.has(row.courseCode)) seen.set(row.courseCode, row.courseName);
  }
  return Array.from(seen.entries())
    .map(([value, label]) => ({ value, label }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

/** One row per class, rolled up from tuition/registration transactions. */
export function classRevenueFromTransactions(
  transactions: TransactionRow[] = sampleTransactions,
  scope: RevenueScope = "all",
): ClassRevenueRow[] {
  const year = new Date().getFullYear();
  const byClass = new Map<
    string,
    {
      className: string;
      classCode: string;
      courseName: string;
      courseCode: string;
      isActiveClass: boolean;
      registrationIncome: number;
      tuitionIncome: number;
      totalReceived: number;
    }
  >();

  for (const row of transactions) {
    if (scope === "open" && !row.isActiveClass) continue;
    if (scope === "this_year" && !inCalendarYear(row, year)) continue;

    const current = byClass.get(row.classId) ?? {
      className: row.className,
      classCode: row.classCode,
      courseName: row.courseName,
      courseCode: row.courseCode,
      isActiveClass: row.isActiveClass,
      registrationIncome: 0,
      tuitionIncome: 0,
      totalReceived: 0,
    };
    if (isOnBooks(row)) {
      const due = dueCents(row);
      if (row.transactionType === "registration_fee") current.registrationIncome += due;
      else if (row.transactionType && TUITION_TYPES.has(row.transactionType)) {
        current.tuitionIncome += due;
      }
    }
    current.totalReceived += paidCents(row);
    byClass.set(row.classId, current);
  }

  const nameCounts = new Map<string, number>();
  for (const row of byClass.values()) {
    nameCounts.set(row.className, (nameCounts.get(row.className) ?? 0) + 1);
  }

  return Array.from(byClass.entries())
    .map(([classId, row]) => ({
      classId,
      className:
        (nameCounts.get(row.className) ?? 0) > 1
          ? `${row.className} (${row.classCode})`
          : row.className,
      classCode: row.classCode,
      courseName: row.courseName,
      courseCode: row.courseCode,
      isActiveClass: row.isActiveClass,
      registrationIncome: row.registrationIncome,
      tuitionIncome: row.tuitionIncome,
      totalExpected: row.registrationIncome + row.tuitionIncome,
      totalReceived: row.totalReceived,
    }))
    .sort((a, b) => a.className.localeCompare(b.className));
}
