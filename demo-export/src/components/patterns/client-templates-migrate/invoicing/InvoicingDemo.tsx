"use client";

import { Suspense, useState, type ReactNode } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import {
  useAllSponsorships,
  useDemoGuard,
  useStripeInvoices,
  type SponsorshipWithParent,
} from "hooks";
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
  MobileAdminShell,
  MobileInvoicesPage,
  useIsMobileAdmin,
} from "@/components/patterns/client-templates-migrate/mobile";
import { InvoicingOverviewPage } from "./InvoicingOverviewPage";
import { InvoicingInvoicesPage } from "./InvoicingInvoicesPage";
import { InvoicingSponsorshipsPage } from "./InvoicingSponsorshipsPage";
import { InvoiceDetailPanel } from "./InvoiceDetailPanel";
import { SponsorshipDetailPanel } from "./SponsorshipDetailPanel";
import { CreateInvoiceModal } from "./CreateInvoiceModal";
import { CreateSponsorshipModal } from "./CreateSponsorshipModal";

type InvoicingView = "overview" | "invoices" | "sponsorships";

type Selection =
  | { kind: "invoice"; row: StripeInvoiceTableRow }
  | { kind: "sponsorship"; row: SponsorshipWithParent }
  | null;

const INVOICE_STATUS_OPTIONS = [
  { value: "paid", label: "Paid" },
  { value: "unpaid", label: "Unpaid" },
  { value: "past_due", label: "Past due" },
];

const CATEGORY_OPTIONS = [
  { value: "event", label: "Event" },
  { value: "leaflet", label: "Leaflet" },
];

const SPONSORSHIP_STATUS_OPTIONS = [
  { value: "pledged", label: "Pledged" },
  { value: "invoiced", label: "Invoiced" },
  { value: "paid", label: "Paid" },
];

export type InvoicingDemoProps = {
  navigation?: ReactNode;
};

export function InvoicingDemo({ navigation }: InvoicingDemoProps = {}) {
  const isMobile = useIsMobileAdmin();
  const { enabled: demo } = useDemoGuard();
  const { refetch: refetchInvoices } = useStripeInvoices();
  const { createSponsorship, refetch: refetchSponsorships } = useAllSponsorships();
  const [view, setView] = useState<InvoicingView>("overview");
  const [selection, setSelection] = useState<Selection>(null);
  const [invoiceSearch, setInvoiceSearch] = useState("");
  const [invoiceStatusFilter, setInvoiceStatusFilter] = useState<string[]>([]);
  const [invoiceCategoryFilter, setInvoiceCategoryFilter] = useState<string[]>([]);
  const [sponsorshipSearch, setSponsorshipSearch] = useState("");
  const [sponsorshipStatusFilter, setSponsorshipStatusFilter] = useState<string[]>([]);
  const [sponsorshipParentFilter, setSponsorshipParentFilter] = useState<string[]>([]);
  const [isCreateInvoiceOpen, setIsCreateInvoiceOpen] = useState(false);
  const [isCreateSponsorshipOpen, setIsCreateSponsorshipOpen] = useState(false);

  if (isMobile) {
    return (
      <MobileAdminShell active="invoices">
        <Suspense fallback={null}>
          <MobileInvoicesPage />
        </Suspense>
      </MobileAdminShell>
    );
  }

  function changeView(next: InvoicingView) {
    setView(next);
    setSelection(null);
  }

  async function guardedCreateSponsorship(...args: Parameters<typeof createSponsorship>) {
    if (demo) {
      const { newDemoId, upsertDemoEntity } = await import("@/lib/demo/demoStore");
      const [payload] = args;
      upsertDemoEntity("sponsorships", {
        id: newDemoId("spon"),
        ...(payload as Record<string, unknown>),
      });
      toast.success("Sponsorship created — demo mode, saved locally only");
      return null;
    }
    return createSponsorship(...args);
  }

  const topbarAction =
    view === "invoices" ? (
      <Button
        label="New Invoice"
        variant="secondary"
        icon={<Plus size={14} strokeWidth={1.75} />}
        onClick={() => setIsCreateInvoiceOpen(true)}
      />
    ) : view === "sponsorships" ? (
      <Button
        label="New Sponsorship"
        variant="secondary"
        icon={<Plus size={14} strokeWidth={1.75} />}
        onClick={() => setIsCreateSponsorshipOpen(true)}
      />
    ) : null;

  const toolbar =
    view === "invoices" ? (
      <ListToolbar
        searchValue={invoiceSearch}
        onSearchChange={setInvoiceSearch}
        searchPlaceholder="Search invoices…"
        filterGroups={[
          {
            label: "Status",
            options: INVOICE_STATUS_OPTIONS,
            selected: invoiceStatusFilter,
            onChange: setInvoiceStatusFilter,
          },
          {
            label: "Category",
            options: CATEGORY_OPTIONS,
            selected: invoiceCategoryFilter,
            onChange: setInvoiceCategoryFilter,
          },
        ]}
      />
    ) : view === "sponsorships" ? (
      <ListToolbar
        searchValue={sponsorshipSearch}
        onSearchChange={setSponsorshipSearch}
        searchPlaceholder="Search sponsorships…"
        filterGroups={[
          {
            label: "Status",
            options: SPONSORSHIP_STATUS_OPTIONS,
            selected: sponsorshipStatusFilter,
            onChange: setSponsorshipStatusFilter,
          },
          {
            label: "Parent type",
            options: CATEGORY_OPTIONS,
            selected: sponsorshipParentFilter,
            onChange: setSponsorshipParentFilter,
          },
        ]}
      />
    ) : null;

  const body =
    view === "invoices" ? (
      <InvoicingInvoicesPage
        search={invoiceSearch}
        statusFilter={invoiceStatusFilter}
        categoryFilter={invoiceCategoryFilter}
        onSelectInvoice={(row) => setSelection({ kind: "invoice", row })}
      />
    ) : view === "sponsorships" ? (
      <InvoicingSponsorshipsPage
        search={sponsorshipSearch}
        statusFilter={sponsorshipStatusFilter}
        parentTypeFilter={sponsorshipParentFilter}
        onSelectSponsorship={(row) => setSelection({ kind: "sponsorship", row })}
      />
    ) : (
      <InvoicingOverviewPage onSelectInvoice={(row) => setSelection({ kind: "invoice", row })} />
    );

  return (
    <div style={{ height: "100%" }}>
      <FoundationLayout
        navigation={navigation ?? <LinearSidebar />}
        contentMaxWidth={view === "overview" ? 1200 : undefined}
        isSideContentVisible={selection != null}
        sideContent={
          selection ? (
            <OutlinedPanel onClose={() => setSelection(null)}>
              {selection.kind === "invoice" ? (
                <InvoiceDetailPanel invoice={selection.row} />
              ) : (
                <SponsorshipDetailPanel sponsorship={selection.row} />
              )}
            </OutlinedPanel>
          ) : null
        }
        header={
          <CanvasHeader
            topbar={{
              title: "Invoicing",
              endContent: topbarAction,
            }}
            controls={
              <ViewTabs aria-label="Invoicing views" endContent={toolbar}>
                <ViewTab
                  label="Overview"
                  selected={view === "overview"}
                  onClick={() => changeView("overview")}
                />
                <ViewTab
                  label="Invoices"
                  selected={view === "invoices"}
                  onClick={() => changeView("invoices")}
                />
                <ViewTab
                  label="Sponsorships"
                  selected={view === "sponsorships"}
                  onClick={() => changeView("sponsorships")}
                />
              </ViewTabs>
            }
          />
        }
      >
        {body}
      </FoundationLayout>

      <CreateInvoiceModal
        isOpen={isCreateInvoiceOpen}
        onClose={() => setIsCreateInvoiceOpen(false)}
        onCreated={async () => {
          setIsCreateInvoiceOpen(false);
          await refetchInvoices();
        }}
      />
      <CreateSponsorshipModal
        isOpen={isCreateSponsorshipOpen}
        onClose={() => setIsCreateSponsorshipOpen(false)}
        onCreated={async () => {
          setIsCreateSponsorshipOpen(false);
          await refetchSponsorships();
        }}
        createSponsorship={guardedCreateSponsorship}
      />
    </div>
  );
}
