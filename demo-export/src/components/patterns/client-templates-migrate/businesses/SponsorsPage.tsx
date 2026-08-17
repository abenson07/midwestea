"use client";

import { useMemo } from "react";
import { Grid } from "@/components/patterns/primitives/Grid";
import { MetricCard } from "@/components/patterns/client-templates/classes/MetricCard";
import { pixel, proportional, type TableColumn } from "@/components/patterns/primitives/table";
import { NestedGroupedTable } from "@/components/patterns/grouped-table/NestedGroupedTable";
import { RowClickCell } from "@/components/patterns/client-templates/shared";
import type { SponsorRow } from "./types";
import { SponsorshipLevelBadge } from "./SponsorshipLevelBadge";

const GROUP_ORDER = ["platinum", "gold", "silver", "bronze"];

const GROUP_LABEL: Record<string, string> = {
  platinum: "Platinum",
  gold: "Gold",
  silver: "Silver",
  bronze: "Bronze",
};

const CURRENT_YEAR = new Date().getFullYear();

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

function buildColumns(onSelect?: (row: SponsorRow) => void): TableColumn<SponsorRow>[] {
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
      key: "amount",
      header: "Amount",
      width: pixel(110),
      renderCell: (row) => (
        <RowClickCell onClick={onSelect ? () => onSelect(row) : undefined}>
          <span style={{ color: "var(--linear-color-ink-subtle)" }}>
            {currencyFormatter.format(row.amount)}
          </span>
        </RowClickCell>
      ),
    },
    {
      key: "lastSponsoredYear",
      header: "Last Sponsored",
      width: pixel(130),
      renderCell: (row) => (
        <RowClickCell onClick={onSelect ? () => onSelect(row) : undefined}>
          <span style={{ color: "var(--linear-color-ink-subtle)" }}>{row.lastSponsoredYear}</span>
        </RowClickCell>
      ),
    },
    {
      key: "level",
      header: "Level",
      width: pixel(120),
      renderCell: (row) => (
        <RowClickCell onClick={onSelect ? () => onSelect(row) : undefined}>
          <SponsorshipLevelBadge level={row.sponsorshipLevel} />
        </RowClickCell>
      ),
    },
  ];
}

export type SponsorsPageProps = {
  data?: SponsorRow[];
  onSelect?: (row: SponsorRow) => void;
};

/** Past sponsors grouped by sponsorship level — same layout as Members. */
export function SponsorsPage({ data = [], onSelect }: SponsorsPageProps) {
  const columns = useMemo(() => buildColumns(onSelect), [onSelect]);

  const totalSponsors = data.length;
  const newSponsorsThisYear = useMemo(
    () => data.filter((row) => new Date(row.sponsorSince).getFullYear() === CURRENT_YEAR),
    [data],
  );
  const totalSponsorshipRevenue = useMemo(
    () => data.reduce((sum, row) => sum + row.amount, 0),
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
        <MetricCard label="Total Sponsors" value={String(totalSponsors)} />
        <MetricCard label="New Sponsors This Year" value={String(newSponsorsThisYear.length)} />
        <MetricCard
          label="Total Sponsorship Revenue"
          value={currencyFormatter.format(totalSponsorshipRevenue)}
        />
      </Grid>

      <NestedGroupedTable
        title="Sponsors"
        data={data}
        columns={columns}
        getRowKey={(row) => row.id}
        groupBy={(row) => row.sponsorshipLevel}
        groupOrder={GROUP_ORDER}
        getGroupMeta={(key) => ({ label: GROUP_LABEL[key] })}
      />
    </div>
  );
}
