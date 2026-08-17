"use client";

import { useState, type CSSProperties } from "react";
import { ClipboardCheck, Plus, X } from "lucide-react";
import { FoundationLayout } from "@/components/patterns/foundation/FoundationLayout";
import { CanvasHeader } from "@/components/patterns/foundation/CanvasHeader";
import { LinearSidebar } from "@/components/patterns/foundation/LinearSidebar";
import { Card } from "@/components/patterns/primitives/Card";
import { Text } from "@/components/patterns/primitives/Text";
import { VStack } from "@/components/patterns/primitives/Stack";
import { Button } from "@/components/patterns/primitives/Button";
import { IconButton } from "@/components/patterns/shared/IconButton";

type FileType = "pdf" | "image" | "document" | "any";

type PrerequisiteRow = {
  id: string;
  name: string;
  description: string;
  fileType: FileType;
};

const FILE_TYPE_OPTIONS: { value: FileType; label: string }[] = [
  { value: "pdf", label: "PDF" },
  { value: "image", label: "Image" },
  { value: "document", label: "Document" },
  { value: "any", label: "Any file" },
];

const FILE_TYPE_LABEL: Record<FileType, string> = Object.fromEntries(
  FILE_TYPE_OPTIONS.map((o) => [o.value, o.label]),
) as Record<FileType, string>;

const INITIAL_ROWS: PrerequisiteRow[] = [
  {
    id: "cpr-bls",
    name: "CPR / BLS Certification",
    description: "Current Basic Life Support card required before class start.",
    fileType: "pdf",
  },
  {
    id: "diploma",
    name: "High School Diploma or GED",
    description: "Proof of completion required at enrollment.",
    fileType: "document",
  },
  {
    id: "background-check",
    name: "Background Check Clearance",
    description: "State and federal background check, cleared within the last year.",
    fileType: "pdf",
  },
  {
    id: "immunizations",
    name: "Immunization Records",
    description: "Up-to-date immunization records, including Hepatitis B and TB screening.",
    fileType: "image",
  },
];

const fieldStyle: CSSProperties = {
  boxSizing: "border-box",
  width: "100%",
  padding: "6px 8px",
  borderRadius: 6,
  border: "var(--linear-border-width) solid var(--linear-color-hairline)",
  background: "var(--linear-color-canvas)",
  color: "var(--linear-color-ink)",
  fontSize: 13,
  fontFamily: "inherit",
};

const selectStyle: CSSProperties = {
  ...fieldStyle,
  width: 140,
  textAlign: "left",
};

/**
 * Copied structurally from Committee Settings' "Volunteer asks" card group —
 * placeholder rows (name / description / file type) until Prerequisites gets
 * a real catalog behind it.
 */
export function PrerequisitesDemo() {
  const [rows, setRows] = useState<PrerequisiteRow[]>(INITIAL_ROWS);
  const [editingId, setEditingId] = useState<string | null>(null);

  function patchRow(id: string, patch: Partial<PrerequisiteRow>) {
    setRows((prev) => prev.map((row) => (row.id === id ? { ...row, ...patch } : row)));
  }

  function addRow() {
    const row: PrerequisiteRow = {
      id: `prereq-${Date.now()}`,
      name: "New prerequisite",
      description: "",
      fileType: "any",
    };
    setRows((prev) => [...prev, row]);
    setEditingId(row.id);
  }

  function removeRow(id: string) {
    setRows((prev) => prev.filter((row) => row.id !== id));
    setEditingId((current) => (current === id ? null : current));
  }

  return (
    <div style={{ height: "100%" }}>
      <FoundationLayout
        navigation={<LinearSidebar />}
        header={
          <CanvasHeader
            topbar={{ title: "Prerequisites", icon: <ClipboardCheck size={16} strokeWidth={1.75} /> }}
          />
        }
      >
        <div style={{ maxWidth: 760, marginInline: "auto", padding: "48px 24px 64px" }}>
          <VStack gap={3}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Text type="label" color="secondary">
                Prerequisites
              </Text>
              <IconButton
                label="Add prerequisite"
                variant="ghost"
                size="sm"
                icon={<Plus size={14} strokeWidth={2} />}
                onClick={addRow}
              />
            </div>

            {rows.length === 0 ? (
              <Text size="sm" color="secondary">
                No prerequisites yet.
              </Text>
            ) : (
              rows.map((row) => {
                const editing = editingId === row.id;
                return (
                  <Card key={row.id} padding={4}>
                    {editing ? (
                      <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
                          <input
                            style={{ ...fieldStyle, fontWeight: 510 }}
                            value={row.name}
                            onChange={(e) => patchRow(row.id, { name: e.target.value })}
                            placeholder="Name"
                          />
                          <textarea
                            style={{ ...fieldStyle, resize: "vertical", minHeight: 56 }}
                            value={row.description}
                            onChange={(e) => patchRow(row.id, { description: e.target.value })}
                            placeholder="Description"
                            rows={2}
                          />
                        </div>
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 8,
                            alignItems: "flex-end",
                          }}
                        >
                          <label
                            style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-end" }}
                          >
                            <Text size="sm" color="secondary">
                              File type
                            </Text>
                            <select
                              style={selectStyle}
                              value={row.fileType}
                              onChange={(e) => patchRow(row.id, { fileType: e.target.value as FileType })}
                            >
                              {FILE_TYPE_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          </label>
                          <div style={{ display: "flex", gap: 6 }}>
                            <Button
                              label="Done"
                              size="sm"
                              variant="secondary"
                              onClick={() => setEditingId(null)}
                            />
                            <IconButton
                              label="Remove prerequisite"
                              variant="ghost"
                              size="sm"
                              icon={<X size={14} strokeWidth={1.75} />}
                              onClick={() => removeRow(row.id)}
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setEditingId(row.id)}
                        style={{
                          all: "unset",
                          boxSizing: "border-box",
                          display: "flex",
                          gap: 16,
                          width: "100%",
                          cursor: "pointer",
                          alignItems: "flex-start",
                        }}
                      >
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <Text weight="semibold" display="block">
                            {row.name || "Untitled prerequisite"}
                          </Text>
                          <Text size="sm" color="secondary" display="block" style={{ marginTop: 4 }}>
                            {row.description || "No description"}
                          </Text>
                        </div>
                        <Text weight="medium" style={{ flexShrink: 0 }}>
                          {FILE_TYPE_LABEL[row.fileType]}
                        </Text>
                      </button>
                    )}
                  </Card>
                );
              })
            )}
          </VStack>
        </div>
      </FoundationLayout>
    </div>
  );
}
