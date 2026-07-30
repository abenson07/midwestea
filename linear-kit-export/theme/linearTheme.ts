import { defineTheme } from "@astryxdesign/core/theme";
import { neutralTheme } from "@astryxdesign/theme-neutral";
import { linearTokens } from "./linearTokens";

const { color } = linearTokens;

/**
 * Linear-inspired Astryx theme.
 * Light/dark slots follow DESIGN.md (+ foundation LCH background/canvas).
 */
export const linearTheme = defineTheme({
  name: "linear",
  extends: neutralTheme,

  color: {
    accent: color.accent,
    neutralStyle: "cool",
  },

  typography: {
    scale: { base: 14, ratio: 1.2 },
    body: {
      family: "var(--font-inter)",
      fallbacks: "system-ui, sans-serif",
    },
    heading: {
      family: "var(--font-inter)",
      fallbacks: "system-ui, sans-serif",
      weights: { 1: "semibold", 2: "semibold", 3: "semibold" },
    },
    code: {
      family: "ui-monospace",
      fallbacks:
        '"SF Mono", Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    },
  },

  radius: { base: 4, multiplier: 1 },

  tokens: {
    // Page + elevated surfaces
    "--color-background-body": [
      color.background.light,
      color.background.dark,
    ],
    "--color-background-card": [color.canvas.light, color.canvas.dark],
    "--color-background-muted": [color.surface1.light, color.surface1.dark],
    "--color-background-surface": [color.canvas.light, color.surface2.dark],
    "--color-background-popover": [color.canvas.light, color.surface3.dark],

    // Accent — lavender-blue
    "--color-accent": [color.accent, color.accent],
    "--color-accent-muted": ["#5e6ad21A", "#5e6ad233"],
    "--color-on-accent": [color.onAccent, color.onAccent],
    "--color-text-accent": [color.accent, color.accentHover],
    "--color-icon-accent": [color.accent, color.accentHover],

    // Ink
    "--color-text-primary": [color.ink.light, color.ink.dark],
    "--color-text-secondary": [color.inkMuted.light, color.inkSubtle.dark],
    "--color-text-disabled": [color.inkTertiary.light, color.inkTertiary.dark],
    "--color-icon-primary": [color.ink.light, color.ink.dark],
    "--color-icon-secondary": [color.inkMuted.light, color.inkSubtle.dark],
    "--color-icon-disabled": [color.inkTertiary.light, color.inkTertiary.dark],
    "--color-on-dark": color.ink.dark,
    "--color-on-light": color.ink.light,

    // Hairlines
    "--color-border": [color.hairline.light, color.hairline.dark],
    "--color-border-emphasized": [
      color.hairlineStrong.light,
      color.hairlineStrong.dark,
    ],

    // Semantic
    "--color-success": [color.success, color.success],
    "--color-overlay": ["#00000080", "#000000CC"],
    "--color-shadow": ["#0000001A", "#00000000"],

    // Surface lift via hairlines, not drop shadows
    "--shadow-low": "inset 0 0 0 1px var(--color-border)",
    "--shadow-med": "inset 0 0 0 1px var(--color-border)",
    "--shadow-high": "inset 0 0 0 1px var(--color-border)",
    "--shadow-inset-hover": `inset 0px 0px 0px 2px ${color.accent}4D`,
    "--shadow-inset-selected": `inset 0px 0px 0px 2px ${color.accent}80`,
  },

  components: {
    button: {
      "variant:primary": {
        backgroundColor: "var(--color-accent)",
        color: "var(--color-on-accent)",
        ":hover": {
          backgroundColor: color.accentHover,
        },
        ":active": {
          backgroundColor: color.accentFocus,
        },
      },
    },
  },
});
