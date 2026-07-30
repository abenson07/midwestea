"use client";

import { ArrowLeft, Search } from "lucide-react";
import {
  MenuItem,
  SidebarHeader,
  SidebarScrollArea,
  SidebarSection,
} from "@/components/patterns/foundation/sidebar";
import "@/components/patterns/foundation/sidebar/sidebar.css";
import { settingsNavSections } from "@/data/mocks/settings-nav";

export type SettingsSideNavProps = {
  selectedNavId: string;
  onNavSelect: (id: string) => void;
  onBack?: () => void;
};

/**
 * Settings sidebar — same Foundation sidebar primitives as `LinearSidebar`
 * (MenuItem/SidebarSection), so it matches pixel-for-pixel instead of
 * drifting the way Astryx's default-styled `SideNav` did.
 */
export function SettingsSideNav({
  selectedNavId,
  onNavSelect,
  onBack,
}: SettingsSideNavProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        minHeight: 0,
        padding: "8px 8px 10px",
        boxSizing: "border-box",
        gap: 8,
      }}
    >
      <SidebarHeader>
        <MenuItem
          label="Back to app"
          icon={<ArrowLeft size={16} strokeWidth={1.75} />}
          onClick={onBack}
        />
      </SidebarHeader>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          height: 32,
          paddingInline: 8,
          borderRadius: "var(--linear-radius-md)",
          border: "var(--linear-border-width) solid var(--linear-color-hairline)",
          color: "var(--linear-color-ink-subtle)",
          flexShrink: 0,
        }}
      >
        <Search size={14} strokeWidth={1.75} />
        <span style={{ fontSize: 13 }}>Search…</span>
      </div>

      <SidebarScrollArea>
        {settingsNavSections.map((section) => (
          <SidebarSection key={section.title} title={section.title}>
            {section.items.map((item) => {
              const ItemIcon = item.icon;
              return (
                <MenuItem
                  key={item.id}
                  label={item.label}
                  icon={
                    ItemIcon ? (
                      <ItemIcon size={16} strokeWidth={1.75} />
                    ) : (
                      <span />
                    )
                  }
                  selected={selectedNavId === item.id}
                  onClick={() => onNavSelect(item.id)}
                />
              );
            })}
          </SidebarSection>
        ))}
      </SidebarScrollArea>
    </div>
  );
}
