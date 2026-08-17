"use client";

import { VStack } from "@/components/patterns/primitives/Stack";
import { List } from "@/components/patterns/primitives/List";
import { Text } from "@/components/patterns/primitives/Text";
import { Building2, CalendarDays, CircleDollarSign, Tag } from "lucide-react";
import { SideContentField } from "@/components/patterns/foundation/side-content";
import type { LeafletSponsorshipInvoiceRow } from "@/data/mocks/leaflets";
import { MarkAsPaidControl } from "@/components/patterns/client-templates/shared";

export type LeafletInvoiceDetailPanelProps = {
  invoice: LeafletSponsorshipInvoiceRow;
  onPaid?: () => Promise<void> | void;
};

/** Sponsorship invoice detail — shown in the outlined side panel when a row is selected. */
export function LeafletInvoiceDetailPanel({ invoice, onPaid }: LeafletInvoiceDetailPanelProps) {
  return (
    <VStack gap={5}>
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <Text size="sm" color="secondary">
          {invoice.business}
        </Text>
        <Text style={{ fontSize: 22, fontWeight: 600, letterSpacing: "-0.01em" }}>{invoice.amount}</Text>
      </div>

      <List
        density="compact"
        header={
          <Text type="label" color="secondary">
            Invoice
          </Text>
        }
      >
        <SideContentField icon={<CircleDollarSign size={16} strokeWidth={1.75} />} label={invoice.status} />
        <SideContentField icon={<CalendarDays size={16} strokeWidth={1.75} />} label={`Due ${invoice.dueDate}`} />
        <SideContentField icon={<Building2 size={16} strokeWidth={1.75} />} label={invoice.business} />
        <SideContentField icon={<Tag size={16} strokeWidth={1.75} />} label={invoice.level} />
      </List>

      <MarkAsPaidControl invoiceId={invoice.id} isPaid={invoice.status === "Paid"} onPaid={onPaid} />
    </VStack>
  );
}
