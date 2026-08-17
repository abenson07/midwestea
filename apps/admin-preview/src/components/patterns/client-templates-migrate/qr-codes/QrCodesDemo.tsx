"use client";

import { useState } from "react";
import { Plus, QrCode as QrCodeIcon } from "lucide-react";
import { toast } from "sonner";
import { useQrCodes } from "hooks";
import { FoundationLayout } from "@/components/patterns/foundation/FoundationLayout";
import { CanvasHeader } from "@/components/patterns/foundation/CanvasHeader";
import { LinearSidebar } from "@/components/patterns/foundation/LinearSidebar";
import { Button } from "@/components/patterns/primitives/Button";
import { Text } from "@/components/patterns/primitives/Text";
import { pixel, proportional, type TableColumn } from "@/components/patterns/primitives/table";
import { GroupedTable } from "@/components/patterns/grouped-table/GroupedTable";
import { RowClickCell } from "@/components/patterns/client-templates/shared";
import { AddQrCodeModal } from "./AddQrCodeModal";
import { QrCodePreviewModal } from "./QrCodePreviewModal";
import type { QrCodes, QrCodesInsert } from "@/types/database";

// Plain object type (not the `QrCodes` interface) so it structurally satisfies
// GroupedTable's `T extends Record<string, unknown>` constraint.
type QrCodeRow = {
  id: string;
  name: string | null;
  url: string;
  created_at: string;
  updated_at: string;
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString();
}

function buildColumns(onSelect: (row: QrCodeRow) => void): TableColumn<QrCodeRow>[] {
  return [
    {
      key: "name",
      header: "Name",
      width: proportional(1, { minWidth: 200 }),
      renderCell: (row) => (
        <RowClickCell onClick={() => onSelect(row)}>
          <QrCodeIcon size={16} strokeWidth={1.75} style={{ marginInlineEnd: 8, flexShrink: 0 }} />
          <span style={{ color: "var(--linear-color-ink)" }}>{row.name || "Untitled"}</span>
        </RowClickCell>
      ),
    },
    {
      key: "url",
      header: "URL",
      width: proportional(1, { minWidth: 220 }),
      renderCell: (row) => (
        <RowClickCell onClick={() => onSelect(row)}>
          <span style={{ color: "var(--linear-color-ink-subtle)" }}>{row.url}</span>
        </RowClickCell>
      ),
    },
    {
      key: "createdAt",
      header: "Created",
      width: pixel(120),
      renderCell: (row) => (
        <RowClickCell onClick={() => onSelect(row)}>
          <span style={{ color: "var(--linear-color-ink-subtle)" }}>{formatDate(row.created_at)}</span>
        </RowClickCell>
      ),
    },
  ];
}

export function QrCodesDemo() {
  const { qrCodes, loading, error, create } = useQrCodes();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selected, setSelected] = useState<QrCodes | null>(null);

  const rows: QrCodeRow[] = qrCodes;
  const columns = buildColumns((row) => {
    const match = qrCodes.find((code) => code.id === row.id);
    if (match) setSelected(match);
  });

  async function handleCreate(data: QrCodesInsert) {
    const created = await create(data);
    if (created) {
      toast.success("QR code created");
    } else {
      toast.error("Failed to create QR code");
    }
  }

  return (
    <div style={{ height: "100%" }}>
      <FoundationLayout
        navigation={<LinearSidebar />}
        header={
          <CanvasHeader
            topbar={{
              title: "QR Codes",
              endContent: (
                <Button
                  label="New QR Code"
                  variant="secondary"
                  icon={<Plus size={14} strokeWidth={1.75} />}
                  onClick={() => setIsAddOpen(true)}
                />
              ),
            }}
          />
        }
      >
        {error ? (
          <div style={{ padding: 24 }}>
            <Text color="secondary">Couldn&apos;t load QR codes: {error}</Text>
          </div>
        ) : loading ? (
          <div style={{ padding: 24 }}>
            <Text color="secondary">Loading…</Text>
          </div>
        ) : qrCodes.length === 0 ? (
          <div style={{ padding: 24 }}>
            <Text color="secondary">No QR codes yet — create one to get started.</Text>
          </div>
        ) : (
          <div style={{ height: "100%", minHeight: 0, boxSizing: "border-box", padding: "16px 8px" }}>
            <GroupedTable data={rows} columns={columns} getRowKey={(row) => row.id} listChrome />
          </div>
        )}
      </FoundationLayout>

      <AddQrCodeModal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} onCreate={handleCreate} />
      <QrCodePreviewModal code={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
