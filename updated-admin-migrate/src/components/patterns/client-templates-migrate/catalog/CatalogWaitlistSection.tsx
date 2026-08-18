"use client";

import { Text } from "@/components/patterns/primitives/Text";
import { proportional, type TableColumn } from "@/components/patterns/primitives/table";
import { GroupedTable } from "@/components/patterns/grouped-table/GroupedTable";
import type { CatalogWaitlistEntry } from "./catalogMocks";

const sectionStyle = {
  boxSizing: "border-box" as const,
  display: "flex" as const,
  flexDirection: "column" as const,
  gap: 8,
};

const COLUMNS: TableColumn<CatalogWaitlistEntry>[] = [
  {
    key: "fullName",
    header: "Full Name",
    width: proportional(1, { minWidth: 160 }),
    renderCell: (row) => row.fullName,
  },
  {
    key: "email",
    header: "Email",
    width: proportional(1, { minWidth: 160 }),
    renderCell: (row) => <span style={{ color: "var(--linear-color-ink-subtle)" }}>{row.email}</span>,
  },
  {
    key: "signedUpAt",
    header: "Signed Up",
    width: proportional(1, { minWidth: 120 }),
    renderCell: (row) => (
      <span style={{ color: "var(--linear-color-ink-subtle)" }}>{row.signedUpAt}</span>
    ),
  },
];

export type CatalogWaitlistSectionProps = {
  entries: CatalogWaitlistEntry[];
};

/** Pre-enrollment waitlist — shown above the classes table whenever there are signups, even for full classes. */
export function CatalogWaitlistSection({ entries }: CatalogWaitlistSectionProps) {
  if (!entries.length) return null;

  return (
    <section data-slot="catalog-waitlist-section" style={sectionStyle}>
      <Text weight="semibold">Waitlist</Text>
      <GroupedTable
        data={entries}
        columns={COLUMNS}
        getRowKey={(row) => row.id}
        appearance="nested"
        listChrome={false}
      />
    </section>
  );
}
