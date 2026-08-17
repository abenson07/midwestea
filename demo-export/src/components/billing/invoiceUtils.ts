/** Open invoice whose due timestamp is strictly before now (UTC-ish). */
export function isOpenPastDue(inv: {
  status: string | null;
  due_date: number | null;
}): boolean {
  if (inv.status !== "open") return false;
  if (inv.due_date === null || inv.due_date === undefined) return false;
  return inv.due_date < Math.floor(Date.now() / 1000);
}

export function formatUsd(amountCents: number): string {
  return `$${(amountCents / 100).toFixed(2)}`;
}

export function formatDueDate(timestamp: number | null): string {
  if (timestamp === null) return "—";
  return new Date(timestamp * 1000).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/** Short month + day (Mercury invoice table prototype). */
export function formatShortMonthDay(timestamp: number | null): string {
  if (timestamp === null) return "—";
  return new Date(timestamp * 1000).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

export type MercuryInvoiceDisplayStatus = "Overdue" | "Active" | "Paid";

export function mercuryInvoiceDisplayStatus(inv: {
  status: string | null;
  due_date: number | null;
}): MercuryInvoiceDisplayStatus {
  if ((inv.status ?? "").toLowerCase() === "paid") return "Paid";
  if (isOpenPastDue(inv)) return "Overdue";
  return "Active";
}

export function mercuryInvoiceStatusColor(
  status: MercuryInvoiceDisplayStatus,
): "warning" | "info" | "success" {
  if (status === "Overdue") return "warning";
  if (status === "Paid") return "success";
  return "info";
}

export function customerLabelFromEmail(email: string | null): string {
  if (!email) return "—";
  const at = email.indexOf("@");
  const local = at > 0 ? email.slice(0, at) : email;
  return (
    local
      .replace(/[._-]+/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase())
      .trim() || email
  );
}
