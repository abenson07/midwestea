"use client";

import { Icon } from "@astryxdesign/core/Icon";
import {
  SideNavItem,
  SideNavSection,
} from "@astryxdesign/core/SideNav";
import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Bell,
  FolderKanban,
  Inbox,
  LayoutDashboard,
  Map,
  RefreshCw,
  Search,
  Settings2,
} from "lucide-react";
import type { PatternNavItem, PatternNavSection } from "@/lib/patterns/types";

const navIconMap: Record<string, LucideIcon> = {
  overview: LayoutDashboard,
  inbox: Inbox,
  projects: FolderKanban,
  issues: Settings2,
  roadmap: Map,
  cycles: RefreshCw,
  analytics: BarChart3,
  reports: BarChart3,
  search: Search,
  notifications: Bell,
};

function resolveNavIcon(item: PatternNavItem): LucideIcon | undefined {
  return item.icon ?? navIconMap[item.id];
}

function renderNavItem(
  item: PatternNavItem,
  selectedNavId: string | undefined,
  onNavSelect?: (id: string) => void,
) {
  const IconComponent = resolveNavIcon(item);
  const icon = IconComponent ? <Icon icon={IconComponent} size="md" /> : undefined;

  return (
    <SideNavItem
      key={item.id}
      label={item.label}
      icon={icon}
      selectedIcon={icon}
      isSelected={selectedNavId === item.id}
      endContent={item.badge}
      onClick={
        onNavSelect
          ? (event) => {
              event.preventDefault();
              onNavSelect(item.id);
            }
          : undefined
      }
      collapsible={item.children && item.children.length > 0 ? true : undefined}
    >
      {item.children?.map((child) =>
        renderNavItem(child, selectedNavId, onNavSelect),
      )}
    </SideNavItem>
  );
}

export function renderNavSections(
  sections: PatternNavSection[],
  selectedNavId?: string,
  onNavSelect?: (id: string) => void,
) {
  return sections.map((section) => (
    <SideNavSection key={section.title} title={section.title}>
      {section.items.map((item) =>
        renderNavItem(item, selectedNavId, onNavSelect),
      )}
    </SideNavSection>
  ));
}
