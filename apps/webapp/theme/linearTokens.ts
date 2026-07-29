/**
 * Linear product tokens — DESIGN.md + foundation refinements.
 * Values use CSS `light-dark(light, dark)` so they follow Astryx Theme mode
 * (`color-scheme` / `data-theme`).
 */
export const linearTokens = {
  color: {
    /** Page chrome behind the canvas */
    background: {
      light: "lch(95.94 0.5 282)",
      dark: "lch(9.236 1.213 272.695)",
    },
    /** Primary canvas surface */
    canvas: {
      light: "lch(98.94 0.5 282)",
      dark: "lch(12.236 2.213 272.695)",
    },
    /** DESIGN.md ink / inverse-ink */
    ink: {
      light: "#000000",
      dark: "#f7f8f8",
    },
    inkMuted: {
      light: "#62666d",
      dark: "#d0d6e0",
    },
    inkSubtle: {
      light: "#8a8f98",
      dark: "#8a8f98",
    },
    inkTertiary: {
      light: "#8a8f98",
      dark: "#62666d",
    },
    /** Canvas / chrome hairlines — DESIGN.md hairline* + light refined LCH */
    canvasBorder: {
      light: "lch(90.84 0 282)",
      dark: "lch(20.636 3.413 272.695)",
    },
    hairline: {
      light: "lch(90.84 0 282)",
      dark: "lch(20.636 3.413 272.695)",
    },
    hairlineStrong: {
      light: "#d0d6e0",
      dark: "#34343a",
    },
    hairlineTertiary: {
      light: "#c4c9d0",
      dark: "#3e3e44",
    },
    /** DESIGN.md surfaces (dark) + light lifts */
    surface1: {
      light: "lch(97.5 0.4 282)",
      dark: "#0f1011",
    },
    surface2: {
      light: "lch(96.5 0.4 282)",
      dark: "#141516",
    },
    surface3: {
      light: "lch(95.5 0.4 282)",
      dark: "#18191a",
    },
    surface4: {
      light: "lch(94.5 0.4 282)",
      dark: "#191a1b",
    },
    accent: "#5e6ad2",
    accentHover: "#828fff",
    accentFocus: "#5e69d1",
    onAccent: "#ffffff",
    success: "#27a644",
    /** Sidebar nav item — idle label/icon */
    sidebarItemIdle: {
      light: "#2c2e33",
      dark: "#8a8f98",
    },
    /** Sidebar nav item selected wash */
    sidebarItemSelected: {
      light: "lch(90 0.5 282)",
      dark: "lch(18 1.5 272.695)",
    },
    /**
     * Secondary icon-button circular fill (filter / display).
     * Dark must read lighter than the canvas — not transparent.
     */
    iconButtonSecondary: {
      light: "lch(98.5 0.4 282)",
      dark: "lch(24 2 272.695)",
    },
  },
  border: {
    width: "0.5px",
  },
  radius: {
    md: "8px",
  },
  shadow: {
    canvas: {
      light: "0 1px 2px lch(0 0 0 / 0.02)",
      dark: "0 1px 2px lch(0 0 0 / 0.24)",
    },
  },
  space: {
    xs: "8px",
  },
  size: {
    canvasTopbarMinHeight: "40px",
  },
} as const;

function lightDark(light: string, dark: string) {
  return `light-dark(${light}, ${dark})`;
}

/** Flat CSS custom-property map for mounting on a root/wrapper element */
export const linearTokenVars = {
  "--linear-color-background": lightDark(
    linearTokens.color.background.light,
    linearTokens.color.background.dark,
  ),
  "--linear-color-canvas": lightDark(
    linearTokens.color.canvas.light,
    linearTokens.color.canvas.dark,
  ),
  "--linear-color-ink": lightDark(
    linearTokens.color.ink.light,
    linearTokens.color.ink.dark,
  ),
  "--linear-color-ink-muted": lightDark(
    linearTokens.color.inkMuted.light,
    linearTokens.color.inkMuted.dark,
  ),
  "--linear-color-ink-subtle": lightDark(
    linearTokens.color.inkSubtle.light,
    linearTokens.color.inkSubtle.dark,
  ),
  "--linear-color-ink-tertiary": lightDark(
    linearTokens.color.inkTertiary.light,
    linearTokens.color.inkTertiary.dark,
  ),
  "--linear-color-canvas-border": lightDark(
    linearTokens.color.canvasBorder.light,
    linearTokens.color.canvasBorder.dark,
  ),
  "--linear-color-hairline": lightDark(
    linearTokens.color.hairline.light,
    linearTokens.color.hairline.dark,
  ),
  "--linear-color-hairline-strong": lightDark(
    linearTokens.color.hairlineStrong.light,
    linearTokens.color.hairlineStrong.dark,
  ),
  "--linear-color-surface-1": lightDark(
    linearTokens.color.surface1.light,
    linearTokens.color.surface1.dark,
  ),
  "--linear-color-surface-2": lightDark(
    linearTokens.color.surface2.light,
    linearTokens.color.surface2.dark,
  ),
  "--linear-color-surface-3": lightDark(
    linearTokens.color.surface3.light,
    linearTokens.color.surface3.dark,
  ),
  "--linear-color-surface-4": lightDark(
    linearTokens.color.surface4.light,
    linearTokens.color.surface4.dark,
  ),
  "--linear-color-accent": linearTokens.color.accent,
  "--linear-color-sidebar-item-idle": lightDark(
    linearTokens.color.sidebarItemIdle.light,
    linearTokens.color.sidebarItemIdle.dark,
  ),
  "--linear-color-sidebar-item-selected": lightDark(
    linearTokens.color.sidebarItemSelected.light,
    linearTokens.color.sidebarItemSelected.dark,
  ),
  "--linear-color-icon-button-secondary": lightDark(
    linearTokens.color.iconButtonSecondary.light,
    linearTokens.color.iconButtonSecondary.dark,
  ),
  "--linear-border-width": linearTokens.border.width,
  "--linear-radius-md": linearTokens.radius.md,
  "--linear-shadow-canvas": lightDark(
    linearTokens.shadow.canvas.light,
    linearTokens.shadow.canvas.dark,
  ),
  "--linear-space-xs": linearTokens.space.xs,
  "--linear-size-canvas-topbar-min-height":
    linearTokens.size.canvasTopbarMinHeight,
} as const;
