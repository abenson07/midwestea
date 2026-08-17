"use client";

import { Pencil } from "lucide-react";
import { Text } from "@/components/patterns/primitives/Text";
import { IconButton } from "@/components/patterns/shared/IconButton";
import { ClassSidebarSection } from "../classes/ClassSidebarSection";
import type { CatalogTemplate } from "./catalogMocks";

export type CatalogDetailsCardProps = {
  template: CatalogTemplate;
  onEditDetails?: () => void;
};

function PropertyRow({ label, value }: { label: string; value: string }) {
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
      <Text size="sm" style={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis" }}>
        {value}
      </Text>
    </div>
  );
}

/** Template details card — field on the left, value on the right. */
export function CatalogDetailsCard({ template, onEditDetails }: CatalogDetailsCardProps) {
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
        <PropertyRow label="Code" value={template.code} />
        <PropertyRow label="Type" value={template.kind} />
        <PropertyRow label="Default class format" value={template.defaultClassFormat} />
        <PropertyRow label="Price" value={template.price} />
        <PropertyRow label="Registration fee" value={template.registrationFee} />
        <PropertyRow label="Certification length" value={template.certificationLength} />
        <PropertyRow label="Registration limit" value={template.registrationLimit} />
      </div>
    </ClassSidebarSection>
  );
}
