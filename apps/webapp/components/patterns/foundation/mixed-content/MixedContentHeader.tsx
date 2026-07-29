"use client";

import type { ReactNode } from "react";
import {
  CalendarPlus,
  CircleDot,
  FileText,
  MoreHorizontal,
  PenSquare,
  Plus,
  User,
} from "lucide-react";
import { IconButton } from "@/components/patterns/shared/IconButton";

export type MixedContentProperty = {
  id: string;
  label: string;
  icon?: ReactNode;
};

export type MixedContentResource = {
  id: string;
  label: string;
  onClick?: () => void;
};

export type MixedContentHeaderProps = {
  title: string;
  icon?: ReactNode;
  summaryPlaceholder?: string;
  properties?: MixedContentProperty[];
  resources?: MixedContentResource[];
  onAddResource?: () => void;
  ctaLabel?: string;
  onCtaClick?: () => void;
};

function PropertyChip({ label, icon }: MixedContentProperty) {
  return (
    <button
      type="button"
      style={{
        all: "unset",
        boxSizing: "border-box",
        cursor: "pointer",
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        height: 28,
        paddingInline: 8,
        borderRadius: 6,
        color: "var(--linear-color-ink-subtle)",
        fontSize: 13,
        lineHeight: "20px",
      }}
    >
      {icon ? (
        <span style={{ display: "inline-flex", color: "inherit" }}>{icon}</span>
      ) : null}
      {label}
    </button>
  );
}

/**
 * Initiative / entity header for mixed-content pages.
 */
export function MixedContentHeader({
  title,
  icon,
  summaryPlaceholder = "Add a short summary...",
  properties = [],
  resources = [],
  onAddResource,
  ctaLabel = "Write first initiative update",
  onCtaClick,
}: MixedContentHeaderProps) {
  return (
    <header
      data-slot="mixed-content-header"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 16,
      }}
    >
      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: 999,
          background: "var(--linear-color-sidebar-item-selected)",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--linear-color-ink)",
        }}
      >
        {icon ?? <CircleDot size={16} strokeWidth={1.75} />}
      </div>

      <h1
        style={{
          margin: 0,
          fontSize: 28,
          lineHeight: "34px",
          fontWeight: 600,
          letterSpacing: "-0.02em",
          color: "var(--linear-color-ink)",
        }}
      >
        {title}
      </h1>

      <button
        type="button"
        style={{
          all: "unset",
          cursor: "text",
          color: "var(--linear-color-ink-subtle)",
          fontSize: 14,
          lineHeight: "20px",
        }}
      >
        {summaryPlaceholder}
      </button>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            flexWrap: "wrap",
          }}
        >
          <span
            style={{
              width: 72,
              flexShrink: 0,
              fontSize: 12,
              color: "var(--linear-color-ink-subtle)",
            }}
          >
            Properties
          </span>
          {properties.map((property) => (
            <PropertyChip key={property.id} {...property} />
          ))}
          <IconButton
            label="More properties"
            variant="ghost"
            size="sm"
            icon={<MoreHorizontal size={14} strokeWidth={2} />}
          />
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            flexWrap: "wrap",
          }}
        >
          <span
            style={{
              width: 72,
              flexShrink: 0,
              fontSize: 12,
              color: "var(--linear-color-ink-subtle)",
            }}
          >
            Resources
          </span>
          {resources.map((resource) => (
            <button
              key={resource.id}
              type="button"
              onClick={resource.onClick}
              style={{
                all: "unset",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                maxWidth: 280,
                height: 28,
                paddingInline: 8,
                borderRadius: 6,
                color: "var(--linear-color-ink)",
                fontSize: 13,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              <FileText size={14} strokeWidth={1.75} />
              {resource.label}
            </button>
          ))}
          <IconButton
            label="Add resource"
            variant="ghost"
            size="sm"
            icon={<Plus size={14} strokeWidth={2} />}
            onClick={onAddResource}
          />
        </div>
      </div>

      <button
        type="button"
        onClick={onCtaClick}
        style={{
          all: "unset",
          boxSizing: "border-box",
          cursor: "pointer",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          width: "100%",
          height: 36,
          borderRadius: 8,
          border:
            "var(--linear-border-width) solid var(--linear-color-hairline)",
          color: "var(--linear-color-ink-subtle)",
          fontSize: 13,
          lineHeight: "20px",
        }}
      >
        <PenSquare size={14} strokeWidth={1.75} />
        {ctaLabel}
      </button>
    </header>
  );
}

export const defaultInitiativeProperties: MixedContentProperty[] = [
  {
    id: "status",
    label: "Active",
    icon: <CircleDot size={14} strokeWidth={1.75} color="#f2c94c" />,
  },
  {
    id: "priority",
    label: "No priority",
    icon: (
      <span
        aria-hidden
        style={{
          fontSize: 12,
          letterSpacing: "0.04em",
          color: "var(--linear-color-ink-subtle)",
        }}
      >
        ---
      </span>
    ),
  },
  {
    id: "owner",
    label: "Owner",
    icon: <User size={14} strokeWidth={1.75} />,
  },
  {
    id: "target",
    label: "Target date",
    icon: <CalendarPlus size={14} strokeWidth={1.75} />,
  },
];
