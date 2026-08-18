"use client";

import type { ReactNode } from "react";
import { Pencil } from "lucide-react";
import { Text } from "@/components/patterns/primitives/Text";
import { IconButton } from "@/components/patterns/shared/IconButton";
import { ClassSidebarSection } from "../classes/ClassSidebarSection";
import type { CatalogTemplate } from "./catalogMocks";

export type CatalogDetailsCardProps = {
  template: CatalogTemplate;
  onEditDetails?: () => void;
};

function PropertyRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        minHeight: 28,
      }}
    >
      <Text size="sm" color="secondary" style={{ width: 148, flexShrink: 0 }}>
        {label}
      </Text>
      <div
        style={{
          minWidth: 0,
          overflow: "hidden",
          textOverflow: "ellipsis",
          fontSize: 13,
          lineHeight: "20px",
          color: "var(--linear-color-ink)",
        }}
      >
        {children}
      </div>
    </div>
  );
}

/** Template details card — field on the left, value on the right. */
export function CatalogDetailsCard({ template, onEditDetails }: CatalogDetailsCardProps) {
  const links = template.externalLinks ?? [];

  return (
    <ClassSidebarSection
      title={`${template.kind} Details`}
      action={
        onEditDetails ? (
          <IconButton
            label={`Edit ${template.kind.toLowerCase()} details`}
            variant="ghost"
            size="sm"
            icon={<Pencil size={14} strokeWidth={1.75} />}
            onClick={onEditDetails}
          />
        ) : null
      }
    >
      <div style={{ display: "flex", flexDirection: "column" }}>
        <PropertyRow label="Code">{template.code}</PropertyRow>
        <PropertyRow label="Type">{template.kind}</PropertyRow>
        <PropertyRow label="Default class format">{template.defaultClassFormat}</PropertyRow>
        <PropertyRow label="Price">{template.price}</PropertyRow>
        {template.kind !== "Course" ? (
          <PropertyRow label="Registration fee">{template.registrationFee}</PropertyRow>
        ) : null}
        <PropertyRow label="Certification length">{template.certificationLength}</PropertyRow>
        <PropertyRow label="Registration limit">{template.registrationLimit}</PropertyRow>
        {links.length ? (
          <PropertyRow label="External links">
            {links.map((link, index) => (
              <span key={link.id}>
                {index > 0 ? ", " : null}
                {link.url ? (
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "inherit", textDecoration: "none" }}
                  >
                    {link.name || link.url}
                  </a>
                ) : (
                  link.name
                )}
              </span>
            ))}
          </PropertyRow>
        ) : null}
      </div>
    </ClassSidebarSection>
  );
}
