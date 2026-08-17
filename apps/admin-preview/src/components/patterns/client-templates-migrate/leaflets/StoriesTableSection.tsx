"use client";

import { useMemo } from "react";
import { pixel, proportional, type TableColumn } from "@/components/patterns/primitives/table";
import { NestedGroupedTable } from "@/components/patterns/grouped-table/NestedGroupedTable";
import { RowClickCell } from "@/components/patterns/client-templates/shared";
import { Badge } from "@/components/patterns/primitives/Badge";
import { Text } from "@/components/patterns/primitives/Text";
import { sampleLeafletStories, type LeafletStoryRow } from "@/data/mocks/leaflets";

export type StoriesTableSectionProps = {
  stories?: LeafletStoryRow[];
  onSelectStory?: (row: LeafletStoryRow) => void;
};

function buildColumns(onSelectStory?: (row: LeafletStoryRow) => void): TableColumn<LeafletStoryRow>[] {
  return [
    {
      key: "date",
      header: "Date",
      width: pixel(120),
      renderCell: (row) => (
        <RowClickCell onClick={() => onSelectStory?.(row)}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <Text size="sm">{row.date}</Text>
            <Text size="sm" color="secondary">
              {row.time}
            </Text>
          </div>
        </RowClickCell>
      ),
    },
    {
      key: "type",
      header: "Type",
      width: pixel(120),
      renderCell: (row) => (
        <RowClickCell onClick={() => onSelectStory?.(row)}>
          <Badge label={row.type} />
        </RowClickCell>
      ),
    },
    {
      key: "title",
      header: "Title",
      width: proportional(1, { minWidth: 200 }),
      renderCell: (row) => (
        <RowClickCell onClick={() => onSelectStory?.(row)}>
          <span style={{ color: "var(--linear-color-ink)" }}>{row.title}</span>
        </RowClickCell>
      ),
    },
    {
      key: "author",
      header: "Author",
      width: pixel(140),
      renderCell: (row) => (
        <RowClickCell onClick={() => onSelectStory?.(row)}>
          <span style={{ color: "var(--linear-color-ink-subtle)" }}>{row.author}</span>
        </RowClickCell>
      ),
    },
    {
      key: "status",
      header: "Status",
      width: pixel(120),
      renderCell: (row) => (
        <RowClickCell onClick={() => onSelectStory?.(row)}>
          <span style={{ color: "var(--linear-color-ink-subtle)" }}>{row.status}</span>
        </RowClickCell>
      ),
    },
  ];
}

/**
 * Full-width Stories table for the bottom of the Overview page — a real,
 * flat inline table (no grouping), same nested-table chrome as the
 * Sponsorships tab's invoices table.
 */
export function StoriesTableSection({ stories: storiesProp, onSelectStory }: StoriesTableSectionProps) {
  const columns = useMemo(() => buildColumns(onSelectStory), [onSelectStory]);
  const stories = storiesProp ?? sampleLeafletStories;

  return (
    <NestedGroupedTable
      title="Stories"
      data={stories}
      columns={columns}
      getRowKey={(row) => row.id}
    />
  );
}
