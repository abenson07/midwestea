"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { CreateClassModal } from "@/components/admin-migrate/patterns/catalog/CreateClassModal";
import { CreateTransactionModal } from "@/components/admin-migrate/patterns/payments/CreateTransactionModal";
import { AddLocationModal } from "@/components/admin-migrate/patterns/locations/AddLocationModal";
import { CommandPalette } from "./CommandPalette";

type CommandPaletteContextValue = {
  open: () => void;
  close: () => void;
  isOpen: boolean;
};

const CommandPaletteContext = createContext<CommandPaletteContextValue | null>(null);

export function CommandPaletteProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  // The three context-free creation modals live here, not in <CommandPalette>,
  // so they stay mounted (and open) after the palette overlay itself unmounts —
  // selecting "New Class" etc. closes the palette and opens the modal in the
  // same handler; if the modal's state lived inside <CommandPalette>, it would
  // unmount along with the palette before ever rendering.
  const [isCreateClassOpen, setIsCreateClassOpen] = useState(false);
  const [isCreateTransactionOpen, setIsCreateTransactionOpen] = useState(false);
  const [isAddLocationOpen, setIsAddLocationOpen] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setIsOpen((prev) => !prev);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <CommandPaletteContext.Provider value={{ open, close, isOpen }}>
      {children}
      {isOpen ? (
        <CommandPalette
          onClose={close}
          onNewClass={() => setIsCreateClassOpen(true)}
          onNewTransaction={() => setIsCreateTransactionOpen(true)}
          onAddLocation={() => setIsAddLocationOpen(true)}
        />
      ) : null}
      <CreateClassModal
        isOpen={isCreateClassOpen}
        onClose={() => setIsCreateClassOpen(false)}
        onCreated={() => {}}
      />
      <CreateTransactionModal
        isOpen={isCreateTransactionOpen}
        onClose={() => setIsCreateTransactionOpen(false)}
        onCreate={() => {}}
      />
      <AddLocationModal
        isOpen={isAddLocationOpen}
        onClose={() => setIsAddLocationOpen(false)}
        onCreate={() => {}}
      />
    </CommandPaletteContext.Provider>
  );
}

export function useCommandPalette(): CommandPaletteContextValue {
  const ctx = useContext(CommandPaletteContext);
  if (!ctx) throw new Error("useCommandPalette must be used within a CommandPaletteProvider");
  return ctx;
}

/**
 * Returns `undefined` when no `CommandPaletteProvider` is mounted —
 * deliberately, unlike `useDemoModeOptional`/`useWipFeaturesOptional`'s
 * safe-default-object convention. Callers such as the sidebar's Search
 * button use the `undefined` to stay a true no-op rather than silently
 * calling a stub `open`.
 */
export function useCommandPaletteOptional(): CommandPaletteContextValue | null {
  return useContext(CommandPaletteContext);
}
