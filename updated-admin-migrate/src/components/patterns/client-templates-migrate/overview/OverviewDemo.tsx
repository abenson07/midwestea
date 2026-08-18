"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Bell, ClipboardCheck, LayoutDashboard, Mail, Plus } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { FoundationLayout } from "@/components/patterns/foundation/FoundationLayout";
import { CanvasHeader } from "@/components/patterns/foundation/CanvasHeader";
import { LinearSidebar } from "@/components/patterns/foundation/LinearSidebar";
import { ClassContentPage, RowClickCell, useAdminBasePath, useIsNewAdminMigrate } from "@/components/patterns/client-templates/shared";
import { GroupedTable } from "@/components/patterns/grouped-table/GroupedTable";
import { Text } from "@/components/patterns/primitives/Text";
import { Avatar } from "@/components/patterns/primitives/Avatar";
import { Button } from "@/components/patterns/primitives/Button";
import { cardSurfaceStyle } from "@/components/patterns/primitives/Card";
import { IconButton } from "@/components/patterns/shared/IconButton";
import { Modal } from "@/components/patterns/shared/Modal";
import { pixel, proportional, type TableColumn } from "@/components/patterns/primitives/table";
import {
  allClassDueInvoices,
  allFollowUpQueue,
  allPrerequisiteQueue,
  STUDENTS_TO_REMOVE,
  type ClassFollowUpRow,
  type ClassPrerequisiteQueueRow,
  type StudentToRemove,
} from "@/components/patterns/client-templates-migrate/classes/classMocks";
import { buildClassPastDueInvoiceColumns } from "@/components/patterns/client-templates-migrate/classes/ClassInvoicesPage";
import { ClassPrerequisitesQueue } from "@/components/patterns/client-templates-migrate/classes/ClassPrerequisitesQueue";
import { CreateClassModal } from "@/components/patterns/client-templates-migrate/catalog/CreateClassModal";
import { classDetailHref } from "@/components/patterns/client-templates-migrate/catalog/catalogMocks";
import { RemoveStudentModal } from "@/components/patterns/client-templates-migrate/classes/RemoveStudentModal";

function missingDocumentsLabel(types: string[]): string {
  if (types.length === 1) return types[0];
  return `${types.length} documents needed`;
}

function daysUntilLabel(days: number | null): string {
  if (days == null) return "—";
  if (days < 0) return "Started";
  if (days === 0) return "Today";
  return String(days);
}

function OverviewCard({
  title,
  emptyLabel,
  isEmpty,
  children,
}: {
  title: string;
  emptyLabel: string;
  isEmpty: boolean;
  children: ReactNode;
}) {
  return (
    <section
      style={{
        ...cardSurfaceStyle,
        boxSizing: "border-box",
        padding: 20,
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      <Text weight="semibold">{title}</Text>
      {isEmpty ? (
        <Text size="sm" color="secondary">
          {emptyLabel}
        </Text>
      ) : (
        children
      )}
    </section>
  );
}

function MessageStudentModal({
  student,
  onClose,
}: {
  student: StudentToRemove | null;
  onClose: () => void;
}) {
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (student) setMessage("");
  }, [student]);

  function handleSend() {
    const body = message.trim();
    if (!body) {
      toast.error("Write a message before sending");
      return;
    }
    toast.success(`Message sent to ${student?.name} — demo mode, not delivered`);
    onClose();
  }

  return (
    <Modal
      isOpen={student != null}
      onClose={onClose}
      title={student ? `Message ${student.name}` : "Message student"}
      width={480}
      footer={
        <>
          <Button label="Cancel" variant="secondary" onClick={onClose} />
          <Button label="Send" variant="primary" onClick={handleSend} />
        </>
      }
    >
      <textarea
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        placeholder={student ? `Write a message to ${student.name}…` : "Write a message…"}
        rows={6}
        autoFocus
        style={{
          boxSizing: "border-box",
          width: "100%",
          minHeight: 140,
          resize: "vertical",
          padding: 12,
          borderRadius: "var(--linear-radius-md)",
          border: "var(--linear-border-width) solid var(--linear-color-hairline)",
          background: "var(--linear-color-canvas)",
          color: "var(--linear-color-ink)",
          fontSize: 13,
          fontFamily: "inherit",
          lineHeight: 1.45,
        }}
      />
    </Modal>
  );
}

function RemindFollowUpModal({
  row,
  onClose,
}: {
  row: ClassFollowUpRow | null;
  onClose: () => void;
}) {
  function handleSend() {
    if (!row) return;
    toast.success(`Reminder sent to ${row.student} — demo mode, not delivered`);
    onClose();
  }

  return (
    <Modal
      isOpen={row != null}
      onClose={onClose}
      title={row ? `Remind ${row.student}` : "Remind student"}
      width={440}
      footer={
        <>
          <Button label="Cancel" variant="secondary" onClick={onClose} />
          <Button label="Send reminder" variant="primary" onClick={handleSend} />
        </>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <Text size="sm" color="secondary">
          Send {row?.student} a reminder that these prerequisites are still missing for{" "}
          {row?.className}?
        </Text>
        {row ? (
          <ul
            style={{
              margin: 0,
              paddingInlineStart: 18,
              display: "flex",
              flexDirection: "column",
              gap: 4,
            }}
          >
            {row.types.map((type) => (
              <li key={type}>
                <Text size="sm">{type}</Text>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </Modal>
  );
}

export function OverviewDemo() {
  const router = useRouter();
  const basePath = useAdminBasePath();
  const live = useIsNewAdminMigrate();
  const [prerequisites, setPrerequisites] = useState(() => (live ? [] : allPrerequisiteQueue()));
  const followUp = useMemo(() => (live ? [] : allFollowUpQueue()), [live]);
  const outstandingInvoices = useMemo(() => (live ? [] : allClassDueInvoices()), [live]);
  const invoiceColumns = useMemo(() => buildClassPastDueInvoiceColumns(), []);
  const [students, setStudents] = useState(live ? [] : STUDENTS_TO_REMOVE);
  const [messageStudent, setMessageStudent] = useState<StudentToRemove | null>(null);
  const [removeStudent, setRemoveStudent] = useState<StudentToRemove | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [reviewRow, setReviewRow] = useState<ClassPrerequisiteQueueRow | null>(null);
  const [remindRow, setRemindRow] = useState<ClassFollowUpRow | null>(null);

  const reviewSubmissions = useMemo(() => {
    if (!reviewRow) return [];
    return prerequisites.filter(
      (item) => item.studentId === reviewRow.studentId && item.classId === reviewRow.classId,
    );
  }, [prerequisites, reviewRow]);

  function confirmRemove(student: StudentToRemove, refundAmount: number) {
    setStudents((prev) => prev.filter((item) => item.id !== student.id));
    setRemoveStudent(null);
    const formatted = refundAmount.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
    });
    toast.success(`Removed ${student.name} with a ${formatted} refund — demo mode`);
  }

  const prerequisiteColumns: TableColumn<ClassPrerequisiteQueueRow>[] = [
    {
      key: "name",
      header: "Name",
      width: proportional(1, { minWidth: 160 }),
      renderCell: (row) => (
        <RowClickCell onClick={() => setReviewRow(row)}>
          <Avatar name={row.student} size="sm" />
          <span style={{ marginInlineStart: 8 }}>{row.student}</span>
        </RowClickCell>
      ),
    },
    {
      key: "class",
      header: "Class",
      width: proportional(1, { minWidth: 140 }),
      renderCell: (row) => (
        <RowClickCell onClick={() => setReviewRow(row)}>
          <span style={{ color: "var(--linear-color-ink-subtle)" }}>{row.className}</span>
        </RowClickCell>
      ),
    },
    {
      key: "type",
      header: "Document type",
      width: proportional(1, { minWidth: 160 }),
      renderCell: (row) => (
        <RowClickCell onClick={() => setReviewRow(row)}>
          <span style={{ color: "var(--linear-color-ink-subtle)" }}>{row.type}</span>
        </RowClickCell>
      ),
    },
    {
      key: "review",
      header: "",
      width: pixel(108),
      renderCell: (row) => (
        <Button
          label="Review"
          variant="secondary"
          size="sm"
          icon={<ClipboardCheck size={13} strokeWidth={1.75} />}
          onClick={() => setReviewRow(row)}
        />
      ),
    },
  ];

  const followUpColumns: TableColumn<ClassFollowUpRow>[] = [
    {
      key: "name",
      header: "Name",
      width: proportional(1, { minWidth: 160 }),
      renderCell: (row) => (
        <span style={{ display: "inline-flex", alignItems: "center" }}>
          <Avatar name={row.student} size="sm" />
          <span style={{ marginInlineStart: 8 }}>{row.student}</span>
        </span>
      ),
    },
    {
      key: "class",
      header: "Class",
      width: proportional(1, { minWidth: 140 }),
      renderCell: (row) => (
        <span style={{ color: "var(--linear-color-ink-subtle)" }}>{row.className}</span>
      ),
    },
    {
      key: "type",
      header: "Document type",
      width: proportional(1, { minWidth: 160 }),
      renderCell: (row) => (
        <span style={{ color: "var(--linear-color-ink-subtle)" }}>{missingDocumentsLabel(row.types)}</span>
      ),
    },
    {
      key: "daysUntilClass",
      header: "Days until class starts",
      width: pixel(160),
      renderCell: (row) => (
        <span style={{ color: "var(--linear-color-ink-subtle)" }}>{daysUntilLabel(row.daysUntilClass)}</span>
      ),
    },
    {
      key: "remind",
      header: "",
      width: pixel(108),
      renderCell: (row) => (
        <Button
          label="Remind"
          variant="secondary"
          size="sm"
          icon={<Bell size={13} strokeWidth={1.75} />}
          onClick={() => setRemindRow(row)}
        />
      ),
    },
  ];

  const studentColumns: TableColumn<StudentToRemove>[] = [
    {
      key: "name",
      header: "Name",
      width: proportional(1, { minWidth: 160 }),
      renderCell: (row) => (
        <span style={{ display: "inline-flex", alignItems: "center" }}>
          <Avatar name={row.name} size="sm" />
          <span style={{ marginInlineStart: 8 }}>{row.name}</span>
        </span>
      ),
    },
    {
      key: "email",
      header: "Email",
      width: proportional(1, { minWidth: 180 }),
      renderCell: (row) => (
        <span style={{ color: "var(--linear-color-ink-subtle)" }}>{row.email}</span>
      ),
    },
    {
      key: "class",
      header: "Class",
      width: pixel(140),
      renderCell: (row) => (
        <span style={{ color: "var(--linear-color-ink-subtle)" }}>{row.className}</span>
      ),
    },
    {
      key: "reason",
      header: "Reason",
      width: proportional(1, { minWidth: 180 }),
      renderCell: (row) => (
        <span style={{ color: "var(--linear-color-ink-subtle)" }}>{row.reason}</span>
      ),
    },
    {
      key: "message",
      header: "",
      width: pixel(44),
      renderCell: (row) => (
        <IconButton
          label={`Email ${row.name}`}
          variant="secondary"
          size="sm"
          icon={<Mail size={13} strokeWidth={1.75} />}
          onClick={() => setMessageStudent(row)}
        />
      ),
    },
    {
      key: "remove",
      header: "",
      width: pixel(96),
      renderCell: (row) => (
        <Button label="Remove" variant="secondary" size="sm" onClick={() => setRemoveStudent(row)} />
      ),
    },
  ];

  return (
    <div style={{ height: "100%" }}>
      <FoundationLayout
        navigation={<LinearSidebar />}
        contentMaxWidth={1200}
        header={
          <CanvasHeader
            topbar={{
              title: "Overview",
              icon: <LayoutDashboard size={16} strokeWidth={1.75} />,
              endContent: (
                <Button
                  label="Add Class"
                  variant="secondary"
                  icon={<Plus size={14} strokeWidth={1.75} />}
                  onClick={() => setCreateOpen(true)}
                />
              ),
            }}
          />
        }
      >
        <ClassContentPage>
          <OverviewCard
            title="Prerequisites to approve"
            emptyLabel="No prerequisites waiting for approval."
            isEmpty={prerequisites.length === 0}
          >
            <GroupedTable
              data={prerequisites}
              columns={prerequisiteColumns}
              getRowKey={(row) => row.id}
              appearance="nested"
              listChrome={false}
            />
          </OverviewCard>
          <OverviewCard
            title="Follow-up: missing prerequisites"
            emptyLabel="No missing prerequisites to follow up on."
            isEmpty={followUp.length === 0}
          >
            <GroupedTable
              data={followUp}
              columns={followUpColumns}
              getRowKey={(row) => row.id}
              appearance="nested"
              listChrome={false}
              hasHover={false}
            />
          </OverviewCard>
          <OverviewCard
            title="Outstanding invoices"
            emptyLabel="No outstanding invoices."
            isEmpty={outstandingInvoices.length === 0}
          >
            <GroupedTable
              data={outstandingInvoices}
              columns={invoiceColumns}
              getRowKey={(row) => row.id}
              appearance="nested"
              listChrome={false}
            />
          </OverviewCard>
          <OverviewCard
            title="Students to remove"
            emptyLabel="No students flagged for removal."
            isEmpty={students.length === 0}
          >
            <GroupedTable
              data={students}
              columns={studentColumns}
              getRowKey={(row) => row.id}
              appearance="nested"
              listChrome={false}
            />
          </OverviewCard>
        </ClassContentPage>
      </FoundationLayout>
      <MessageStudentModal student={messageStudent} onClose={() => setMessageStudent(null)} />
      <RemindFollowUpModal row={remindRow} onClose={() => setRemindRow(null)} />
      {reviewRow ? (
        <ClassPrerequisitesQueue
          key={`${reviewRow.classId}-${reviewRow.studentId}`}
          classId={reviewRow.classId}
          submissions={reviewSubmissions}
          reviewSubmissionId={reviewRow.id}
          hideBanner
          onReviewClose={() => setReviewRow(null)}
          onReviewed={(ids) =>
            setPrerequisites((prev) => prev.filter((item) => !ids.includes(item.id)))
          }
        />
      ) : null}
      <RemoveStudentModal
        student={removeStudent}
        onClose={() => setRemoveStudent(null)}
        onConfirm={confirmRemove}
      />
      <CreateClassModal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={(created) => {
          router.push(`${basePath}${classDetailHref(created.id)}`);
        }}
      />
    </div>
  );
}
