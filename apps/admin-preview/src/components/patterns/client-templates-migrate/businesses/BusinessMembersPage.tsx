"use client";

import { useMemo } from "react";
import { Grid } from "@/components/patterns/primitives/Grid";
import { MetricCard } from "@/components/patterns/client-templates/classes/MetricCard";
import { pixel, proportional, type TableColumn } from "@/components/patterns/primitives/table";
import { NestedGroupedTable } from "@/components/patterns/grouped-table/NestedGroupedTable";
import { RowClickCell } from "@/components/patterns/client-templates/shared";
import type { BusinessMemberRow } from "./types";
import { BusinessMembershipStatusToken } from "./BusinessMembershipStatusToken";

const GROUP_ORDER = ["past_due", "pending", "active", "lapsed"];

const GROUP_LABEL: Record<string, string> = {
  past_due: "Past Due",
  pending: "Pending",
  active: "Active",
  lapsed: "Lapsed",
};

const CURRENT_YEAR = new Date().getFullYear();

function getMemberSinceYear(row: BusinessMemberRow): number {
  return new Date(row.memberSince).getFullYear();
}

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

function buildColumns(onSelect?: (row: BusinessMemberRow) => void): TableColumn<BusinessMemberRow>[] {
  return [
    {
      key: "businessName",
      header: "Business",
      width: proportional(1, { minWidth: 200 }),
      renderCell: (row) => (
        <RowClickCell onClick={onSelect ? () => onSelect(row) : undefined}>
          <span style={{ color: "var(--linear-color-ink)" }}>{row.businessName}</span>
        </RowClickCell>
      ),
    },
    {
      key: "tier",
      header: "Tier",
      width: pixel(110),
      renderCell: (row) => (
        <RowClickCell onClick={onSelect ? () => onSelect(row) : undefined}>
          <span style={{ color: "var(--linear-color-ink-subtle)" }}>{row.tier}</span>
        </RowClickCell>
      ),
    },
    {
      key: "renewalDate",
      header: "Renewal Date",
      width: pixel(130),
      renderCell: (row) => (
        <RowClickCell onClick={onSelect ? () => onSelect(row) : undefined}>
          <span style={{ color: "var(--linear-color-ink-subtle)" }}>{row.renewalDate}</span>
        </RowClickCell>
      ),
    },
    {
      key: "status",
      header: "Status",
      width: pixel(120),
      renderCell: (row) => (
        <RowClickCell onClick={onSelect ? () => onSelect(row) : undefined}>
          <BusinessMembershipStatusToken status={row.status} />
        </RowClickCell>
      ),
    },
  ];
}

export type BusinessMembersPageProps = {
  data?: BusinessMemberRow[];
  onSelect?: (row: BusinessMemberRow) => void;
};

/** Business memberships grouped by status — transactions-style chrome. */
export function BusinessMembersPage({ data = [], onSelect }: BusinessMembersPageProps) {
  const columns = useMemo(() => buildColumns(onSelect), [onSelect]);

  const activeMembers = useMemo(() => data.filter((row) => row.status === "active"), [data]);
  const newMembersThisYear = useMemo(
    () => data.filter((row) => getMemberSinceYear(row) === CURRENT_YEAR),
    [data],
  );
  const expectedRevenue = useMemo(
    () => data.filter((row) => row.status !== "lapsed").reduce((sum, row) => sum + row.annualDues, 0),
    [data],
  );

  return (
    <div
      style={{
        height: "100%",
        minHeight: 0,
        overflow: "auto",
        boxSizing: "border-box",
        padding: "32px 24px 64px",
        display: "flex",
        flexDirection: "column",
        gap: 32,
      }}
    >
      <Grid columns={3} gap={4}>
        <MetricCard label="Active Business Members" value={String(activeMembers.length)} />
        <MetricCard label="New Members This Year" value={String(newMembersThisYear.length)} />
        <MetricCard
          label="Expected Revenue from Businesses"
          value={currencyFormatter.format(expectedRevenue)}
        />
      </Grid>

      <NestedGroupedTable
        title="Business Members"
        data={data}
        columns={columns}
        getRowKey={(row) => row.id}
        groupBy={(row) => row.status}
        groupOrder={GROUP_ORDER}
        getGroupMeta={(key) => ({ label: GROUP_LABEL[key] })}
      />
    </div>
  );
}
