"use client";

import { Button } from "@astryxdesign/core/Button";
import { VStack } from "@astryxdesign/core/Layout";
import { List } from "@astryxdesign/core/List";
import { Text } from "@astryxdesign/core/Text";
import { CalendarDays, CircleDollarSign, UserRound } from "lucide-react";
import { SideContentField } from "@/components/patterns/foundation/side-content";
import type { ClassInvoiceRow } from "@/data/mocks/class-detail";

export type InvoiceDetailPanelProps = {
  invoice: ClassInvoiceRow;
};

/**
 * Payment / invoice detail — shown in the outlined side panel when a
 * row is selected from the Invoices section.
 */
export function InvoiceDetailPanel({ invoice }: InvoiceDetailPanelProps) {
  return (
    <VStack gap={5}>
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <Text size="sm" color="secondary">
          {invoice.id}
        </Text>
        <Text
          style={{ fontSize: 22, fontWeight: 600, letterSpacing: "-0.01em" }}
        >
          {invoice.amount}
        </Text>
      </div>

      <List
        density="compact"
        header={
          <Text type="label" color="secondary">
            Invoice
          </Text>
        }
      >
        <SideContentField
          icon={<CircleDollarSign size={16} strokeWidth={1.75} />}
          label={invoice.status}
        />
        <SideContentField
          icon={<CalendarDays size={16} strokeWidth={1.75} />}
          label={`Due ${invoice.dueDate}`}
        />
        <SideContentField
          icon={<UserRound size={16} strokeWidth={1.75} />}
          label={invoice.studentName}
        />
      </List>

      <Button label="Mark as paid" variant="secondary" size="sm" width="100%" />
    </VStack>
  );
}
