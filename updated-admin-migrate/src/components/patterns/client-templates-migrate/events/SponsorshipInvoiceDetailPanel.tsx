"use client";

import { VStack } from "@/components/patterns/primitives/Stack";
import { List } from "@/components/patterns/primitives/List";
import { Text } from "@/components/patterns/primitives/Text";
import { Award, Building2, CalendarDays, CircleDollarSign } from "lucide-react";
import { SideContentField } from "@/components/patterns/foundation/side-content";
import type { EventSponsorshipInvoiceRow } from "@/data/mocks/events";
import { MarkAsPaidControl } from "@/components/patterns/client-templates/shared";
import { useEventContext } from "@/components/integrated/events/EventContext";

export type SponsorshipInvoiceDetailPanelProps = {
  invoice: EventSponsorshipInvoiceRow;
};

/**
 * Sponsorship invoice detail — shown in the outlined side panel when a
 * row is selected from the Sponsorships page's invoice list.
 */
export function SponsorshipInvoiceDetailPanel({ invoice }: SponsorshipInvoiceDetailPanelProps) {
  const { refetchAll } = useEventContext();
  return (
    <VStack gap={5}>
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <Text size="sm" color="secondary">
          {invoice.business}
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
            Invoice {invoice.invoiceNumber}
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
          icon={<Building2 size={16} strokeWidth={1.75} />}
          label={invoice.business}
        />
        <SideContentField
          icon={<Award size={16} strokeWidth={1.75} />}
          label={`${invoice.level} sponsor`}
        />
      </List>

      <MarkAsPaidControl invoiceId={invoice.id} isPaid={invoice.status === "Paid"} onPaid={refetchAll} />
    </VStack>
  );
}
