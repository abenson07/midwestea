"use client";

import { useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { useAllSponsorships } from "hooks";
import { ClassContentPage } from "@/components/patterns/client-templates/shared";
import { GroupedTable } from "@/components/patterns/grouped-table/GroupedTable";
import { Text } from "@/components/patterns/primitives/Text";
import { cardSurfaceStyle } from "@/components/patterns/primitives/Card";
import { proportional, type TableColumn } from "@/components/patterns/primitives/table";
import { formatUsd } from "@/components/billing/invoiceUtils";
import { ViewTab } from "@/components/patterns/foundation/ViewTab";
import { ViewTabs } from "@/components/patterns/foundation/ViewTabs";
import { ListToolbar } from "@/components/patterns/foundation/ListToolbar";
import {
  getTransactionDisplayStatus,
  getTransactionListStatus,
} from "@/data/mocks/transaction-status";
import {
  classRevenueFromTransactions,
  formatRevenueUsd,
  matchesRevenueSearch,
  type ClassRevenueRow,
  type RevenueScope,
} from "./classRevenue";
import { useIsNewAdminMigrate } from "@/components/patterns/client-templates/shared";
import { catalogTemplatesOfKind } from "../catalog/catalogMocks";
import { buildPastDueTransactionColumns } from "./transactionColumns";
import { useTransactions } from "./useTransactions";

function Card({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section
      style={{
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        gap: 12,
        padding: 20,
        background: "var(--linear-color-panel)",
        border: "var(--linear-border-width) solid var(--linear-color-panel-border)",
        borderRadius: "var(--linear-radius-md)",
        boxShadow: "var(--linear-shadow-panel)",
      }}
    >
      <Text weight="semibold">{title}</Text>
      {children}
    </section>
  );
}

const SEGMENT_COLOR = {
  pledged: "#8a8f98",
  invoiced: "#f2c94c",
  paid: "#27a644",
} as const;

function YearChart({
  pledged,
  invoiced,
  paid,
}: {
  pledged: number;
  invoiced: number;
  paid: number;
}) {
  const total = pledged + invoiced + paid;
  const pct = (value: number) => (total > 0 ? (value / total) * 100 : 0);
  const year = new Date().getFullYear();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <Text size="sm" color="secondary">
        {formatUsd(total * 100)} tracked in {year}
      </Text>
      <div
        style={{
          display: "flex",
          width: "100%",
          height: 12,
          borderRadius: 999,
          overflow: "hidden",
          background: "var(--linear-color-hairline)",
        }}
      >
        {pledged > 0 ? (
          <span style={{ width: `${pct(pledged)}%`, background: SEGMENT_COLOR.pledged }} />
        ) : null}
        {invoiced > 0 ? (
          <span style={{ width: `${pct(invoiced)}%`, background: SEGMENT_COLOR.invoiced }} />
        ) : null}
        {paid > 0 ? (
          <span style={{ width: `${pct(paid)}%`, background: SEGMENT_COLOR.paid }} />
        ) : null}
      </div>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        {(
          [
            ["Expected", pledged, SEGMENT_COLOR.pledged],
            ["Invoiced", invoiced, SEGMENT_COLOR.invoiced],
            ["Paid", paid, SEGMENT_COLOR.paid],
          ] as const
        ).map(([label, value, color]) => (
          <span key={label} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <span
              style={{ width: 8, height: 8, borderRadius: 999, background: color, flexShrink: 0 }}
            />
            <Text size="sm" color="secondary">
              {label}
            </Text>
            <Text size="sm" weight="medium">
              {formatUsd(value * 100)}
            </Text>
          </span>
        ))}
      </div>
    </div>
  );
}

function moneyColumn(
  key: keyof Pick<
    ClassRevenueRow,
    "registrationIncome" | "tuitionIncome" | "totalExpected" | "totalReceived"
  >,
  header: string,
): TableColumn<ClassRevenueRow> {
  return {
    key,
    header,
    width: proportional(1, { minWidth: 120 }),
    align: "end",
    sumValue: (row) => row[key],
    formatSum: formatRevenueUsd,
    renderCell: (row) => formatRevenueUsd(row[key]),
  };
}

const REVENUE_COLUMNS: TableColumn<ClassRevenueRow>[] = [
  {
    key: "className",
    header: "Class",
    width: proportional(1.6, { minWidth: 180 }),
    renderCell: (row) => (
      <span style={{ color: "var(--linear-color-ink)" }}>{row.className}</span>
    ),
  },
  moneyColumn("registrationIncome", "Registration income"),
  moneyColumn("tuitionIncome", "Tuition income"),
  moneyColumn("totalExpected", "Total expected"),
  moneyColumn("totalReceived", "Total received"),
];

export type PaymentsOverviewPageProps = {
  onSelectTransaction?: (id: string) => void;
};

export function PaymentsOverviewPage({ onSelectTransaction }: PaymentsOverviewPageProps) {
  const live = useIsNewAdminMigrate();
  const { transactions } = useTransactions();
  const { sponsorships } = useAllSponsorships();
  const [revenueScope, setRevenueScope] = useState<RevenueScope>("open");
  const [revenueSearch, setRevenueSearch] = useState("");
  const [courseFilter, setCourseFilter] = useState<string[]>([]);

  const scopedRevenue = useMemo(
    () => (live ? [] : classRevenueFromTransactions(transactions, revenueScope)),
    [live, transactions, revenueScope],
  );
  const programOptions = useMemo(
    () =>
      (live ? [] : catalogTemplatesOfKind("Program")).map((template) => ({
        value: template.code,
        label: template.name,
      })),
    [live],
  );
  const courseOptions = useMemo(
    () =>
      (live ? [] : catalogTemplatesOfKind("Course")).map((template) => ({
        value: template.code,
        label: template.name,
      })),
    [live],
  );
  const revenueRows = useMemo(() => {
    return scopedRevenue.filter((row) => {
      if (!matchesRevenueSearch(row, revenueSearch)) return false;
      if (courseFilter.length && !courseFilter.includes(row.courseCode)) return false;
      return true;
    });
  }, [scopedRevenue, revenueSearch, courseFilter]);

  const openRows = useMemo(
    () =>
      transactions.filter((row) => {
        const status = getTransactionListStatus(row);
        return status === "pending" || status === "past_due";
      }),
    [transactions],
  );
  const pastDue = useMemo(
    () => transactions.filter((row) => getTransactionListStatus(row) === "past_due"),
    [transactions],
  );
  const upcoming = useMemo(
    () => transactions.filter((row) => getTransactionDisplayStatus(row) === "due_soon"),
    [transactions],
  );

  const reminderColumns = useMemo(
    () =>
      buildPastDueTransactionColumns({
        onSelect: onSelectTransaction,
        onRemind: (row) =>
          toast.success(`Reminder sent to ${row.studentName} — demo mode, not delivered`),
      }),
    [onSelectTransaction],
  );

  const currentYear = new Date().getFullYear();
  const yearTotals = useMemo(() => {
    const rows = sponsorships.filter((s) => s.parentYear === currentYear);
    const sum = (status: string) =>
      rows.filter((s) => s.status === status).reduce((total, s) => total + (s.amount ?? 0), 0);
    return { pledged: sum("pledged"), invoiced: sum("invoiced"), paid: sum("paid") };
  }, [sponsorships, currentYear]);

  return (
    <ClassContentPage>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
        <Card title="Open transactions">
          <Text size="md" weight="semibold">
            {openRows.length}
          </Text>
          <Text size="sm" color="secondary">
            Unpaid, awaiting payment
          </Text>
        </Card>
        <Card title="Past due">
          <Text size="md" weight="semibold">
            {pastDue.length}
          </Text>
          <Text size="sm" color="secondary">
            Needs a reminder now
          </Text>
        </Card>
        <Card title="Due soon">
          <Text size="md" weight="semibold">
            {upcoming.length}
          </Text>
          <Text size="sm" color="secondary">
            Due within 7 days
          </Text>
        </Card>
      </div>

      <Card title={`Money for ${currentYear}`}>
        <YearChart pledged={yearTotals.pledged} invoiced={yearTotals.invoiced} paid={yearTotals.paid} />
      </Card>

      <div
        style={{
          ...cardSurfaceStyle,
          boxSizing: "border-box",
          padding: 20,
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        <Text weight="semibold">Transactions needing a reminder</Text>
        {pastDue.length === 0 ? (
          <Text size="sm" color="secondary">
            No past-due transactions right now.
          </Text>
        ) : (
          <GroupedTable
            data={pastDue}
            columns={reminderColumns}
            getRowKey={(row) => row.id}
            appearance="nested"
            listChrome={false}
          />
        )}
      </div>

      <section style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <Text weight="semibold">Revenue by class</Text>
        <ViewTabs
          aria-label="Revenue by class views"
          endContent={
            <ListToolbar
              searchValue={revenueSearch}
              onSearchChange={setRevenueSearch}
              searchPlaceholder="Search classes…"
              filterGroups={[
                {
                  label: "Programs",
                  submenu: true,
                  options: programOptions,
                  selected: courseFilter,
                  onChange: setCourseFilter,
                },
                {
                  label: "Courses",
                  submenu: true,
                  options: courseOptions,
                  selected: courseFilter,
                  onChange: setCourseFilter,
                },
              ]}
            />
          }
        >
          <ViewTab
            label="Open classes"
            selected={revenueScope === "open"}
            onClick={() => {
              setRevenueScope("open");
              setCourseFilter([]);
            }}
          />
          <ViewTab
            label="This year"
            selected={revenueScope === "this_year"}
            onClick={() => {
              setRevenueScope("this_year");
              setCourseFilter([]);
            }}
          />
          <ViewTab
            label="All time"
            selected={revenueScope === "all"}
            onClick={() => {
              setRevenueScope("all");
              setCourseFilter([]);
            }}
          />
        </ViewTabs>
        <div style={{ marginInline: -8 }}>
          {revenueRows.length ? (
            <GroupedTable
              data={revenueRows}
              columns={REVENUE_COLUMNS}
              getRowKey={(row) => row.classId}
              appearance="nested"
              listChrome={false}
              hasHover={false}
              sumFooter
            />
          ) : (
            <Text size="sm" color="secondary">
              {live ? "No revenue data yet." : "No classes match the current filters."}
            </Text>
          )}
        </div>
      </section>
    </ClassContentPage>
  );
}
