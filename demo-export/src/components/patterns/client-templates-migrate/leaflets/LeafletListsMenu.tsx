"use client";

import { useState } from "react";
import { List as ListIcon } from "lucide-react";
import { IconButton } from "@/components/patterns/primitives/IconButton";
import { Icon } from "@/components/patterns/primitives/Icon";
import { Dropdown, DropdownItem } from "@/components/patterns/shared/dropdown";
import { LeafletListModal } from "./LeafletListModal";
import type { LeafletListView } from "@/data/mocks/leaflets";

const OPTIONS: { view: LeafletListView; label: string }[] = [
  { view: "members", label: "Business List" },
  { view: "events", label: "Upcoming Events" },
];

/**
 * Topbar "Lists for leaflet" control — a dropdown of the available text
 * lists; picking one opens `LeafletListModal` for it.
 */
export function LeafletListsMenu() {
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [selectedView, setSelectedView] = useState<LeafletListView | null>(null);

  function handleSelect(view: LeafletListView) {
    setMenuOpen(false);
    setSelectedView(view);
  }

  return (
    <>
      <Dropdown
        label="Lists for leaflet"
        open={isMenuOpen}
        onOpenChange={setMenuOpen}
        placement="below"
        alignment="end"
        trigger={
          <IconButton
            label="Lists for leaflet"
            variant="ghost"
            size="sm"
            icon={<Icon icon={ListIcon} size="sm" color="secondary" />}
          />
        }
      >
        {OPTIONS.map((option) => (
          <DropdownItem key={option.view} label={option.label} onSelect={() => handleSelect(option.view)} />
        ))}
      </Dropdown>

      <LeafletListModal view={selectedView} onClose={() => setSelectedView(null)} />
    </>
  );
}
