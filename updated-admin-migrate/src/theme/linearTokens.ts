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
    /**
     * Content cards over the canvas — same hue as the solid panel. Dark mode
     * drops to 50% opacity so the page shows through; light mode stays
     * opaque (50% read as washed-out against the light canvas). Side detail
     * panels use `sidePanel`.
     */
    panel: {
      light: "lch(100 0 282)",
      dark: "lch(16.5 2.2 272.695 / 0.5)",
    },
    /** Opaque fill for OutlinedPanel / elevated side content. */
    sidePanel: {
      light: "lch(100 0 282)",
      dark: "lch(16.5 2.2 272.695)",
    },
    panelBorder: {
      light: "lch(0 0 0 / 0.08)",
      dark: "lch(22 2.5 272.695)",
    },
    accent: "#38c768",
    accentHover: "#52ff8b",
    accentFocus: "#38c264",
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
    lg: "10px",
  },
  /**
   * `light-dark()` is only valid as a <color> — it can't wrap a whole
   * box-shadow list (multiple comma-separated shadows would be parsed as
   * extra light-dark() arguments, and the declaration is dropped). So each
   * shadow keeps static geometry and only varies its layer *colors* by mode.
   */
  shadow: {
    canvas: {
      geometry: "0px 1px 2px",
      colorLight: "lch(0 0 0 / 0.02)",
      colorDark: "lch(0 0 0 / 0.24)",
    },
    /** Content card shadow — present in light, off in dark (dark panel already reads via its 50% fill). */
    panel: {
      ambientGeometry: "0px 3px 6px -2px",
      ambientColorLight: "lch(0 0 0 / 0.02)",
      ambientColorDark: "transparent",
      contactGeometry: "0px 1px 1px 1px",
      contactColorLight: "lch(0 0 0 / 0.04)",
      contactColorDark: "transparent",
    },
    /** Side detail panel shadow — measured from linear.app light/dark. */
    sidePanel: {
      // Ambient layer: present in light, faded out in dark.
      ambientGeometry: "0px 3px 6px -2px",
      ambientColorLight: "lch(0 0 0 / 0.02)",
      ambientColorDark: "lch(0 0 0 / 0)",
      // Contact layer: matches linear.app's dark shadow almost exactly.
      contactGeometry: "0px 1px 1px 1px",
      contactColorLight: "lch(0 0 0 / 0.04)",
      contactColorDark: "lch(0 0 0 / 0.3)",
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
  "--linear-color-panel": lightDark(
    linearTokens.color.panel.light,
    linearTokens.color.panel.dark,
  ),
  "--linear-color-side-panel": lightDark(
    linearTokens.color.sidePanel.light,
    linearTokens.color.sidePanel.dark,
  ),
  "--linear-color-panel-border": lightDark(
    linearTokens.color.panelBorder.light,
    linearTokens.color.panelBorder.dark,
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
  "--linear-radius-lg": linearTokens.radius.lg,
  "--linear-shadow-canvas": `${linearTokens.shadow.canvas.geometry} ${lightDark(
    linearTokens.shadow.canvas.colorLight,
    linearTokens.shadow.canvas.colorDark,
  )}`,
  "--linear-shadow-panel": `${linearTokens.shadow.panel.ambientGeometry} ${lightDark(
    linearTokens.shadow.panel.ambientColorLight,
    linearTokens.shadow.panel.ambientColorDark,
  )}, ${linearTokens.shadow.panel.contactGeometry} ${lightDark(
    linearTokens.shadow.panel.contactColorLight,
    linearTokens.shadow.panel.contactColorDark,
  )}`,
  "--linear-shadow-side-panel": `${linearTokens.shadow.sidePanel.ambientGeometry} ${lightDark(
    linearTokens.shadow.sidePanel.ambientColorLight,
    linearTokens.shadow.sidePanel.ambientColorDark,
  )}, ${linearTokens.shadow.sidePanel.contactGeometry} ${lightDark(
    linearTokens.shadow.sidePanel.contactColorLight,
    linearTokens.shadow.sidePanel.contactColorDark,
  )}`,
  "--linear-space-xs": linearTokens.space.xs,
  "--linear-size-canvas-topbar-min-height":
    linearTokens.size.canvasTopbarMinHeight,
} as const;
