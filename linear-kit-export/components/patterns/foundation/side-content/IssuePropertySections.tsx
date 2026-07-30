"use client";

import { Box, MoreHorizontal, Tag, Triangle, UserRound } from "lucide-react";
import { SideContentSection } from "./SideContentSection";
import { SideContentField } from "./SideContentField";

function InProgressIcon() {
  return (
    <svg width={16} height={16} viewBox="0 0 16 16" aria-hidden>
      <circle
        cx="8"
        cy="8"
        r="6.25"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        opacity={0.35}
      />
      <path
        d="M8 1.75A6.25 6.25 0 0 1 14.25 8H8V1.75Z"
        fill="#f2c94c"
      />
    </svg>
  );
}

export type PropertiesSectionProps = {
  statusLabel?: string;
  priorityLabel?: string;
  assigneeLabel?: string;
  estimateLabel?: string;
  onStatusClick?: () => void;
  onPriorityClick?: () => void;
  onAssigneeClick?: () => void;
  onEstimateClick?: () => void;
};

export function PropertiesSection({
  statusLabel = "In Progress",
  priorityLabel = "Set priority",
  assigneeLabel = "Assign",
  estimateLabel = "Set estimate",
  onStatusClick,
  onPriorityClick,
  onAssigneeClick,
  onEstimateClick,
}: PropertiesSectionProps) {
  return (
    <SideContentSection title="Properties">
      <SideContentField
        icon={<InProgressIcon />}
        label={statusLabel}
        onClick={onStatusClick}
      />
      <SideContentField
        icon={<MoreHorizontal size={16} strokeWidth={2} />}
        label={priorityLabel}
        onClick={onPriorityClick}
      />
      <SideContentField
        icon={<UserRound size={16} strokeWidth={1.75} />}
        label={assigneeLabel}
        onClick={onAssigneeClick}
      />
      <SideContentField
        icon={<Triangle size={16} strokeWidth={1.75} />}
        label={estimateLabel}
        onClick={onEstimateClick}
      />
    </SideContentSection>
  );
}

export type LabelsSectionProps = {
  label?: string;
  onAddClick?: () => void;
};

export function LabelsSection({
  label = "Add label",
  onAddClick,
}: LabelsSectionProps) {
  return (
    <SideContentSection title="Labels">
      <SideContentField
        icon={<Tag size={16} strokeWidth={1.75} />}
        label={label}
        onClick={onAddClick}
      />
    </SideContentSection>
  );
}

export type ProjectSectionProps = {
  projectName?: string;
  onClick?: () => void;
};

export function ProjectSection({
  projectName = "[OLD] Hopeward Consulting Site",
  onClick,
}: ProjectSectionProps) {
  return (
    <SideContentSection title="Project">
      <SideContentField
        icon={<Box size={16} strokeWidth={1.75} />}
        label={projectName}
        onClick={onClick}
      />
    </SideContentSection>
  );
}
