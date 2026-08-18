"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Modal } from "@/components/patterns/shared/Modal";
import { Button } from "@/components/patterns/primitives/Button";
import { Text } from "@/components/patterns/primitives/Text";
import { useIsNewAdminMigrate } from "@/components/patterns/client-templates/shared";
import { allClassDetails, catalogKindForClass, catalogTemplateByCode } from "@/components/patterns/client-templates-migrate/catalog/catalogMocks";
import { isClassClosed } from "@/components/patterns/client-templates-migrate/classes/classTableColumns";
import { STUDENT_RECORDS } from "@/components/patterns/client-templates-migrate/students/studentData";
import { endOfLocalDayIso } from "@/data/mocks/transaction-status";
import type { TransactionRow, TransactionType } from "@/data/mocks/transactions";

export type CreateTransactionModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (row: TransactionRow) => void;
};

const TYPE_OPTIONS: { value: TransactionType; label: string }[] = [
  { value: "registration_fee", label: "Registration Fee" },
  { value: "tuition_a", label: "First Invoice" },
  { value: "tuition_b", label: "Second Invoice" },
  { value: "custom", label: "Custom Invoice" },
  { value: "pay_in_full", label: "Pay in Full" },
];

const fieldStyle = {
  boxSizing: "border-box" as const,
  width: "100%",
  height: 32,
  paddingInline: 8,
  borderRadius: 6,
  border: "var(--linear-border-width) solid var(--linear-color-hairline)",
  background: "var(--linear-color-canvas)",
  color: "var(--linear-color-ink)",
  fontSize: 13,
  fontFamily: "inherit",
};

export function CreateTransactionModal({ isOpen, onClose, onCreate }: CreateTransactionModalProps) {
  const live = useIsNewAdminMigrate();
  const classes = useMemo(() => (live ? [] : allClassDetails()), [live]);
  const students = useMemo(() => (live ? [] : STUDENT_RECORDS), [live]);
  const [studentId, setStudentId] = useState("");
  const [classId, setClassId] = useState("");
  const [type, setType] = useState<TransactionType>("custom");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    setStudentId(students[0]?.id ?? "");
    setClassId(classes[0]?.id ?? "");
    setType("custom");
    setAmount("");
    setDueDate("");
  }, [isOpen, classes, students]);

  function submit() {
    const student = students.find((row) => row.id === studentId);
    const classDetail = classes.find((row) => row.id === classId);
    const dollars = Number.parseFloat(amount);
    if (!student || !classDetail) {
      toast.error("Pick a student and class.");
      return;
    }
    if (!Number.isFinite(dollars) || dollars <= 0) {
      toast.error("Enter a valid amount.");
      return;
    }
    if (!dueDate) {
      toast.error("Pick a due date.");
      return;
    }

    const cents = Math.round(dollars * 100);
    const kind = catalogKindForClass(classDetail);
    onCreate({
      id: `txn-new-${Date.now()}`,
      invoiceNumber: null,
      studentId: student.id,
      studentName: student.name,
      studentEmail: student.email,
      classId: classDetail.id,
      classCode: classDetail.classCode,
      className: classDetail.title,
      courseCode: classDetail.courseCode,
      courseName: catalogTemplateByCode(classDetail.courseCode)?.name ?? classDetail.title,
      classType: kind === "Course" ? "course" : "program",
      transactionType: type,
      quantity: 1,
      amountDueCents: cents,
      amountPaidCents: null,
      transactionStatus: "pending",
      dueDate: endOfLocalDayIso(dueDate),
      paymentDate: null,
      createdAt: new Date().toISOString(),
      discountPercent: null,
      originalAmountDueCents: null,
      isActiveClass: !isClassClosed(classDetail),
    });
    toast.success("Invoice created — demo mode, saved locally only");
    onClose();
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="New invoice"
      width={440}
      footer={
        <>
          <Button label="Cancel" variant="secondary" onClick={onClose} />
          <Button label="Create invoice" variant="primary" onClick={submit} />
        </>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <Text size="sm" color="secondary">
            Student
          </Text>
          <select value={studentId} onChange={(event) => setStudentId(event.target.value)} style={fieldStyle}>
            {students.map((row) => (
              <option key={row.id} value={row.id}>
                {row.name}
              </option>
            ))}
          </select>
        </label>
        <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <Text size="sm" color="secondary">
            Class
          </Text>
          <select value={classId} onChange={(event) => setClassId(event.target.value)} style={fieldStyle}>
            {classes.map((row) => (
              <option key={row.id} value={row.id}>
                {row.classCode} — {row.title}
              </option>
            ))}
          </select>
        </label>
        <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <Text size="sm" color="secondary">
            Type
          </Text>
          <select
            value={type}
            onChange={(event) => setType(event.target.value as TransactionType)}
            style={fieldStyle}
          >
            {TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <Text size="sm" color="secondary">
            Amount ($)
          </Text>
          <input
            type="number"
            min={0}
            step={0.01}
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            placeholder="0.00"
            style={fieldStyle}
          />
        </label>
        <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <Text size="sm" color="secondary">
            Due date
          </Text>
          <input type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} style={fieldStyle} />
        </label>
      </div>
    </Modal>
  );
}
