"use client";

import type { ReactNode } from "react";
import { Pencil } from "lucide-react";
import { Text } from "@/components/admin-migrate/patterns/primitives/Text";
import { IconButton } from "@/components/admin-migrate/patterns/shared/IconButton";
import { formatCalendarDate } from "@/lib/dates";
import { ClassSidebarSection } from "./ClassSidebarSection";
import type { ClassDetail } from "./classMocks";

export type ClassDetailsCardProps = {
  classDetail: ClassDetail;
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
      <Text size="sm" color="secondary" style={{ width: 108, flexShrink: 0 }}>
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

/** Class details card — field on the left, value on the right. */
export function ClassDetailsCard({ classDetail, onEditDetails }: ClassDetailsCardProps) {
  const links = classDetail.externalLinks ?? [];

  return (
    <ClassSidebarSection
      title="Class Details"
      action={
        onEditDetails ? (
          <IconButton
            label="Edit class details"
            variant="ghost"
            size="sm"
            icon={<Pencil size={14} strokeWidth={1.75} />}
            onClick={onEditDetails}
          />
        ) : null
      }
    >
      <div style={{ display: "flex", flexDirection: "column" }}>
        <PropertyRow label="Status">
          {classDetail.publishStatus === "published" ? "Published" : "Draft"}
        </PropertyRow>
        <PropertyRow label="Registration">{classDetail.registrationFee}</PropertyRow>
        <PropertyRow label="Pay in full at registration">
          {classDetail.chargeFullAmountAtRegistration ? "Yes" : "No"}
        </PropertyRow>
        <PropertyRow label="Tuition">{classDetail.price}</PropertyRow>
        <PropertyRow label="Class size">{classDetail.registrationLimit}</PropertyRow>
        <PropertyRow label="Type">{classDetail.classFormat}</PropertyRow>
        <PropertyRow label="Dates">
          {`${formatCalendarDate(classDetail.classStart)} – ${formatCalendarDate(classDetail.classEnd)}`}
        </PropertyRow>
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
