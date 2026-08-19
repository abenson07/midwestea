"use client";

import type { ReactNode } from "react";
import {
  BookOpen,
  Clock,
  CreditCard,
  FolderPlus,
  GraduationCap,
  LayoutDashboard,
  LayoutGrid,
  ListChecks,
  MapPin,
  ReceiptText,
  Settings,
  UserPlus,
  UserRound,
  Wallet,
} from "lucide-react";
import { Text } from "@/components/admin-migrate/patterns/primitives/Text";
import type { PaletteIconKey, PaletteResult, PaletteSection } from "./types";
import { flattenSections } from "./paletteSearch";

const ICONS: Record<PaletteIconKey, ReactNode> = {
  overview: <LayoutDashboard size={16} strokeWidth={1.75} />,
  classes: <LayoutGrid size={16} strokeWidth={1.75} />,
  courses: <BookOpen size={16} strokeWidth={1.75} />,
  programs: <GraduationCap size={16} strokeWidth={1.75} />,
  students: <UserRound size={16} strokeWidth={1.75} />,
  transactions: <Wallet size={16} strokeWidth={1.75} />,
  locations: <MapPin size={16} strokeWidth={1.75} />,
  prerequisites: <ListChecks size={16} strokeWidth={1.75} />,
  settings: <Settings size={16} strokeWidth={1.75} />,
  "new-class": <FolderPlus size={16} strokeWidth={1.75} />,
  "new-transaction": <ReceiptText size={16} strokeWidth={1.75} />,
  "add-location": <MapPin size={16} strokeWidth={1.75} />,
  "add-student": <UserPlus size={16} strokeWidth={1.75} />,
  class: <LayoutGrid size={16} strokeWidth={1.75} />,
  student: <UserRound size={16} strokeWidth={1.75} />,
  transaction: <CreditCard size={16} strokeWidth={1.75} />,
  recent: <Clock size={16} strokeWidth={1.75} />,
};

type ResultRowProps = {
  result: PaletteResult;
  flatIndex: number;
  isSelected: boolean;
  onHover: (flatIndex: number) => void;
  onSelect: (result: PaletteResult) => void;
};

function ResultRow({ result, flatIndex, isSelected, onHover, onSelect }: ResultRowProps) {
  const hasSubtitle = Boolean(result.subtitle);
  return (
    <div
      id={`palette-option-${flatIndex}`}
      role="option"
      aria-selected={isSelected}
      onMouseEnter={() => onHover(flatIndex)}
      onMouseDown={(event) => {
        event.preventDefault();
        onSelect(result);
      }}
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 8,
        minHeight: hasSubtitle ? 48 : 32,
        paddingInline: 8,
        paddingBlock: hasSubtitle ? 6 : 0,
        borderRadius: 6,
        cursor: "pointer",
        background: isSelected ? "var(--linear-color-sidebar-item-selected)" : "transparent",
      }}
    >
      <span
        style={{
          display: "inline-flex",
          flexShrink: 0,
          marginTop: 2,
          color: "var(--linear-color-ink-subtle)",
        }}
      >
        {ICONS[result.icon]}
      </span>
      <div style={{ display: "flex", flexDirection: "column", minWidth: 0, flex: 1, gap: 1 }}>
        <Text
          size="sm"
          weight="medium"
          style={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {result.title}
        </Text>
        {hasSubtitle ? (
          <Text
            size="sm"
            color="secondary"
            style={{
              fontSize: 12,
              lineHeight: "16px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {result.subtitle}
          </Text>
        ) : null}
      </div>
    </div>
  );
}

export type CommandPaletteResultsListProps = {
  sections: PaletteSection[];
  selectedFlatIndex: number;
  onHover: (flatIndex: number) => void;
  onSelect: (result: PaletteResult) => void;
  listboxId: string;
  emptyLabel?: string;
};

export function CommandPaletteResultsList({
  sections,
  selectedFlatIndex,
  onHover,
  onSelect,
  listboxId,
  emptyLabel = "No matches",
}: CommandPaletteResultsListProps) {
  const flat = flattenSections(sections);

  if (flat.length === 0) {
    return (
      <div style={{ padding: "24px 16px", flex: "1 1 auto", minHeight: 0 }}>
        <Text size="sm" color="secondary">
          {emptyLabel}
        </Text>
      </div>
    );
  }

  let cursor = 0;

  return (
    <div
      id={listboxId}
      role="listbox"
      style={{
        overflowY: "auto",
        flex: "1 1 auto",
        minHeight: 0,
        padding: 6,
        display: "flex",
        flexDirection: "column",
        gap: 4,
      }}
    >
      {sections.map((section) => {
        if (section.results.length === 0) return null;
        const rows = section.results.map((result) => {
          const flatIndex = cursor;
          cursor += 1;
          return (
            <ResultRow
              key={result.id}
              result={result}
              flatIndex={flatIndex}
              isSelected={flatIndex === selectedFlatIndex}
              onHover={onHover}
              onSelect={onSelect}
            />
          );
        });
        return (
          <div key={section.heading} style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <div style={{ paddingInline: 10, paddingBottom: 2 }}>
              <Text size="sm" color="secondary" style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                {section.heading}
              </Text>
            </div>
            {rows}
          </div>
        );
      })}
    </div>
  );
}
