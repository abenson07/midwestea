"use client";

import { useState } from "react";
import { Inbox, MoreHorizontal } from "lucide-react";
import { FoundationLayout } from "@/components/patterns/foundation/FoundationLayout";
import { CanvasHeader } from "@/components/patterns/foundation/CanvasHeader";
import { LinearSidebar } from "@/components/patterns/foundation/LinearSidebar";
import { ViewTab } from "@/components/patterns/foundation/ViewTab";
import { ViewTabs } from "@/components/patterns/foundation/ViewTabs";
import {
  Dropdown,
  DropdownItem,
  DropdownSeparator,
} from "@/components/patterns/shared/dropdown";
import { IconButton } from "@/components/patterns/shared/IconButton";
import {
  ClassContentPage,
  EmptyStateCard,
  OutlinedPanel,
} from "@/components/patterns/client-templates/shared";
import { ClassDetailPage } from "./ClassDetailPage";
import { ClassInfoBox } from "./ClassInfoBox";
import { ClassStatusPill } from "./ClassStatusPill";
import { StudentsPage } from "./StudentsPage";
import { InvoicesPage } from "./InvoicesPage";
import { StudentDetailPanel } from "./StudentDetailPanel";
import { InvoiceDetailPanel } from "./InvoiceDetailPanel";
import {
  sampleClassSummary,
  type ClassInvoiceRow,
  type ClassStudentRow,
} from "@/data/mocks/class-detail";

type ClassDetailView = "overview" | "students" | "invoices" | "inbox";

type Selection =
  | { kind: "student"; row: ClassStudentRow }
  | { kind: "invoice"; row: ClassInvoiceRow }
  | null;

export function ClassDetailDemo() {
  const [view, setView] = useState<ClassDetailView>("overview");
  const [selection, setSelection] = useState<Selection>(null);
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  function changeView(next: ClassDetailView) {
    setView(next);
    setSelection(null);
  }

  const isFullBleed = view === "students" || view === "invoices";

  const body =
    view === "students" ? (
      <StudentsPage
        onSelectStudent={(row) => setSelection({ kind: "student", row })}
      />
    ) : view === "invoices" ? (
      <InvoicesPage
        onSelectInvoice={(row) => setSelection({ kind: "invoice", row })}
      />
    ) : view === "inbox" ? (
      <ClassContentPage>
        <ClassInfoBox summary={sampleClassSummary} />
        <EmptyStateCard
          label="No messages for this class yet"
          icon={<Inbox size={14} strokeWidth={1.75} />}
        />
      </ClassContentPage>
    ) : (
      <ClassDetailPage
        onSelectStudent={(row) => setSelection({ kind: "student", row })}
        onSelectInvoice={(row) => setSelection({ kind: "invoice", row })}
      />
    );

  return (
    <div style={{ height: "100%" }}>
      <FoundationLayout
        navigation={<LinearSidebar />}
        contentMaxWidth={isFullBleed ? undefined : 1200}
        isSideContentVisible={selection != null}
        sideContent={
          selection ? (
            <OutlinedPanel>
              {selection.kind === "student" ? (
                <StudentDetailPanel student={selection.row} />
              ) : (
                <InvoiceDetailPanel invoice={selection.row} />
              )}
            </OutlinedPanel>
          ) : null
        }
        header={
          <CanvasHeader
            topbar={{
              title: sampleClassSummary.name,
              titleAdornment: (
                <ClassStatusPill status={sampleClassSummary.status} />
              ),
              hasFavorite: true,
              hasMore: true,
              moreMenu: (
                <Dropdown
                  label="Class actions"
                  open={isMoreOpen}
                  onOpenChange={setIsMoreOpen}
                  placement="below"
                  alignment="end"
                  trigger={
                    <IconButton
                      label="More actions"
                      variant="ghost"
                      size="sm"
                      icon={<MoreHorizontal size={16} strokeWidth={1.75} />}
                      isActive={isMoreOpen}
                    />
                  }
                >
                  <DropdownItem
                    label="Edit class"
                    onSelect={() => setIsMoreOpen(false)}
                  />
                  <DropdownItem
                    label="Edit program"
                    onSelect={() => setIsMoreOpen(false)}
                  />
                  <DropdownSeparator />
                  <DropdownItem
                    label="Close enrollment"
                    onSelect={() => setIsMoreOpen(false)}
                  />
                  <DropdownItem
                    label="Close class"
                    onSelect={() => setIsMoreOpen(false)}
                  />
                </Dropdown>
              ),
            }}
            controls={
              <ViewTabs aria-label="Class views">
                <ViewTab
                  label="Overview"
                  selected={view === "overview"}
                  onClick={() => changeView("overview")}
                />
                <ViewTab
                  label="Students"
                  selected={view === "students"}
                  onClick={() => changeView("students")}
                />
                <ViewTab
                  label="Invoices"
                  selected={view === "invoices"}
                  onClick={() => changeView("invoices")}
                />
                <ViewTab
                  label="Inbox"
                  selected={view === "inbox"}
                  onClick={() => changeView("inbox")}
                />
              </ViewTabs>
            }
          />
        }
      >
        {body}
      </FoundationLayout>
    </div>
  );
}
