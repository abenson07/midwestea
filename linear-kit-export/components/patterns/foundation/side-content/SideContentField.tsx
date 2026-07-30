"use client";

import type { ReactNode } from "react";
import { ListItem } from "@astryxdesign/core/List";

export type SideContentFieldProps = {
  label: string;
  icon?: ReactNode;
  onClick?: () => void;
  endContent?: ReactNode;
};

/**
 * Interactive property / relation row — Astryx `ListItem`.
 */
export function SideContentField({
  label,
  icon,
  onClick,
  endContent,
}: SideContentFieldProps) {
  return (
    <ListItem
      label={label}
      startContent={icon}
      endContent={endContent}
      onClick={onClick ?? (() => {})}
    />
  );
}
