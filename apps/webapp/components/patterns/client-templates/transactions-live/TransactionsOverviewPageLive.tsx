"use client";

import { useMemo } from "react";
import { Grid } from "@/components/patterns/primitives/Grid";
import { ClassContentPage } from "@/components/patterns/client-templates/shared";
import { MetricCard } from "@/components/patterns/client-templates/classes";
import type { TransactionRow } from "@/data/mocks/transactions";
import {
  formatCentsAsUSD,
  getTransactionAmountCents,
  getTransactionDisplayStatus,
} from "@/data/mocks/transaction-status";
import { PastDueDueSoonTableLive } from "./PastDueDueSoonTableLive";
import { RecentActivityTableLive } from "./RecentActivityTableLive";

export type TransactionsOverviewPageLiveProps = {
  data: TransactionRow[];
};

export function TransactionsOverviewPageLive({ data }: TransactionsOverviewPageLiveProps) {
  const classOptions = useMemo(() => {
    const byCode = new Map<string, string>();
    for (const row of data) {
      if (!byCode.has(row.classCode)) byCode.set(row.classCode, row.className);
    }
    return Array.from(byCode.entries())
      .map(([code]) => ({ code, label: code }))
      .sort((a, b) => a.code.localeCompare(b.code));
  }, [data]);

  const { pastDueCount, pastDueCents, dueSoonCount, dueSoonCents, activeInvoiceCount } = useMemo(() => {
    let pastDue = 0;
    let pastDueAmount = 0;
    let dueSoon = 0;
    let dueSoonAmount = 0;
    let active = 0;
    for (const row of data) {
      const status = getTransactionDisplayStatus(row);
      if (status === "past_due") {
        pastDue += 1;
        pastDueAmount += getTransactionAmountCents(row);
      } else if (status === "due_soon") {
        dueSoon += 1;
        dueSoonAmount += getTransactionAmountCents(row);
      }
      if (status === "past_due" || status === "due_soon" || status === "pending") {
        active += 1;
      }
    }
    return {
      pastDueCount: pastDue,
      pastDueCents: pastDueAmount,
      dueSoonCount: dueSoon,
      dueSoonCents: dueSoonAmount,
      activeInvoiceCount: active,
    };
  }, [data]);

  return (
    <ClassContentPage>
      <Grid columns={3} gap={4}>
        <MetricCard label="Past Due" value={`${pastDueCount} · ${formatCentsAsUSD(pastDueCents)}`} />
        <MetricCard label="Due Soon" value={`${dueSoonCount} · ${formatCentsAsUSD(dueSoonCents)}`} />
        <MetricCard label="Total Active Invoices" value={String(activeInvoiceCount)} />
      </Grid>

      <PastDueDueSoonTableLive data={data} classOptions={classOptions} />
      <RecentActivityTableLive data={data} />
    </ClassContentPage>
  );
}
