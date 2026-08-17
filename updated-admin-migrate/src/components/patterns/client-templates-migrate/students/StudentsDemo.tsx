"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { useAllSponsorships, useDemoGuard, type SponsorshipWithParent } from "hooks";
import { FoundationLayout } from "@/components/patterns/foundation/FoundationLayout";
import { CanvasHeader } from "@/components/patterns/foundation/CanvasHeader";
import { LinearSidebar } from "@/components/patterns/foundation/LinearSidebar";
import { ViewTab } from "@/components/patterns/foundation/ViewTab";
import { ViewTabs } from "@/components/patterns/foundation/ViewTabs";
import { ListToolbar } from "@/components/patterns/foundation/ListToolbar";
import { Button } from "@/components/patterns/primitives/Button";
import { OutlinedPanel } from "@/components/patterns/client-templates/shared";
import {
  InvoicingSponsorshipsPage,
  SponsorshipDetailPanel,
  CreateSponsorshipModal,
} from "@/components/patterns/client-templates-migrate/invoicing";

type StudentsView = "all" | "current" | "past-due";

const STATUS_OPTIONS = [
  { value: "pledged", label: "Pledged" },
  { value: "invoiced", label: "Invoiced" },
  { value: "paid", label: "Paid" },
];

const PARENT_TYPE_OPTIONS = [
  { value: "event", label: "Event" },
  { value: "leaflet", label: "Leaflet" },
];

/**
 * Copied as-is from Invoicing's Sponsorships tab — placeholder body for Students
 * until it gets real student data. All/Current/Past Due tabs render the same
 * table for now; per-tab filtering comes later.
 */
export function StudentsDemo() {
  const { enabled: demo } = useDemoGuard();
  const { createSponsorship, refetch } = useAllSponsorships();
  const [view, setView] = useState<StudentsView>("all");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [parentTypeFilter, setParentTypeFilter] = useState<string[]>([]);
  const [selected, setSelected] = useState<SponsorshipWithParent | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

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

  return (
    <div style={{ height: "100%" }}>
      <FoundationLayout
        navigation={<LinearSidebar />}
        isSideContentVisible={selected != null}
        sideContent={
          selected ? (
            <OutlinedPanel onClose={() => setSelected(null)}>
              <SponsorshipDetailPanel sponsorship={selected} />
            </OutlinedPanel>
          ) : null
        }
        header={
          <CanvasHeader
            topbar={{
              title: "Students",
              endContent: (
                <Button
                  label="New Sponsorship"
                  variant="secondary"
                  icon={<Plus size={14} strokeWidth={1.75} />}
                  onClick={() => setIsCreateOpen(true)}
                />
              ),
            }}
            controls={
              <ViewTabs
                aria-label="Students views"
                endContent={
                  <ListToolbar
                    searchValue={search}
                    onSearchChange={setSearch}
                    searchPlaceholder="Search sponsorships…"
                    filterGroups={[
                      {
                        label: "Status",
                        options: STATUS_OPTIONS,
                        selected: statusFilter,
                        onChange: setStatusFilter,
                      },
                      {
                        label: "Parent type",
                        options: PARENT_TYPE_OPTIONS,
                        selected: parentTypeFilter,
                        onChange: setParentTypeFilter,
                      },
                    ]}
                  />
                }
              >
                <ViewTab label="All" selected={view === "all"} onClick={() => setView("all")} />
                <ViewTab
                  label="Current"
                  selected={view === "current"}
                  onClick={() => setView("current")}
                />
                <ViewTab
                  label="Past Due"
                  selected={view === "past-due"}
                  onClick={() => setView("past-due")}
                />
              </ViewTabs>
            }
          />
        }
      >
        <InvoicingSponsorshipsPage
          search={search}
          statusFilter={statusFilter}
          parentTypeFilter={parentTypeFilter}
          onSelectSponsorship={setSelected}
        />
      </FoundationLayout>

      <CreateSponsorshipModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreated={async () => {
          setIsCreateOpen(false);
          await refetch();
        }}
        createSponsorship={guardedCreateSponsorship}
      />
    </div>
  );
}
