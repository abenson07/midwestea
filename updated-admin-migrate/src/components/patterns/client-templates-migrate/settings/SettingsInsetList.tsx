"use client";

import type { ReactNode } from "react";
import { Heading, Text } from "@/components/patterns/primitives/Text";
import { ListToolbar } from "@/components/patterns/foundation/ListToolbar";

export type SettingsInsetListProps = {
  title: string;
  description?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  action?: ReactNode;
  emptyLabel?: string;
  isEmpty?: boolean;
  children?: ReactNode;
};

/** Linear Members-style settings list: title, toolbar, inset table. */
export function SettingsInsetList({
  title,
  description,
  searchValue,
  onSearchChange,
  searchPlaceholder,
  action,
  emptyLabel,
  isEmpty = false,
  children,
}: SettingsInsetListProps) {
  return (
    <div
      style={{
        height: "100%",
        minHeight: 0,
        overflow: "auto",
        boxSizing: "border-box",
        padding: "32px 32px 48px",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div>
          <Heading level={1}>{title}</Heading>
          {description ? (
            <Text color="secondary" style={{ display: "block", marginTop: 4 }}>
              {description}
            </Text>
          ) : null}
        </div>
        {onSearchChange != null || action ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
              minHeight: 32,
            }}
          >
            {onSearchChange != null ? (
              <ListToolbar
                searchValue={searchValue ?? ""}
                onSearchChange={onSearchChange}
                searchPlaceholder={searchPlaceholder}
              />
            ) : (
              <span />
            )}
            {action}
          </div>
        ) : null}
        {isEmpty ? <Text color="secondary">{emptyLabel}</Text> : children}
      </div>
    </div>
  );
}
