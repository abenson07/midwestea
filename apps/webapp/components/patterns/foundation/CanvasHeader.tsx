"use client";

import type { CSSProperties, ReactNode } from "react";
import { Icon } from "@/components/patterns/primitives/Icon";
import { IconButton } from "@/components/patterns/primitives/IconButton";
import { Text } from "@/components/patterns/primitives/Text";
import {
  Bell,
  Box,
  Check,
  ChevronRight,
  Link2,
  MoreHorizontal,
  Star,
} from "lucide-react";

/**
 * Shared chrome variants for canvas header regions.
 * Extend this union as new visual treatments are defined.
 */
export type CanvasChromeVariant = "default";

const chromeBaseStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  boxSizing: "border-box",
  paddingInline: "var(--linear-space-xs)",
  minHeight: "var(--linear-size-canvas-topbar-min-height)",
  flexShrink: 0,
};

const variantStyles: Record<CanvasChromeVariant, CSSProperties> = {
  default: {},
};

export type CanvasTopbarBreadcrumb = {
  label: string;
  onClick?: () => void;
};

/** Built-in + custom controls for the topbar's trailing (right) cluster. */
export type CanvasTopbarEndAction =
  | {
      type: "link";
      label?: string;
      onClick?: () => void;
    }
  | {
      type: "notifications";
      label?: string;
      /** When true, shows the caught-up check badge on the bell. */
      isCaughtUp?: boolean;
      onClick?: () => void;
    }
  | {
      type: "favorite";
      label?: string;
      isFavorite?: boolean;
      onClick?: () => void;
    }
  | {
      type: "more";
      label?: string;
      onClick?: () => void;
    }
  | {
      type: "custom";
      id: string;
      label: string;
      icon: ReactNode;
      onClick?: () => void;
    };

export type CanvasTopbarProps = {
  /** Current page title. */
  title: string;
  /** Leading page-type icon. Defaults to a document cube. */
  icon?: ReactNode;
  /** Parent crumbs shown before the title (chevron-separated). */
  breadcrumbs?: CanvasTopbarBreadcrumb[];
  /** Rendered right after the title, before favorite/more (e.g. a status pill). */
  titleAdornment?: ReactNode;
  /**
   * Title-adjacent favorite (sits next to the title).
   * Prefer `endActions` with `type: "favorite"` for the right cluster.
   */
  isFavorite?: boolean;
  onFavoriteClick?: () => void;
  hasFavorite?: boolean;
  /**
   * Title-adjacent more menu (sits next to the title / favorite).
   * Prefer `endActions` with `type: "more"` for the right cluster.
   */
  onMoreClick?: () => void;
  hasMore?: boolean;
  /**
   * Replace the default more IconButton (e.g. a Dropdown with more trigger).
   * Only used when `hasMore` is true.
   */
  moreMenu?: ReactNode;
  /**
   * Controls rendered in the right cluster (link, notifications, etc.).
   * Order in the array is render order.
   */
  endActions?: CanvasTopbarEndAction[];
  /** Escape hatch after `endActions`. */
  endContent?: ReactNode;
  variant?: CanvasChromeVariant;
};

function NotificationsIcon({ isCaughtUp }: { isCaughtUp?: boolean }) {
  return (
    <span
      style={{
        position: "relative",
        display: "inline-flex",
        width: 16,
        height: 16,
      }}
    >
      <Icon icon={Bell} size="sm" color="secondary" />
      {isCaughtUp ? (
        <span
          aria-hidden
          style={{
            position: "absolute",
            right: -3,
            bottom: -2,
            width: 10,
            height: 10,
            borderRadius: "50%",
            background: "var(--linear-color-canvas)",
            display: "grid",
            placeItems: "center",
          }}
        >
          <Check size={8} strokeWidth={3} color="var(--color-icon-secondary)" />
        </span>
      ) : null}
    </span>
  );
}

function renderEndAction(action: CanvasTopbarEndAction) {
  switch (action.type) {
    case "link":
      return (
        <IconButton
          key="link"
          label={action.label ?? "Copy link"}
          variant="ghost"
          size="sm"
          icon={<Icon icon={Link2} size="sm" color="secondary" />}
          onClick={action.onClick}
        />
      );
    case "notifications":
      return (
        <IconButton
          key="notifications"
          label={action.label ?? "Notifications"}
          variant="ghost"
          size="sm"
          icon={<NotificationsIcon isCaughtUp={action.isCaughtUp} />}
          onClick={action.onClick}
        />
      );
    case "favorite":
      return (
        <IconButton
          key="favorite"
          label={
            action.label ??
            (action.isFavorite ? "Remove favorite" : "Add favorite")
          }
          variant="ghost"
          size="sm"
          icon={
            <Star
              size={16}
              fill={action.isFavorite ? "#E9AF08" : "none"}
              color={action.isFavorite ? "#E9AF08" : "currentColor"}
              strokeWidth={action.isFavorite ? 0 : 1.75}
              aria-hidden
            />
          }
          onClick={action.onClick}
        />
      );
    case "more":
      return (
        <IconButton
          key="more"
          label={action.label ?? "More actions"}
          variant="ghost"
          size="sm"
          icon={<Icon icon={MoreHorizontal} size="sm" color="secondary" />}
          onClick={action.onClick}
        />
      );
    case "custom":
      return (
        <IconButton
          key={action.id}
          label={action.label}
          variant="ghost"
          size="sm"
          icon={action.icon}
          onClick={action.onClick}
        />
      );
  }
}

/** Top strip of the canvas — bottom hairline separator. */
export function CanvasTopbar({
  title,
  icon,
  breadcrumbs = [],
  titleAdornment,
  isFavorite = false,
  onFavoriteClick,
  hasFavorite = false,
  onMoreClick,
  hasMore = false,
  moreMenu,
  endActions = [],
  endContent,
  variant = "default",
}: CanvasTopbarProps) {
  const leadingIcon = icon ?? (
    <Icon icon={Box} size="sm" color="secondary" />
  );

  const titleActions =
    hasFavorite || hasMore ? (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          flexShrink: 0,
        }}
      >
        {hasFavorite ? (
          <IconButton
            label={isFavorite ? "Remove favorite" : "Add favorite"}
            variant="ghost"
            size="sm"
            icon={
              <Star
                size={16}
                fill={isFavorite ? "#E9AF08" : "none"}
                color={isFavorite ? "#E9AF08" : "currentColor"}
                strokeWidth={isFavorite ? 0 : 1.75}
                aria-hidden
              />
            }
            onClick={onFavoriteClick}
          />
        ) : null}
        {hasMore
          ? (moreMenu ?? (
              <IconButton
                label="More actions"
                variant="ghost"
                size="sm"
                icon={<Icon icon={MoreHorizontal} size="sm" color="secondary" />}
                onClick={onMoreClick}
              />
            ))
          : null}
      </div>
    ) : null;

  const hasEndCluster = endActions.length > 0 || endContent != null;

  return (
    <div
      data-slot="canvas-topbar"
      data-variant={variant}
      style={{
        ...chromeBaseStyle,
        ...variantStyles[variant],
        gap: 8,
        justifyContent: "space-between",
        borderBottom:
          "var(--linear-border-width) solid var(--linear-color-canvas-border)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          minWidth: 0,
          flex: 1,
        }}
      >
        <span
          style={{
            display: "inline-flex",
            flexShrink: 0,
            color: "var(--color-icon-secondary)",
          }}
        >
          {leadingIcon}
        </span>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            minWidth: 0,
            overflow: "hidden",
          }}
        >
          {breadcrumbs.map((crumb) => (
            <span
              key={crumb.label}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                flexShrink: 0,
              }}
            >
              {crumb.onClick ? (
                <button
                  type="button"
                  onClick={crumb.onClick}
                  style={{
                    all: "unset",
                    cursor: "pointer",
                  }}
                >
                  <Text size="sm" color="secondary">
                    {crumb.label}
                  </Text>
                </button>
              ) : (
                <Text size="sm" color="secondary">
                  {crumb.label}
                </Text>
              )}
              <Icon icon={ChevronRight} size="xsm" color="secondary" />
            </span>
          ))}

          <div
            style={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              minWidth: 0,
            }}
          >
            <Text size="sm" weight="medium">
              {title}
            </Text>
          </div>
        </div>

        {titleAdornment}
        {titleActions}
      </div>

      {hasEndCluster ? (
        <div
          data-slot="canvas-topbar-end"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            flexShrink: 0,
          }}
        >
          {endActions.map(renderEndAction)}
          {endContent}
        </div>
      ) : null}
    </div>
  );
}

export type CanvasControlsProps = {
  children?: ReactNode;
  variant?: CanvasChromeVariant;
  /** When false, controls are not rendered. @default true */
  isVisible?: boolean;
};

/** Controls strip below the topbar — same chrome, no bottom border. */
export function CanvasControls({
  children,
  variant = "default",
  isVisible = true,
}: CanvasControlsProps) {
  if (!isVisible) return null;

  return (
    <div
      data-slot="canvas-controls"
      data-variant={variant}
      style={{
        ...chromeBaseStyle,
        ...variantStyles[variant],
      }}
    >
      {children}
    </div>
  );
}

export type CanvasHeaderProps = {
  children?: ReactNode;
  topbarVariant?: CanvasChromeVariant;
  controlsVariant?: CanvasChromeVariant;
  /** Controls visibility. @default true */
  isControlsVisible?: boolean;
  /** Controls region content. */
  controls?: ReactNode;
  /** Structured topbar props. When set, renders `CanvasTopbar`. */
  topbar?: CanvasTopbarProps;
};

/**
 * Canvas header region — wraps topbar + controls.
 * Pass `topbar` props for the structured bar, and/or compose children.
 */
export function CanvasHeader({
  children,
  topbar,
  controls,
  topbarVariant = "default",
  controlsVariant = "default",
  isControlsVisible = true,
}: CanvasHeaderProps) {
  return (
    <header data-slot="canvas-header" style={{ flexShrink: 0 }}>
      {topbar ? <CanvasTopbar variant={topbarVariant} {...topbar} /> : null}
      {children}
      <CanvasControls variant={controlsVariant} isVisible={isControlsVisible}>
        {controls}
      </CanvasControls>
    </header>
  );
}
