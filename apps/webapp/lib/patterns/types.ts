import type { ComponentType, ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

export type PatternCategory =
  | "Foundation"
  | "Layout"
  | "Navigation"
  | "Data"
  | "Client Templates";

export type TweakOption = {
  value: string;
  label: string;
};

export type TweakField =
  | {
      key: string;
      label: string;
      type: "boolean";
      defaultValue: boolean;
      description?: string;
    }
  | {
      key: string;
      label: string;
      type: "string";
      defaultValue: string;
      description?: string;
      placeholder?: string;
    }
  | {
      key: string;
      label: string;
      type: "select";
      defaultValue: string;
      options: TweakOption[];
      description?: string;
    };

export type PatternTweakValues = Record<string, boolean | string>;

export type PatternDefinition = {
  slug: string;
  name: string;
  description: string;
  category: PatternCategory;
  Preview: ComponentType;
  /** Controllable props/states for the gallery Tweaks popover. */
  tweaks?: TweakField[];
};

export function getDefaultTweakValues(
  fields: TweakField[] | undefined,
): PatternTweakValues {
  if (!fields) return {};
  return Object.fromEntries(
    fields.map((field) => [field.key, field.defaultValue]),
  );
}

export type PatternNavItem = {
  id: string;
  label: string;
  icon?: LucideIcon;
  badge?: string;
  children?: PatternNavItem[];
};

export type PatternNavSection = {
  title: string;
  items: PatternNavItem[];
};

export type DashboardMetric = {
  id: string;
  label: string;
  value: string;
  change?: string;
  trend?: "up" | "down" | "neutral";
  description?: string;
};

export type IssueRow = {
  id: string;
  title: string;
  status: "backlog" | "in-progress" | "review" | "done";
  priority: "low" | "medium" | "high" | "urgent";
  assignee: string;
  updatedAt: string;
};

export type RecordListItem = {
  id: string;
  title: string;
  subtitle: string;
  status: string;
};

export type RecordDetail = {
  id: string;
  title: string;
  status: string;
  owner: string;
  team: string;
  createdAt: string;
  updatedAt: string;
  description: string;
  tags: string[];
};

export type CommandItem = {
  id: string;
  label: string;
  group?: string;
  keywords?: string[];
  icon?: ReactNode;
};
