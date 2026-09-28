"use client";

import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Search, X } from "lucide-react";
import { IconButton } from "@/components/admin-migrate/patterns/primitives/IconButton";
import { Text } from "@/components/admin-migrate/patterns/primitives/Text";
import { useAdminBasePath } from "@/components/admin-migrate/patterns/client-templates/shared";
import { useCommandPaletteData } from "./useCommandPaletteData";
import { searchAll, flattenSections } from "./paletteSearch";
import { CommandPaletteResultsList } from "./CommandPaletteResultsList";
import { CommandPaletteFooterHints } from "./CommandPaletteFooterHints";
import { loadRecents, pushRecent, toRecentEntry, type RecentPaletteEntry } from "./recentStorage";
import type { PaletteResult, PaletteSection } from "./types";

const LISTBOX_ID = "command-palette-listbox";

type Mode = "browse" | "add-student-picker";

export type CommandPaletteProps = {
  onClose: () => void;
  onNewClass: () => void;
  onNewTransaction: () => void;
  onAddLocation: () => void;
};

export function CommandPalette({ onClose, onNewClass, onNewTransaction, onAddLocation }: CommandPaletteProps) {
  const router = useRouter();
  const basePath = useAdminBasePath();
  const push = (href: string) => {
    router.push(href);
    onClose();
  };

  const data = useCommandPaletteData();
  const [mode, setMode] = useState<Mode>("browse");
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [recents, setRecents] = useState<RecentPaletteEntry[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setRecents(loadRecents());
  }, []);

  useEffect(() => {
    inputRef.current?.focus();
  }, [mode]);

  function rememberAndSelect(result: PaletteResult) {
    const entry = toRecentEntry(result);
    if (entry) setRecents(pushRecent(entry));
    result.onSelect();
  }

  function backToBrowse() {
    setMode("browse");
    setQuery("");
    setSelectedIndex(0);
  }

  const sections: PaletteSection[] = useMemo(() => {
    if (mode === "add-student-picker") {
      const q = query.trim().toLowerCase();
      const results: PaletteResult[] = data.classes
        .filter((cls) => {
          if (!q) return true;
          return (cls.name ?? "").toLowerCase().includes(q) || (cls.classCode ?? "").toLowerCase().includes(q);
        })
        .slice(0, 20)
        .map((cls) => {
          const href = `${basePath}/class/${cls.classCode ?? cls.id}?openAddStudent=1`;
          return {
            id: `pick-class:${cls.id}`,
            kind: "class" as const,
            title: cls.classCode ?? cls.name ?? "Class",
            subtitle: cls.classCode && cls.name ? cls.name : undefined,
            icon: "class" as const,
            score: 0,
            href,
            onSelect: () => {
              push(href);
              onClose();
            },
          };
        });
      return [{ heading: "Choose a class", results }];
    }

    return searchAll(query, {
      basePath,
      push,
      students: data.students,
      classes: data.classes,
      transactions: data.transactions,
      actionHandlers: {
        onNewClass: () => {
          onClose();
          onNewClass();
        },
        onNewTransaction: () => {
          onClose();
          onNewTransaction();
        },
        onAddLocation: () => {
          onClose();
          onAddLocation();
        },
        onAddStudent: () => {
          setMode("add-student-picker");
          setQuery("");
          setSelectedIndex(0);
        },
      },
      recents,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- push/onClose/onNew*/onAddLocation are stable per palette open
  }, [mode, query, data.classes, data.students, data.transactions, basePath, recents]);

  const flat = useMemo(() => flattenSections(sections), [sections]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query, mode]);

  function moveSelection(delta: number) {
    if (flat.length === 0) return;
    setSelectedIndex((prev) => (prev + delta + flat.length) % flat.length);
  }

  function activateSelected() {
    const result = flat[selectedIndex];
    if (result) rememberAndSelect(result);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      moveSelection(1);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      moveSelection(-1);
    } else if (event.key === "Enter") {
      event.preventDefault();
      activateSelected();
    } else if (event.key === "Escape") {
      event.preventDefault();
      if (mode === "add-student-picker") {
        backToBrowse();
      } else {
        onClose();
      }
    }
  }

  return (
    <div
      role="presentation"
      onMouseDown={(event) => {
        if (!panelRef.current?.contains(event.target as Node)) onClose();
      }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        display: "flex",
        justifyContent: "center",
        paddingTop: "12vh",
        background: "rgba(0, 0, 0, 0.5)",
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        style={{
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          width: 560,
          maxWidth: "calc(100vw - 32px)",
          height: "60vh",
          maxHeight: "60vh",
          overflow: "hidden",
          background: "var(--linear-color-canvas)",
          border: "var(--linear-border-width) solid var(--linear-color-hairline)",
          borderRadius: "var(--linear-radius-md)",
          boxShadow: "var(--linear-shadow-canvas)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            paddingInline: 16,
            paddingBlock: 12,
            borderBottom: "var(--linear-border-width) solid var(--linear-color-hairline)",
            flexShrink: 0,
          }}
        >
          {mode === "add-student-picker" ? (
            <IconButton
              label="Back"
              variant="ghost"
              icon={<ArrowLeft size={16} strokeWidth={1.75} />}
              onClick={backToBrowse}
            />
          ) : (
            <Search size={16} strokeWidth={1.75} color="var(--linear-color-ink-subtle)" />
          )}
          {mode === "add-student-picker" ? (
            <Text size="sm" color="secondary" style={{ flexShrink: 0 }}>
              Add Student →
            </Text>
          ) : null}
          <input
            ref={inputRef}
            role="combobox"
            aria-expanded="true"
            aria-controls={LISTBOX_ID}
            aria-activedescendant={flat[selectedIndex] ? `palette-option-${selectedIndex}` : undefined}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={mode === "add-student-picker" ? "Filter classes…" : "Search classes, students, invoices, pages…"}
            style={{
              flex: 1,
              minWidth: 0,
              border: "none",
              outline: "none",
              background: "transparent",
              fontSize: 14,
              fontFamily: "inherit",
              color: "var(--linear-color-ink)",
            }}
          />
          <IconButton label="Close" variant="ghost" icon={<X size={16} strokeWidth={1.75} />} onClick={onClose} />
        </div>

        <CommandPaletteResultsList
          sections={sections}
          selectedFlatIndex={selectedIndex}
          onHover={setSelectedIndex}
          onSelect={rememberAndSelect}
          listboxId={LISTBOX_ID}
          emptyLabel={mode === "add-student-picker" ? "No matching classes" : "No matches"}
        />

        <CommandPaletteFooterHints />
      </div>
    </div>
  );
}
