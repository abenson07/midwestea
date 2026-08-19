"use client";

import type { CSSProperties, ReactNode } from "react";
import { Plus, X } from "lucide-react";
import { Card } from "@/components/admin-migrate/patterns/primitives/Card";
import { Text } from "@/components/admin-migrate/patterns/primitives/Text";
import { VStack } from "@/components/admin-migrate/patterns/primitives/Stack";
import { Button } from "@/components/admin-migrate/patterns/primitives/Button";
import { IconButton } from "@/components/admin-migrate/patterns/shared/IconButton";

export const settingsCardFieldStyle: CSSProperties = {
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

export type SettingsCardListProps<T extends { id: string }> = {
  label: string;
  addLabel: string;
  emptyLabel: string;
  items: T[];
  editingId: string | null;
  onEditingIdChange: (id: string | null) => void;
  onAdd: () => void;
  onRemove: (id: string) => void;
  getTitle: (item: T) => string;
  getSubtitle?: (item: T) => string;
  renderEditor: (item: T) => ReactNode;
};

export function SettingsCardList<T extends { id: string }>({
  label,
  addLabel,
  emptyLabel,
  items,
  editingId,
  onEditingIdChange,
  onAdd,
  onRemove,
  getTitle,
  getSubtitle,
  renderEditor,
}: SettingsCardListProps<T>) {
  return (
    <VStack gap={3}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Text type="label" color="secondary">
          {label}
        </Text>
        <IconButton
          label={addLabel}
          variant="ghost"
          size="sm"
          icon={<Plus size={14} strokeWidth={2} />}
          onClick={onAdd}
        />
      </div>
      {items.length === 0 ? (
        <Text size="sm" color="secondary">
          {emptyLabel}
        </Text>
      ) : (
        items.map((item) => {
          const editing = editingId === item.id;
          return (
            <Card key={item.id} padding={4}>
              {editing ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {renderEditor(item)}
                  <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                    <Button
                      label="Done"
                      size="sm"
                      variant="secondary"
                      onClick={() => onEditingIdChange(null)}
                    />
                    <IconButton
                      label="Remove"
                      variant="ghost"
                      size="sm"
                      icon={<X size={14} strokeWidth={1.75} />}
                      onClick={() => onRemove(item.id)}
                    />
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => onEditingIdChange(item.id)}
                  style={{
                    all: "unset",
                    boxSizing: "border-box",
                    display: "block",
                    width: "100%",
                    cursor: "pointer",
                  }}
                >
                  <Text weight="semibold" display="block">
                    {getTitle(item) || "Untitled"}
                  </Text>
                  {getSubtitle ? (
                    <Text size="sm" color="secondary" display="block" style={{ marginTop: 4 }}>
                      {getSubtitle(item) || "—"}
                    </Text>
                  ) : null}
                </button>
              )}
            </Card>
          );
        })
      )}
    </VStack>
  );
}
