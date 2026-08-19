"use client";

import { ArrowLeft, BookOpen, GraduationCap, Search } from "lucide-react";
import {
  MenuItem,
  SidebarHeader,
  SidebarScrollArea,
  SidebarSection,
} from "@/components/admin-migrate/patterns/foundation/sidebar";
import "@/components/admin-migrate/patterns/foundation/sidebar/sidebar.css";
import { useIsNewAdminMigrate } from "@/components/admin-migrate/patterns/client-templates/shared";
import { settingsNavSections, settingsTechnicalNavSection } from "@/data/mocks/settings-nav";
import {
  catalogTemplatesOfKind,
  type CatalogTemplate,
} from "@/components/admin-migrate/patterns/catalog/catalogMocks";

export type SettingsSideNavProps = {
  selectedNavId: string;
  onNavSelect: (id: string) => void;
  onBack?: () => void;
  templates?: CatalogTemplate[];
};

/**
 * Settings sidebar — same Foundation sidebar primitives as `LinearSidebar`.
 */
export function SettingsSideNav({
  selectedNavId,
  onNavSelect,
  onBack,
  templates,
}: SettingsSideNavProps) {
  const live = useIsNewAdminMigrate();
  const programs = templates
    ? templates.filter((template) => template.kind === "Program")
    : live
      ? []
      : catalogTemplatesOfKind("Program");
  const courses = templates
    ? templates.filter((template) => template.kind === "Course")
    : live
      ? []
      : catalogTemplatesOfKind("Course");

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

        <SidebarSection title="Program Templates">
          {programs.map((template) => (
            <MenuItem
              key={template.id}
              label={template.name}
              icon={<GraduationCap size={16} strokeWidth={1.75} />}
              selected={selectedNavId === `programs/${template.id}`}
              onClick={() => onNavSelect(`programs/${template.id}`)}
            />
          ))}
        </SidebarSection>

        <SidebarSection title="Course Templates">
          {courses.map((template) => (
            <MenuItem
              key={template.id}
              label={template.name}
              icon={<BookOpen size={16} strokeWidth={1.75} />}
              selected={selectedNavId === `courses/${template.id}`}
              onClick={() => onNavSelect(`courses/${template.id}`)}
            />
          ))}
        </SidebarSection>

        <SidebarSection title={settingsTechnicalNavSection.title}>
          {settingsTechnicalNavSection.items.map((item) => {
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
      </SidebarScrollArea>
    </div>
  );
}
