"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createSupabaseClient } from "@midwestea/utils";
import { Modal } from "@/components/admin-migrate/patterns/shared/Modal";
import { Button } from "@/components/admin-migrate/patterns/primitives/Button";
import { Text } from "@/components/admin-migrate/patterns/primitives/Text";
import { useIsNewAdminMigrate } from "@/components/admin-migrate/patterns/client-templates/shared";
import { allClassDetails, catalogKindForClass, catalogTemplateByCode } from "@/components/admin-migrate/patterns/catalog/catalogMocks";
import { isClassClosed } from "@/components/admin-migrate/patterns/classes/classTableColumns";
import { STUDENT_RECORDS } from "@/components/admin-migrate/patterns/students/studentData";
import { endOfLocalDayIso } from "@/data/mocks/transaction-status";
import type { TransactionRow, TransactionType } from "@/data/mocks/transactions";

/** A real (student, class) pair the admin may invoice -- one non-removed enrollment. */
export type InvoiceTarget = {
  studentId: string;
  studentName: string;
  classId: string;
  classCode: string;
  className: string;
};

export type CreateTransactionModalProps = {
  isOpen: boolean;
  onClose: () => void;
  /** Demo (`/admin-preview`) path only: the live path saves via the API and refreshes. */
  onCreate: (row: TransactionRow) => void;
  /** Live path: real enrolled student/class pairs. Empty/omitted disables creating. */
  targets?: InvoiceTarget[];
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

export function CreateTransactionModal({ isOpen, onClose, onCreate, targets }: CreateTransactionModalProps) {
  const live = useIsNewAdminMigrate();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const demoClasses = useMemo(() => (live ? [] : allClassDetails()), [live]);
  const demoStudents = useMemo(() => (live ? [] : STUDENT_RECORDS), [live]);
  const liveTargets = useMemo(() => (live ? (targets ?? []) : []), [live, targets]);
  const students = useMemo(() => {
    if (!live) return demoStudents.map((row) => ({ id: row.id, name: row.name }));
    const seen = new Map<string, string>();
    for (const target of liveTargets) if (!seen.has(target.studentId)) seen.set(target.studentId, target.studentName);
    return [...seen].map(([id, name]) => ({ id, name })).sort((a, b) => a.name.localeCompare(b.name));
  }, [live, demoStudents, liveTargets]);
  const [studentId, setStudentId] = useState("");
  const [classId, setClassId] = useState("");
  const [type, setType] = useState<TransactionType>("custom");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");

  // Live: only the classes this student is actually enrolled in. Demo: every class.
  const classOptions = useMemo(() => {
    if (!live) return demoClasses.map((row) => ({ id: row.id, label: `${row.classCode} — ${row.title}` }));
    return liveTargets
      .filter((target) => target.studentId === studentId)
      .map((target) => ({ id: target.classId, label: `${target.classCode} — ${target.className}` }));
  }, [live, demoClasses, liveTargets, studentId]);

  useEffect(() => {
    if (!isOpen) return;
    setStudentId(students[0]?.id ?? "");
    setType("custom");
    setAmount("");
    setDueDate("");
    setSubmitting(false);
  }, [isOpen, students]);

  useEffect(() => {
    if (!isOpen) return;
    setClassId((current) => (classOptions.some((row) => row.id === current) ? current : classOptions[0]?.id ?? ""));
  }, [isOpen, classOptions]);

  async function submitLive() {
    if (submitting) return;
    if (!studentId || !classId) {
      toast.error("Pick a student and class.");
      return;
    }
    const dollars = Number.parseFloat(amount);
    if (!Number.isFinite(dollars) || dollars <= 0) {
      toast.error("Enter a valid amount.");
      return;
    }
    if (!dueDate) {
      toast.error("Pick a due date.");
      return;
    }
    const amountDueCents = Math.round(dollars * 100);
    setSubmitting(true);
    try {
      const supabase = await createSupabaseClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.access_token) {
        toast.error("Not authenticated. Please sign in again.");
        return;
      }
      const response = await fetch("/api/admin/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({
          studentId,
          classId,
          transactionType: type,
          amountDueCents,
          quantity: 1,
          dueDate: endOfLocalDayIso(dueDate),
        }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || result?.success === false) {
        toast.error(result?.error || "Failed to create invoice.");
        return;
      }
      toast.success("Invoice created");
      router.refresh();
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create invoice.");
    } finally {
      setSubmitting(false);
    }
  }

  function submit() {
    if (live) {
      void submitLive();
      return;
    }
    const student = demoStudents.find((row) => row.id === studentId);
    const classDetail = demoClasses.find((row) => row.id === classId);
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
          <Button label="Cancel" variant="secondary" onClick={onClose} disabled={submitting} />
          <Button
            label={submitting ? "Creating…" : "Create invoice"}
            variant="primary"
            onClick={submit}
            disabled={submitting || (live && liveTargets.length === 0)}
          />
        </>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {live && liveTargets.length === 0 ? (
          <Text size="sm" color="secondary">
            Create invoices from the Transactions page, where enrolled students are available.
          </Text>
        ) : null}
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
            {classOptions.map((row) => (
              <option key={row.id} value={row.id}>
                {row.label}
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
