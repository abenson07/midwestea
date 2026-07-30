"use client";

import { Button } from "@astryxdesign/core/Button";
import { HStack, LayoutPanel, VStack } from "@astryxdesign/core/Layout";
import type { ReactNode } from "react";
import { Copy, GitBranch, Link2 } from "lucide-react";
import {
  LabelsSection,
  ProjectSection,
  PropertiesSection,
} from "./IssuePropertySections";

export type SideContentBarProps = {
  /** Panel contents. Defaults to Properties / Labels / Project. */
  children?: ReactNode;
  /** Fixed column width. @default 280 */
  width?: number;
};

/**
 * Issue properties column — Astryx `LayoutPanel` with **no** divider.
 * Lives inside a max-width centered page next to the body (Linear issue view),
 * not as a full-bleed docked canvas rail.
 */
export function SideContentBar({
  children,
  width = 280,
}: SideContentBarProps) {
  return (
    <LayoutPanel
      hasDivider={false}
      width={width}
      padding={3}
      role="complementary"
      label="Properties"
      isScrollable
    >
      {children ?? <IssueSideContentDemo />}
    </LayoutPanel>
  );
}

/**
 * Default properties column: accessory actions + Properties / Labels / Project.
 */
export function IssueSideContentDemo() {
  return (
    <VStack gap={5}>
      <HStack gap={1} hAlign="end">
        <Button
          label="Copy link"
          variant="ghost"
          size="sm"
          icon={<Link2 size={14} strokeWidth={1.75} />}
          isIconOnly
        />
        <Button
          label="Copy ID"
          variant="ghost"
          size="sm"
          icon={<Copy size={14} strokeWidth={1.75} />}
          isIconOnly
        />
        <Button
          label="Git"
          variant="ghost"
          size="sm"
          icon={<GitBranch size={14} strokeWidth={1.75} />}
          isIconOnly
        />
      </HStack>

      <PropertiesSection />
      <LabelsSection />
      <ProjectSection />
    </VStack>
  );
}
