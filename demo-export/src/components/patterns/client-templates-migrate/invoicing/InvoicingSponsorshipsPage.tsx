"use client";

import { useMemo } from "react";
import { useAllSponsorships, type SponsorshipWithParent } from "hooks";
import { pixel, proportional, type TableColumn } from "@/components/patterns/primitives/table";
import { GroupedTable } from "@/components/patterns/grouped-table/GroupedTable";
import { RowClickCell, ClassContentPage } from "@/components/patterns/client-templates/shared";
import { Text } from "@/components/patterns/primitives/Text";
import { formatUsd } from "@/components/billing/invoiceUtils";

const STATUS_COLOR: Record<string, string> = {
  pledged: "#8a8f98",
  invoiced: "#f2c94c",
  paid: "#27a644",
};

function StatusPill({ status }: { status: string | null }) {
  const color = STATUS_COLOR[status ?? ""] ?? "#8a8f98";
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        height: 22,
        paddingInline: 8,
        borderRadius: 999,
        background: `${color}1A`,
        color,
        fontSize: 12,
        fontWeight: 500,
        textTransform: "capitalize",
      }}
    >
      {status ?? "—"}
    </span>
  );
}

function matchesFilters(
  row: SponsorshipWithParent,
  statusFilter: string[],
  parentTypeFilter: string[],
  search: string,
): boolean {
  if (statusFilter.length && !statusFilter.includes(row.status ?? "")) return false;
  if (parentTypeFilter.length && !parentTypeFilter.includes(row.parentType ?? "")) return false;
  if (search) {
    const q = search.toLowerCase();
    const business = row.businesses?.business_name ?? row.description ?? "";
    if (
      !business.toLowerCase().includes(q) &&
      !(row.description ?? "").toLowerCase().includes(q) &&
      !row.parentLabel.toLowerCase().includes(q)
    ) {
      return false;
    }
  }
  return true;
}

function buildColumns(
  onSelect?: (row: SponsorshipWithParent) => void,
): TableColumn<SponsorshipWithParent>[] {
  return [
    {
      key: "business",
      header: "Business",
      width: proportional(1, { minWidth: 180 }),
      renderCell: (row) => (
        <RowClickCell onClick={onSelect ? () => onSelect(row) : undefined}>
          <span style={{ color: "var(--linear-color-ink)" }}>
            {row.businesses?.business_name ?? "—"}
          </span>
        </RowClickCell>
      ),
    },
    {
      key: "description",
      header: "Tier / item",
      width: proportional(1, { minWidth: 160 }),
      renderCell: (row) => (
        <RowClickCell onClick={onSelect ? () => onSelect(row) : undefined}>
          <span style={{ color: "var(--linear-color-ink-subtle)" }}>{row.description ?? "—"}</span>
        </RowClickCell>
      ),
    },
    {
      key: "amount",
      header: "Amount",
      width: pixel(100),
      renderCell: (row) => (
        <RowClickCell onClick={onSelect ? () => onSelect(row) : undefined}>
          <span style={{ color: "var(--linear-color-ink)" }}>
            {formatUsd((row.amount ?? 0) * 100)}
          </span>
        </RowClickCell>
      ),
    },
    {
      key: "status",
      header: "Status",
      width: pixel(120),
      renderCell: (row) => (
        <RowClickCell onClick={onSelect ? () => onSelect(row) : undefined}>
          <StatusPill status={row.status} />
        </RowClickCell>
      ),
    },
  ];
}

export type InvoicingSponsorshipsPageProps = {
  search: string;
  statusFilter: string[];
  parentTypeFilter: string[];
  onSelectSponsorship?: (row: SponsorshipWithParent) => void;
};

export function InvoicingSponsorshipsPage({
  search,
  statusFilter,
  parentTypeFilter,
  onSelectSponsorship,
}: InvoicingSponsorshipsPageProps) {
  const { sponsorships, loading, error } = useAllSponsorships();
  const columns = useMemo(() => buildColumns(onSelectSponsorship), [onSelectSponsorship]);

  const filtered = useMemo(
    () => sponsorships.filter((row) => matchesFilters(row, statusFilter, parentTypeFilter, search)),
    [sponsorships, statusFilter, parentTypeFilter, search],
  );

  if (error) {
    return (
      <ClassContentPage>
        <Text color="secondary">{error}</Text>
      </ClassContentPage>
    );
  }

  return (
    <div style={{ height: "100%", minHeight: 0, boxSizing: "border-box", padding: "0 8px" }}>
      <GroupedTable
        data={filtered}
        columns={columns}
        getRowKey={(row) => row.id}
        groupBy={(row) => row.parentLabel}
        listChrome
      />
      {!loading && filtered.length === 0 ? (
        <div style={{ padding: 24 }}>
          <Text color="secondary">No sponsorships match the current filters.</Text>
        </div>
      ) : null}
    </div>
  );
}
