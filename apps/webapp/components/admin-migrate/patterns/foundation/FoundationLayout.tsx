"use client";

import type { CSSProperties, ReactNode } from "react";
import { Layout, LayoutContent } from "@/components/admin-migrate/patterns/primitives/Layout";
import { useResizable, ResizeHandle } from "@/components/admin-migrate/patterns/primitives/Resizable";
import { linearTokenVars } from "@/theme/linearTokens";
import {
  CanvasHeader,
  type CanvasChromeVariant,
  type CanvasTopbarProps,
} from "./CanvasHeader";

const NAV_DEFAULT_WIDTH = 244;
const NAV_MAX_WIDTH = 330;

export type FoundationLayoutProps = {
  /** Left navigation region content. */
  navigation?: ReactNode;
  /** Canvas header (topbar + controls). Pass a `CanvasHeader` or use convenience props. */
  header?: ReactNode;
  /** Structured topbar props when `header` is omitted. */
  topbar?: CanvasTopbarProps;
  /** Convenience controls content when `header` is omitted. */
  controls?: ReactNode;
  topbarVariant?: CanvasChromeVariant;
  controlsVariant?: CanvasChromeVariant;
  /** Controls visibility. @default true */
  isControlsVisible?: boolean;
  /**
   * Optional properties column (`SideContentBar` / `LayoutPanel`).
   * Sits in Layout `end` beside the body — inside `contentMaxWidth` when set.
   */
  sideContent?: ReactNode;
  /** When false, `sideContent` is not shown. @default true when `sideContent` is set. */
  isSideContentVisible?: boolean;
  /**
   * When set (e.g. mixed content), centers a max-width rail that wraps
   * **both** the canvas body and the side content column.
   * Omit for full-bleed surfaces (grouped table).
   */
  contentMaxWidth?: number;
  /** Main canvas body below the header. */
  children?: ReactNode;
};

/**
 * Foundational product frame:
 * page wrapper → resizable nav → canvas surface →
 * optional centered content rail (body + side) or full-bleed body.
 */
export function FoundationLayout({
  navigation,
  header,
  topbar,
  controls,
  topbarVariant,
  controlsVariant,
  isControlsVisible = true,
  sideContent,
  isSideContentVisible,
  contentMaxWidth,
  children,
}: FoundationLayoutProps) {
  const nav = useResizable({
    defaultSize: NAV_DEFAULT_WIDTH,
    minSizePx: NAV_DEFAULT_WIDTH,
    maxSizePx: NAV_MAX_WIDTH,
  });

  const showSideContent =
    sideContent != null && (isSideContentVisible ?? true);

  const resolvedHeader =
    header ??
    (topbar !== undefined || controls !== undefined ? (
      <CanvasHeader
        topbar={topbar}
        controls={controls}
        topbarVariant={topbarVariant}
        controlsVariant={controlsVariant}
        isControlsVisible={isControlsVisible}
      />
    ) : null);

  const body = showSideContent ? (
    <Layout
      height="fill"
      padding={0}
      content={
        <LayoutContent padding={0} role="main">
          {children}
        </LayoutContent>
      }
      end={sideContent}
    />
  ) : (
    <div
      style={{
        height: "100%",
        minHeight: 0,
        overflow: "auto",
      }}
    >
      {children}
    </div>
  );

  return (
    <div
      style={
        {
          ...linearTokenVars,
          "--color-border": "var(--linear-color-hairline)",
          "--color-icon-secondary": "var(--linear-color-ink-subtle)",
          display: "flex",
          flexDirection: "row",
          height: "100%",
          width: "100%",
          overflow: "hidden",
          background: "var(--linear-color-background)",
        } as CSSProperties
      }
    >
      <nav
        aria-label="Primary"
        style={{
          width: nav.size,
          flexShrink: 0,
          height: "100%",
          position: "relative",
          background: "transparent",
          overflow: "hidden",
        }}
      >
        {navigation}
        <ResizeHandle
          direction="horizontal"
          position="overlay"
          resizable={nav.props}
          isAlwaysVisible={false}
          label="Resize navigation"
        />
      </nav>

      <div
        style={{
          flex: 1,
          minWidth: 0,
          height: "100%",
          padding: "8px 8px 8px 0",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            height: "100%",
            width: "100%",
            background: "var(--linear-color-canvas)",
            border:
              "var(--linear-border-width) solid var(--linear-color-canvas-border)",
            borderRadius: "var(--linear-radius-md)",
            boxShadow: "var(--linear-shadow-canvas)",
            boxSizing: "border-box",
            overflow: "hidden",
          }}
        >
          {resolvedHeader}
          <div style={{ flex: 1, minHeight: 0, minWidth: 0 }}>
            {contentMaxWidth != null ? (
              <div
                style={{
                  height: "100%",
                  minHeight: 0,
                  overflow: "auto",
                  boxSizing: "border-box",
                }}
              >
                <div
                  style={{
                    width: "100%",
                    maxWidth: contentMaxWidth,
                    marginInline: "auto",
                    height: "100%",
                    minHeight: 0,
                    boxSizing: "border-box",
                  }}
                >
                  {body}
                </div>
              </div>
            ) : (
              body
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
