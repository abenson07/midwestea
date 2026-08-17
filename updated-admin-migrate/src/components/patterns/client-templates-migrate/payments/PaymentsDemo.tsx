"use client";

import { Suspense, useMemo, useState, type ReactNode } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Plus } from "lucide-react";
import { FoundationLayout } from "@/components/patterns/foundation/FoundationLayout";
import { CanvasHeader } from "@/components/patterns/foundation/CanvasHeader";
import { LinearSidebar } from "@/components/patterns/foundation/LinearSidebar";
import { ViewTab } from "@/components/patterns/foundation/ViewTab";
import { ViewTabs } from "@/components/patterns/foundation/ViewTabs";
import { ListToolbar } from "@/components/patterns/foundation/ListToolbar";
import { Button } from "@/components/patterns/primitives/Button";
import {
  MobileAdminShell,
  MobileInvoicesPage,
  useIsMobileAdmin,
} from "@/components/patterns/client-templates-migrate/mobile";
import { PaymentsOverviewPage } from "./PaymentsOverviewPage";
import { TransactionsListPage } from "./TransactionsListPage";
import { TransactionDetailPanel } from "./TransactionDetailPanel";
import { TransactionSidePanel } from "./TransactionSidePanel";
import { CreateTransactionModal } from "./CreateTransactionModal";
import { TRANSACTION_STATUS_FILTER_OPTIONS } from "./transactionColumns";
import { useTransactions } from "./useTransactions";

type PaymentsView = "overview" | "all-transactions" | "past-due";

export type PaymentsDemoProps = {
  navigation?: ReactNode;
};

export function PaymentsDemo({ navigation }: PaymentsDemoProps = {}) {
  const isMobile = useIsMobileAdmin();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { transactions, updateTransaction, addTransaction } = useTransactions();

  const [view, setView] = useState<PaymentsView>("overview");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [createOpen, setCreateOpen] = useState(false);
  const selectedId = searchParams.get("transactionId");
  const selected = useMemo(
    () => transactions.find((row) => row.id === selectedId) ?? null,
    [transactions, selectedId],
  );

  if (isMobile) {
    return (
      <MobileAdminShell active="invoices">
        <Suspense fallback={null}>
          <MobileInvoicesPage />
        </Suspense>
      </MobileAdminShell>
    );
  }

  function changeView(next: PaymentsView) {
    setView(next);
    selectTransaction(null);
  }

  function selectTransaction(id: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (id) params.set("transactionId", id);
    else params.delete("transactionId");
    const query = params.toString();
    router.replace(`${pathname}${query ? `?${query}` : ""}`);
  }

  const toolbar =
    view === "overview" ? null : (
      <ListToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search transactions…"
        filterGroups={
          view === "all-transactions"
            ? [
                {
                  label: "Status",
                  options: TRANSACTION_STATUS_FILTER_OPTIONS,
                  selected: statusFilter,
                  onChange: setStatusFilter,
                },
              ]
            : undefined
        }
      />
    );

  const body =
    view === "all-transactions" ? (
      <TransactionsListPage
        rows={transactions}
        search={search}
        statusFilter={statusFilter}
        selectedId={selectedId}
        onSelect={selectTransaction}
      />
    ) : view === "past-due" ? (
      <TransactionsListPage
        rows={transactions}
        search={search}
        statusFilter={[]}
        forcedStatus="past_due"
        selectedId={selectedId}
        onSelect={selectTransaction}
      />
    ) : (
      <PaymentsOverviewPage onSelectTransaction={selectTransaction} />
    );

  return (
    <div style={{ height: "100%" }}>
      <FoundationLayout
        navigation={navigation ?? <LinearSidebar />}
        contentMaxWidth={view === "overview" && selected == null ? 1200 : undefined}
        isSideContentVisible={selected != null}
        sideContent={
          selected ? (
            <TransactionSidePanel onClose={() => selectTransaction(null)}>
              <TransactionDetailPanel
                transaction={selected}
                onChange={(patch) => updateTransaction(selected.id, patch)}
              />
            </TransactionSidePanel>
          ) : null
        }
        header={
          <CanvasHeader
            topbar={{
              title: "Transactions",
              endContent:
                view === "all-transactions" ? (
                  <Button
                    label="New Invoice"
                    variant="secondary"
                    icon={<Plus size={14} strokeWidth={1.75} />}
                    onClick={() => setCreateOpen(true)}
                  />
                ) : null,
            }}
            controls={
              <ViewTabs aria-label="Transactions views" endContent={toolbar}>
                <ViewTab
                  label="Overview"
                  selected={view === "overview"}
                  onClick={() => changeView("overview")}
                />
                <ViewTab
                  label="All Transactions"
                  selected={view === "all-transactions"}
                  onClick={() => changeView("all-transactions")}
                />
                <ViewTab
                  label="Past Due"
                  selected={view === "past-due"}
                  onClick={() => changeView("past-due")}
                />
              </ViewTabs>
            }
          />
        }
      >
        {body}
      </FoundationLayout>
      <CreateTransactionModal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreate={(row) => {
          addTransaction(row);
          selectTransaction(row.id);
        }}
      />
    </div>
  );
}
