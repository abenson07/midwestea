"use client";

import { useState } from "react";
import { Bell, Wallet } from "lucide-react";
import { toast } from "sonner";
import { Avatar } from "@/components/patterns/primitives/Avatar";
import { Text } from "@/components/patterns/primitives/Text";
import { Button } from "@/components/patterns/primitives/Button";
import { Modal } from "@/components/patterns/shared/Modal";
import { pixel, proportional, type TableColumn } from "@/components/patterns/primitives/table";
import { GroupedTable } from "@/components/patterns/grouped-table/GroupedTable";
import { ClassBanner } from "./ClassBanner";
import type { ClassDueInvoice } from "./classMocks";

const columns: TableColumn<ClassDueInvoice>[] = [
  {
    key: "student",
    header: "Student",
    width: proportional(1, { minWidth: 160 }),
    renderCell: (row) => (
      <>
        <Avatar name={row.student} size="sm" />
        <span style={{ marginInlineStart: 8 }}>{row.student}</span>
      </>
    ),
  },
  {
    key: "invoiceNumber",
    header: "Invoice #",
    width: pixel(120),
    renderCell: (row) => (
      <span style={{ color: "var(--linear-color-ink-subtle)" }}>{row.invoiceNumber}</span>
    ),
  },
  {
    key: "amount",
    header: "Amount",
    width: pixel(100),
    renderCell: (row) => <span>{row.amount}</span>,
  },
  {
    key: "dueDate",
    header: "Due Date",
    width: pixel(120),
    renderCell: (row) => (
      <span style={{ color: "var(--linear-color-ink-subtle)" }}>{row.dueDate}</span>
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
        onClick={() =>
          toast.success(`Reminder sent to ${row.student} — demo mode, not delivered`)
        }
      />
    ),
  },
];

export type ClassDueInvoicesSectionProps = {
  invoices: ClassDueInvoice[];
};

/** Due invoices for this class — collapsed into a summary banner, full list in a modal. */
export function ClassDueInvoicesSection({ invoices }: ClassDueInvoicesSectionProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div data-slot="class-due-invoices-section">
      <ClassBanner
        icon={<Wallet size={16} strokeWidth={1.75} />}
        label={`${invoices.length} Invoice${invoices.length === 1 ? "" : "s"} past due`}
        onClick={() => setIsOpen(true)}
      />
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Invoices" width={640}>
        {invoices.length ? (
          <GroupedTable
            data={invoices}
            columns={columns}
            getRowKey={(row) => row.id}
            appearance="nested"
            listChrome={false}
          />
        ) : (
          <Text size="sm" color="secondary">
            No invoices due.
          </Text>
        )}
      </Modal>
    </div>
  );
}
