"use client";

import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Text } from "@/components/admin-migrate/patterns/primitives/Text";
import { GroupedTable } from "@/components/admin-migrate/patterns/grouped-table/GroupedTable";
import { EmptyStateCard, useAdminBasePath, useIsNewAdminMigrate } from "@/components/admin-migrate/patterns/client-templates/shared";
import {
  buildClassTableColumns,
  closedClassDateLabel,
  openClassDateLabel,
  startOfToday,
} from "../classes/classTableColumns";
import type { ClassDetail } from "../classes/classMocks";
import { classDetailHref, classHasDetailRoute, splitClassesByStatus } from "./catalogMocks";

export type CatalogClassesSectionProps = {
  classes: ClassDetail[];
  onCreateClass?: () => void;
  enrolledCounts?: Map<string, number>;
};

const sectionStyle = {
  boxSizing: "border-box" as const,
  display: "flex" as const,
  flexDirection: "column" as const,
  gap: 8,
};

function ClassTable({
  title,
  emptyLabel,
  rows,
  dateLabel,
  onSelect,
  emptyAction,
  enrolledCounts,
}: {
  title: string;
  emptyLabel: string;
  rows: ClassDetail[];
  dateLabel: (row: ClassDetail) => string;
  onSelect: (row: ClassDetail) => void;
  emptyAction?: () => void;
  enrolledCounts?: Map<string, number>;
}) {
  const columns = buildClassTableColumns({ dateLabel, onSelect, enrolledCounts });

  return (
    <section style={sectionStyle}>
      <Text weight="semibold">{title}</Text>
      {rows.length ? (
        <GroupedTable
          data={rows}
          columns={columns}
          getRowKey={(row) => row.id}
          appearance="nested"
          listChrome={false}
        />
      ) : emptyAction ? (
        <EmptyStateCard
          variant="pill"
          label={emptyLabel}
          icon={<Plus size={14} strokeWidth={1.75} />}
          onClick={emptyAction}
          minHeight={72}
        />
      ) : (
        <Text size="sm" color="secondary">
          {emptyLabel}
        </Text>
      )}
    </section>
  );
}

/** Two stacked class tables — open vs past — no card chrome, extra space between. */
export function CatalogClassesSection({
  classes,
  onCreateClass,
  enrolledCounts,
}: CatalogClassesSectionProps) {
  const router = useRouter();
  const basePath = useAdminBasePath();
  const live = useIsNewAdminMigrate();
  const { open, past } = splitClassesByStatus(classes);
  const today = startOfToday();

  function selectClass(row: ClassDetail) {
    if (live || classHasDetailRoute(row.id)) {
      router.push(`${basePath}${classDetailHref(row.id)}`);
      return;
    }
    toast.info("Demo mode — no detail page for classes created here");
  }

  return (
    <div
      data-slot="catalog-classes-section"
      style={{ display: "flex", flexDirection: "column", gap: 48 }}
    >
      <ClassTable
        title="Open classes"
        emptyLabel="Create a class"
        rows={open}
        dateLabel={(row) => openClassDateLabel(row, today)}
        onSelect={selectClass}
        emptyAction={onCreateClass}
        enrolledCounts={enrolledCounts}
      />
      <ClassTable
        title="Past classes"
        emptyLabel="No past classes."
        rows={past}
        dateLabel={closedClassDateLabel}
        onSelect={selectClass}
        enrolledCounts={enrolledCounts}
      />
    </div>
  );
}
