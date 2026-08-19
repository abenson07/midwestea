"use client";

import { Bell, ClipboardCheck, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAdminBasePath, useIsNewAdminMigrate } from "@/components/admin-migrate/patterns/client-templates/shared";
import { Text } from "@/components/admin-migrate/patterns/primitives/Text";
import { Button } from "@/components/admin-migrate/patterns/primitives/Button";
import { IconButton } from "@/components/admin-migrate/patterns/shared/IconButton";
import { ClassSidebarSection } from "./ClassSidebarSection";
import {
  classInvoicesForStudent,
  enrollmentInvoiceSummary,
  paidInvoiceTotal,
  studentPrerequisiteRows,
  type ClassRosterRow,
  type EnrollmentInvoiceSummary,
  type StudentPrerequisiteRow,
  type StudentToRemove,
} from "./classMocks";
import { PREREQUISITE_STATUS_COLOR, PREREQUISITE_STATUS_LABEL } from "./prerequisiteStatus";
import type { TransactionRow } from "@/data/mocks/transactions";
import { useTransactions } from "../payments/useTransactions";
import { TransactionAmountCell } from "../payments/TransactionAmountCell";
import { TransactionStatusToken } from "../payments/TransactionStatusToken";
import {
  formatCentsAsUSD,
  formatShortDate,
  getTransactionAmountCents,
  getTransactionDaysPastDue,
  getTransactionListStatus,
  getTransactionTypeLabel,
} from "@/data/mocks/transaction-status";

export type ClassStudentPaymentsCardProps = {
  classId: string;
  className: string;
  student: ClassRosterRow;
  requiredPrerequisites?: string[];
  onClose: () => void;
  onRemove: (student: StudentToRemove) => void;
  onReviewPrerequisite?: (submissionId: string) => void;
};

const SUMMARY_COLOR: Record<EnrollmentInvoiceSummary, string> = {
  "No invoices": "var(--linear-color-ink-subtle)",
  Pending: "#f2c94c",
  "Partially paid": "#f2c94c",
  "All paid": "#27a644",
  "Past due": "#eb5757",
};

function invoiceMeta(invoice: TransactionRow): string {
  const status = getTransactionListStatus(invoice);
  const days = getTransactionDaysPastDue(invoice);
  if (status === "paid" && invoice.paymentDate) return `Paid ${formatShortDate(invoice.paymentDate)}`;
  if (status === "past_due") return `${days}d past due · Due ${formatShortDate(invoice.dueDate)}`;
  return `Due ${formatShortDate(invoice.dueDate)}`;
}

/** Past-due first; if none, the soonest unpaid invoice is “current.” Everything else is secondary. */
function splitStudentInvoices(invoices: TransactionRow[]): {
  featured: TransactionRow[];
  supplemental: TransactionRow[];
} {
  if (!invoices.length) return { featured: [], supplemental: [] };

  const pastDue = invoices
    .filter((invoice) => getTransactionListStatus(invoice) === "past_due")
    .sort((a, b) => getTransactionDaysPastDue(b) - getTransactionDaysPastDue(a));
  if (pastDue.length) {
    const featuredIds = new Set(pastDue.map((invoice) => invoice.id));
    return {
      featured: pastDue,
      supplemental: invoices.filter((invoice) => !featuredIds.has(invoice.id)),
    };
  }

  const pending = invoices
    .filter((invoice) => getTransactionListStatus(invoice) === "pending")
    .sort((a, b) => (a.dueDate ?? "").localeCompare(b.dueDate ?? ""));
  if (pending.length) {
    const current = pending[0];
    return {
      featured: [current],
      supplemental: invoices.filter((invoice) => invoice.id !== current.id),
    };
  }

  return { featured: [], supplemental: invoices };
}

function FeaturedInvoice({ invoice }: { invoice: TransactionRow }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 4,
        padding: "10px 0",
        borderBottom: "var(--linear-border-width) solid var(--linear-color-hairline)",
      }}
    >
      <Text size="sm" color="secondary">
        {invoice.invoiceNumber ?? "—"} · {getTransactionTypeLabel(invoice.transactionType)}
      </Text>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <span style={{ fontSize: 15, fontWeight: 600, lineHeight: "20px" }}>
          <TransactionAmountCell row={invoice} />
        </span>
        <TransactionStatusToken row={invoice} />
      </div>
      <Text size="sm" color="secondary">
        {invoiceMeta(invoice)}
      </Text>
    </div>
  );
}

function SupplementalInvoice({ invoice }: { invoice: TransactionRow }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "baseline",
        justifyContent: "space-between",
        gap: 8,
        paddingBlock: 6,
      }}
    >
      <div style={{ minWidth: 0 }}>
        <Text
          size="sm"
          color="secondary"
          style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
        >
          {getTransactionTypeLabel(invoice.transactionType)}
        </Text>
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexShrink: 0 }}>
        <Text size="sm" color="secondary">
          {formatCentsAsUSD(getTransactionAmountCents(invoice))}
        </Text>
        <TransactionStatusToken row={invoice} />
      </div>
    </div>
  );
}

function PrerequisiteRow({
  row,
  studentName,
  onReview,
}: {
  row: StudentPrerequisiteRow;
  studentName: string;
  onReview?: (submissionId: string) => void;
}) {
  function remind() {
    toast.success(`Reminder sent to ${studentName} — demo mode, not delivered`);
  }

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 8,
        minHeight: 32,
      }}
    >
      <Text size="sm" style={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis" }}>
        {row.type}
      </Text>
      {row.status === "approved" ? (
        <span style={{ color: PREREQUISITE_STATUS_COLOR.approved, fontSize: 12, fontWeight: 500 }}>
          {PREREQUISITE_STATUS_LABEL.approved}
        </span>
      ) : row.status === "expired" || row.status === "needs_resubmission" ? (
        <span style={{ color: PREREQUISITE_STATUS_COLOR[row.status], fontSize: 12, fontWeight: 500 }}>
          {PREREQUISITE_STATUS_LABEL[row.status]}
        </span>
      ) : row.status === "optional" ? (
        <span style={{ color: PREREQUISITE_STATUS_COLOR.optional, fontSize: 12, fontWeight: 500 }}>
          {PREREQUISITE_STATUS_LABEL.optional}
        </span>
      ) : row.status === "pending_review" && row.submissionId ? (
        <Button
          label="Review"
          variant="secondary"
          size="sm"
          icon={<ClipboardCheck size={13} strokeWidth={1.75} />}
          onClick={() => onReview?.(row.submissionId!)}
        />
      ) : (
        <Button
          label="Remind"
          variant="secondary"
          size="sm"
          icon={<Bell size={13} strokeWidth={1.75} />}
          onClick={remind}
        />
      )}
    </div>
  );
}

function SectionLabel({ children }: { children: string }) {
  return (
    <Text type="label" color="secondary" display="block" style={{ paddingTop: 4 }}>
      {children}
    </Text>
  );
}

/** Right-rail card: this student's invoices and prerequisites, then profile / remove. */
export function ClassStudentPaymentsCard({
  classId,
  className,
  student,
  requiredPrerequisites,
  onClose,
  onRemove,
  onReviewPrerequisite,
}: ClassStudentPaymentsCardProps) {
  const router = useRouter();
  const basePath = useAdminBasePath();
  const live = useIsNewAdminMigrate();
  const { transactions } = useTransactions();
  const invoices = classInvoicesForStudent(classId, student.name, transactions);
  const summary = enrollmentInvoiceSummary(invoices);
  const { featured, supplemental } = splitStudentInvoices(invoices);
  const prerequisites = studentPrerequisiteRows(classId, student.id, requiredPrerequisites);

  return (
    <ClassSidebarSection
      title={student.name}
      action={
        <IconButton
          label="Close student"
          variant="ghost"
          size="sm"
          icon={<X size={14} strokeWidth={1.75} />}
          onClick={onClose}
        />
      }
    >
      <div>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            height: 22,
            paddingInline: 8,
            borderRadius: 999,
            background: `${SUMMARY_COLOR[summary]}1A`,
            color: SUMMARY_COLOR[summary],
            fontSize: 12,
            fontWeight: 500,
          }}
        >
          {summary}
        </span>
      </div>

      <SectionLabel>Invoices</SectionLabel>
      {invoices.length ? (
        <div>
          {featured.map((invoice) => (
            <FeaturedInvoice key={invoice.id} invoice={invoice} />
          ))}
          {supplemental.length ? (
            <div style={{ paddingTop: featured.length ? 4 : 0 }}>
              {supplemental.map((invoice) => (
                <SupplementalInvoice key={invoice.id} invoice={invoice} />
              ))}
            </div>
          ) : null}
        </div>
      ) : (
        <Text size="sm" color="secondary">
          No invoices yet.
        </Text>
      )}

      {prerequisites.length ? (
        <>
          <SectionLabel>Prerequisites</SectionLabel>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {prerequisites.map((row) => (
              <PrerequisiteRow
                key={row.type}
                row={row}
                studentName={student.name}
                onReview={onReviewPrerequisite}
              />
            ))}
          </div>
        </>
      ) : null}

      <div style={{ display: "flex", flexDirection: "column", gap: 8, paddingTop: 8 }}>
        <Button
          label="View Profile"
          variant="secondary"
          width="100%"
          onClick={() => {
            if (live) {
              router.push(`${basePath}/students/${student.id}`);
              return;
            }
            toast.message(`Student profile for ${student.name} isn’t wired yet — demo mode`);
          }}
        />
        <Button
          label="Remove student"
          variant="ghost"
          width="100%"
          onClick={() =>
            onRemove({
              id: student.id,
              name: student.name,
              email: student.email,
              classId,
              className,
              reason: "Invoice not paid",
              paidAmount: paidInvoiceTotal(invoices),
            })
          }
        />
      </div>
    </ClassSidebarSection>
  );
}
