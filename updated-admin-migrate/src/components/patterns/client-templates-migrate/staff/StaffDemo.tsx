"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { useStripeInvoices } from "hooks";
import { FoundationLayout } from "@/components/patterns/foundation/FoundationLayout";
import { CanvasHeader } from "@/components/patterns/foundation/CanvasHeader";
import { LinearSidebar } from "@/components/patterns/foundation/LinearSidebar";
import { ViewTab } from "@/components/patterns/foundation/ViewTab";
import { ViewTabs } from "@/components/patterns/foundation/ViewTabs";
import { ListToolbar } from "@/components/patterns/foundation/ListToolbar";
import { Button } from "@/components/patterns/primitives/Button";
import { OutlinedPanel } from "@/components/patterns/client-templates/shared";
import type { StripeInvoiceTableRow } from "@/components/billing/InvoicesListTable";
import {
  InvoicingInvoicesPage,
  InvoiceDetailPanel,
  CreateInvoiceModal,
} from "@/components/patterns/client-templates-migrate/invoicing";

type StaffView = "all" | "trainers" | "admin";

const STATUS_OPTIONS = [
  { value: "paid", label: "Paid" },
  { value: "unpaid", label: "Unpaid" },
  { value: "past_due", label: "Past due" },
];

const CATEGORY_OPTIONS = [
  { value: "event", label: "Event" },
  { value: "leaflet", label: "Leaflet" },
];

/**
 * Copied as-is from Invoicing's Invoices tab — placeholder body for Staff
 * until it gets real staff data. All/Trainers/Admin tabs render the same
 * table for now; per-tab filtering comes later.
 */
export function StaffDemo() {
  const { refetch } = useStripeInvoices();
  const [view, setView] = useState<StaffView>("all");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string[]>([]);
  const [selected, setSelected] = useState<StripeInvoiceTableRow | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  return (
    <div style={{ height: "100%" }}>
      <FoundationLayout
        navigation={<LinearSidebar />}
        isSideContentVisible={selected != null}
        sideContent={
          selected ? (
            <OutlinedPanel onClose={() => setSelected(null)}>
              <InvoiceDetailPanel invoice={selected} />
            </OutlinedPanel>
          ) : null
        }
        header={
          <CanvasHeader
            topbar={{
              title: "Staff",
              endContent: (
                <Button
                  label="New Invoice"
                  variant="secondary"
                  icon={<Plus size={14} strokeWidth={1.75} />}
                  onClick={() => setIsCreateOpen(true)}
                />
              ),
            }}
            controls={
              <ViewTabs
                aria-label="Staff views"
                endContent={
                  <ListToolbar
                    searchValue={search}
                    onSearchChange={setSearch}
                    searchPlaceholder="Search invoices…"
                    filterGroups={[
                      {
                        label: "Status",
                        options: STATUS_OPTIONS,
                        selected: statusFilter,
                        onChange: setStatusFilter,
                      },
                      {
                        label: "Category",
                        options: CATEGORY_OPTIONS,
                        selected: categoryFilter,
                        onChange: setCategoryFilter,
                      },
                    ]}
                  />
                }
              >
                <ViewTab label="All" selected={view === "all"} onClick={() => setView("all")} />
                <ViewTab
                  label="Trainers"
                  selected={view === "trainers"}
                  onClick={() => setView("trainers")}
                />
                <ViewTab
                  label="Admin"
                  selected={view === "admin"}
                  onClick={() => setView("admin")}
                />
              </ViewTabs>
            }
          />
        }
      >
        <InvoicingInvoicesPage
          search={search}
          statusFilter={statusFilter}
          categoryFilter={categoryFilter}
          onSelectInvoice={setSelected}
        />
      </FoundationLayout>

      <CreateInvoiceModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreated={async () => {
          setIsCreateOpen(false);
          await refetch();
        }}
      />
    </div>
  );
}
