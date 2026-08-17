"use client";

import { CatalogInfoBox } from "./CatalogInfoBox";
import { CatalogDetailsCard } from "./CatalogDetailsCard";
import { CatalogClassesSection } from "./CatalogClassesSection";
import { ClassPrerequisitesList } from "../classes/ClassPrerequisitesList";
import { ClassActivityCard } from "../classes/ClassActivityCard";
import { catalogActivityFor, type CatalogTemplate } from "./catalogMocks";
import type { ClassDetail } from "../classes/classMocks";

/** 24-column overview. Tweak `left` / `right` (must sum to `columns`). */
const OVERVIEW_GRID = {
  columns: 24,
  left: 17,
  right: 7,
  gap: 24,
} as const;

export type CatalogOverviewPageProps = {
  template: CatalogTemplate;
  classes: ClassDetail[];
  onEditDetails?: () => void;
  onCreateClass?: () => void;
};

export function CatalogOverviewPage({
  template,
  classes,
  onEditDetails,
  onCreateClass,
}: CatalogOverviewPageProps) {
  const activity = catalogActivityFor(template.id);

  return (
    <div
      data-slot="catalog-content-page"
      className="catalog-overview-layout"
      style={{
        height: "100%",
        minHeight: 0,
        overflow: "hidden",
        boxSizing: "border-box",
        padding: "32px 24px 24px",
        display: "grid",
        gridTemplateColumns: `repeat(${OVERVIEW_GRID.columns}, minmax(0, 1fr))`,
        gap: OVERVIEW_GRID.gap,
        alignItems: "stretch",
      }}
    >
      <style>{`
        @media (max-width: 900px) {
          .catalog-overview-layout {
            overflow: auto !important;
            height: auto !important;
            align-items: start !important;
          }
          .catalog-overview-layout > [data-slot="catalog-overview-main"],
          .catalog-overview-layout > [data-slot="catalog-overview-rail"] {
            grid-column: 1 / -1 !important;
            overflow: visible !important;
            height: auto !important;
          }
        }
      `}</style>
      <div
        data-slot="catalog-overview-main"
        style={{
          gridColumn: `span ${OVERVIEW_GRID.left}`,
          display: "flex",
          flexDirection: "column",
          gap: OVERVIEW_GRID.gap,
          minWidth: 0,
          minHeight: 0,
          overflowY: "auto",
          paddingBottom: 40,
        }}
      >
        <CatalogInfoBox template={template} />
        <CatalogClassesSection classes={classes} onCreateClass={onCreateClass} />
      </div>
      <div
        data-slot="catalog-overview-rail"
        style={{
          gridColumn: `span ${OVERVIEW_GRID.right}`,
          display: "flex",
          flexDirection: "column",
          gap: OVERVIEW_GRID.gap,
          minWidth: 0,
          minHeight: 0,
          overflowY: "auto",
          paddingBottom: 40,
        }}
      >
        <CatalogDetailsCard template={template} onEditDetails={onEditDetails} />
        <ClassPrerequisitesList key={template.id} items={template.prerequisites} />
        <ClassActivityCard items={activity} />
      </div>
    </div>
  );
}
