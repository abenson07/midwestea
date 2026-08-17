"use client";

import { X } from "lucide-react";
import { toast } from "sonner";
import { Text } from "@/components/patterns/primitives/Text";
import { Button } from "@/components/patterns/primitives/Button";
import { IconButton } from "@/components/patterns/shared/IconButton";
import { InvoiceStatusToken } from "@/components/patterns/client-templates/shared";
import { ClassSidebarSection } from "./ClassSidebarSection";
import type { ClassPaymentLine, ClassRosterRow, ClassStudentPayment } from "./classMocks";

export type ClassStudentPaymentsCardProps = {
  student: ClassRosterRow;
  payment: ClassStudentPayment;
  onClose: () => void;
};

function toInvoiceRow(label: string, studentName: string, line: ClassPaymentLine) {
  return {
    id: label,
    studentName,
    invoiceLabel: label,
    amount: line.amount,
    status: line.status,
    dueDate: line.dueDate,
    paidDate: line.paidDate,
    daysPastDue: line.daysPastDue,
  };
}

function PaymentLine({
  label,
  line,
  studentName,
  showDueDate,
}: {
  label: string;
  line: ClassPaymentLine;
  studentName: string;
  showDueDate?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 4,
        paddingBlock: 8,
        borderBottom: "var(--linear-border-width) solid var(--linear-color-hairline)",
      }}
    >
      <Text size="sm" color="secondary">
        {label}
        {showDueDate ? (
          <span style={{ color: "var(--linear-color-ink-tertiary)" }}> · Due {line.dueDate}</span>
        ) : null}
      </Text>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <Text size="sm">{line.amount}</Text>
        <InvoiceStatusToken invoice={toInvoiceRow(label, studentName, line)} />
      </div>
    </div>
  );
}

/** Right-rail card: this student's registration + Invoice A/B (tuition halves). */
export function ClassStudentPaymentsCard({
  student,
  payment,
  onClose,
}: ClassStudentPaymentsCardProps) {
  return (
    <ClassSidebarSection
      title={student.name}
      action={
        <IconButton
          label="Close student payments"
          variant="ghost"
          size="sm"
          icon={<X size={14} strokeWidth={1.75} />}
          onClick={onClose}
        />
      }
    >
      <PaymentLine label="Registration fee" line={payment.registration} studentName={student.name} />
      <PaymentLine
        label="Invoice A"
        line={payment.invoiceA}
        studentName={student.name}
        showDueDate
      />
      <PaymentLine
        label="Invoice B"
        line={payment.invoiceB}
        studentName={student.name}
        showDueDate
      />
      <div style={{ paddingTop: 12 }}>
        <Button
          label="View student profile"
          variant="secondary"
          width="100%"
          onClick={() =>
            toast.message(`Student profile for ${student.name} isn’t wired yet — demo mode`)
          }
        />
      </div>
    </ClassSidebarSection>
  );
}
