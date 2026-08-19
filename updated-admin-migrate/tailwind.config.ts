import type { Config } from "tailwindcss";

/*
  Ported from Tailwind v4's `@theme` blocks in src/app/globals.css.

  The static palette (`colors` below) uses literal hex values, not `var(--x)`
  references, deliberately: Tailwind v3's opacity-modifier syntax (e.g.
  `text-white/90`, used throughout this app) needs the literal color at
  build time to generate the right output CSS — it can't see through a CSS
  variable to know what color is inside it. These values are static (they
  never change with dark mode) so hardcoding them here is safe; they're kept
  in sync with the matching `--color-*` declarations in globals.css by hand.

  The semantic layer (backgroundColor/textColor/borderColor/ringColor/
  outlineColor below) stays as `var(--x)` references on purpose — those
  *do* change at runtime via `.dark { --background-color-primary: ...; }`
  overrides in globals.css, and nothing in the app applies an opacity
  modifier to them (verified), so there's no build-time-literal requirement
  forcing them to be hardcoded too.
*/
const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    screens: {
      "2xsm": "375px",
      xsm: "425px",
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1536px",
      "3xl": "2000px",
    },
    extend: {
      // v4's default spacing scale is algorithmic (any 0.25rem multiple works);
      // v3's is a fixed list that doesn't include 6.5. Only value actually used
      // here that isn't already in v3's default steps (checked: 0.5/1.5/2.5 are).
      spacing: {
        "6.5": "1.625rem",
      },
      fontFamily: {
        "noto-sans": "var(--font-noto-sans)",
        "mercury-text": "var(--font-mercury-text)",
        "mercury-display": "var(--font-mercury-display)",
      },
      fontSize: {
        "mercury-display": ["var(--text-mercury-display)", "var(--text-mercury-display--line-height)"],
        "mercury-h1": ["var(--text-mercury-h1)", "var(--text-mercury-h1--line-height)"],
        "mercury-h2": ["var(--text-mercury-h2)", "var(--text-mercury-h2--line-height)"],
        "mercury-h3": ["var(--text-mercury-h3)", "var(--text-mercury-h3--line-height)"],
        "mercury-h4": ["var(--text-mercury-h4)", "var(--text-mercury-h4--line-height)"],
        "mercury-body-lg": ["var(--text-mercury-body-lg)", "var(--text-mercury-body-lg--line-height)"],
        "mercury-body": ["var(--text-mercury-body)", "var(--text-mercury-body--line-height)"],
        "mercury-small": ["var(--text-mercury-small)", "var(--text-mercury-small--line-height)"],
        "mercury-xs": ["var(--text-mercury-xs)", "var(--text-mercury-xs--line-height)"],
        "mercury-caption": ["var(--text-mercury-caption)", "var(--text-mercury-caption--line-height)"],
        "title-2xl": ["var(--text-title-2xl)", "var(--text-title-2xl--line-height)"],
        "title-xl": ["var(--text-title-xl)", "var(--text-title-xl--line-height)"],
        "title-lg": ["var(--text-title-lg)", "var(--text-title-lg--line-height)"],
        "title-md": ["var(--text-title-md)", "var(--text-title-md--line-height)"],
        "title-sm": ["var(--text-title-sm)", "var(--text-title-sm--line-height)"],
        "theme-xl": ["var(--text-theme-xl)", "var(--text-theme-xl--line-height)"],
        "theme-sm": ["var(--text-theme-sm)", "var(--text-theme-sm--line-height)"],
        "theme-xs": ["var(--text-theme-xs)", "var(--text-theme-xs--line-height)"],
        md: ["var(--text-md)", "var(--text-md--line-height)"],
      },
      colors: {
        current: "currentColor",
        transparent: "transparent",
        white: "#ffffff",
        black: "#101828",
        mercury: {
          bg: "#ffffff",
          "sidebar-canvas": "#fafafa",
          surface: "#ffffff",
          "surface-inverse": "#363644",
          ink: "#1e1e2a",
          muted: "#707393",
          "border-hairline": "#fbfcfd",
          line: "color-mix(in srgb, #b4b7c8 28%, #ffffff 72%)",
          primary: "#ffb452",
          "primary-hover": "#f2a141",
          "palette-muted": "#b4b7c8",
          "badge-tint": "#ffc46e",
          "on-accent": "#191920",
        },
        brand: {
          25: "#fffbf5",
          50: "#fff6ea",
          100: "#ffecd0",
          200: "#ffd9a3",
          300: "#ffc46e",
          400: "#ffbc5e",
          500: "#ffb452",
          600: "#f2a141",
          700: "#c47e22",
          800: "#9a5f18",
          900: "#6b4010",
          950: "#3d2408",
        },
        "blue-light": {
          25: "#f5fbff",
          50: "#f0f9ff",
          100: "#e0f2fe",
          200: "#b9e6fe",
          300: "#7cd4fd",
          400: "#36bffa",
          500: "#0ba5ec",
          600: "#0086c9",
          700: "#026aa2",
          800: "#065986",
          900: "#0b4a6f",
          950: "#062c41",
        },
        gray: {
          25: "#fcfcfd",
          50: "#f9fafb",
          100: "#f2f4f7",
          200: "#e4e7ec",
          300: "#d0d5dd",
          400: "#98a2b3",
          500: "#667085",
          600: "#475467",
          700: "#344054",
          800: "#1d2939",
          900: "#101828",
          950: "#0c111d",
          dark: "#1a2231",
        },
        orange: {
          25: "#fffaf5",
          50: "#fff6ed",
          100: "#ffead5",
          200: "#fddcab",
          300: "#feb273",
          400: "#fd853a",
          500: "#fb6514",
          600: "#ec4a0a",
          700: "#c4320a",
          800: "#9c2a10",
          900: "#7e2410",
          950: "#511c10",
        },
        success: {
          25: "#f6fef9",
          50: "#ecfdf3",
          100: "#d1fadf",
          200: "#a6f4c5",
          300: "#6ce9a6",
          400: "#32d583",
          500: "#12b76a",
          600: "#039855",
          700: "#027a48",
          800: "#05603a",
          900: "#054f31",
          950: "#053321",
        },
        error: {
          25: "#fffbfa",
          50: "#fef3f2",
          100: "#fee4e2",
          200: "#fecdca",
          300: "#fda29b",
          400: "#f97066",
          500: "#f04438",
          600: "#d92d20",
          700: "#b42318",
          800: "#912018",
          900: "#7a271a",
          950: "#55160c",
        },
        warning: {
          25: "#fffcf5",
          50: "#fffaeb",
          100: "#fef0c7",
          200: "#fedf89",
          300: "#fec84b",
          400: "#fdb022",
          500: "#f79009",
          600: "#dc6803",
          700: "#b54708",
          800: "#93370d",
          900: "#7a2e0e",
          950: "#4e1d09",
        },
        theme: {
          pink: { 500: "#ee46bc" },
          purple: { 500: "#7a5af8" },
        },
      },
      // Untitled UI semantic layer — see globals.css's second :root block for the source vars.
      // Deliberately kept out of the generic `colors` bucket above: bg-primary/text-primary/
      // border-primary/ring-primary each resolve to a *different* color under these dedicated
      // keys, matching the v4 per-utility-namespace behavior this was ported from.
      backgroundColor: {
        primary: "var(--background-color-primary)",
        primary_hover: "var(--background-color-primary_hover)",
        secondary: "var(--background-color-secondary)",
        secondary_hover: "var(--background-color-secondary_hover)",
        "primary-solid": "var(--background-color-primary-solid)",
        "brand-solid": "var(--background-color-brand-solid)",
        "brand-solid_hover": "var(--background-color-brand-solid_hover)",
        "error-primary": "var(--background-color-error-primary)",
        "error-solid": "var(--background-color-error-solid)",
        "error-solid_hover": "var(--background-color-error-solid_hover)",
      },
      textColor: {
        primary: "var(--text-color-primary)",
        secondary: "var(--text-color-secondary)",
        secondary_hover: "var(--text-color-secondary_hover)",
        tertiary: "var(--text-color-tertiary)",
        tertiary_hover: "var(--text-color-tertiary_hover)",
        quaternary: "var(--text-color-quaternary)",
        placeholder: "var(--text-color-placeholder)",
        "brand-secondary": "var(--text-color-brand-secondary)",
        "brand-secondary_hover": "var(--text-color-brand-secondary_hover)",
        "brand-tertiary": "var(--text-color-brand-tertiary)",
        "error-primary": "var(--text-color-error-primary)",
        "error-primary_hover": "var(--text-color-error-primary_hover)",
      },
      // Note: no bare `brand`/`error` keys here (on purpose) — those would collide
      // by name with the full brand-25..950/error-25..950 palette families
      // inherited from `colors` above, and Tailwind's config merge replaces
      // (doesn't merge into) an object at a shared key when the extension is a
      // plain string, silently breaking e.g. `border-brand-500`. Confirmed the
      // bare semantic names (`border-brand`, `ring-error`, etc., no shade
      // number) aren't used anywhere in the app, so dropping them is lossless —
      // the shaded palette classes below resolve correctly through `colors`.
      borderColor: {
        primary: "var(--border-color-primary)",
        secondary: "var(--border-color-secondary)",
        secondary_alt: "var(--border-color-secondary_alt)",
        error_subtle: "var(--border-color-error_subtle)",
      },
      ringColor: {
        primary: "var(--ring-color-primary)",
        secondary: "var(--ring-color-secondary)",
        secondary_alt: "var(--ring-color-secondary_alt)",
        error_subtle: "var(--ring-color-error_subtle)",
      },
      outlineColor: {},
      boxShadow: {
        "mercury-low": "var(--shadow-mercury-low)",
        "mercury-high": "var(--shadow-mercury-high)",
        "mercury-ambient-low": "var(--shadow-mercury-ambient-low)",
        "theme-md": "var(--shadow-theme-md)",
        "theme-lg": "var(--shadow-theme-lg)",
        "theme-sm": "var(--shadow-theme-sm)",
        "theme-xs": "var(--shadow-theme-xs)",
        "theme-xl": "var(--shadow-theme-xl)",
        datepicker: "var(--shadow-datepicker)",
        "focus-ring": "var(--shadow-focus-ring)",
        "slider-navigation": "var(--shadow-slider-navigation)",
        tooltip: "var(--shadow-tooltip)",
        skeuomorphic: "var(--shadow-skeuomorphic)",
        "xs-skeuomorphic": "var(--shadow-xs-skeuomorphic)",
        xs: "var(--shadow-xs)",
      },
      dropShadow: {
        "4xl": "var(--drop-shadow-4xl)",
      },
      zIndex: {
        1: "var(--z-index-1)",
        9: "var(--z-index-9)",
        99: "var(--z-index-99)",
        999: "var(--z-index-999)",
        9999: "var(--z-index-9999)",
        99999: "var(--z-index-99999)",
        999999: "var(--z-index-999999)",
      },
      borderRadius: {
        "mercury-subtle": "var(--radius-mercury-subtle)",
        "mercury-button": "var(--radius-mercury-button)",
        "mercury-card": "var(--radius-mercury-card)",
        "mercury-button-lg": "var(--radius-mercury-button-lg)",
        "mercury-pill": "var(--radius-mercury-pill)",
      },
    },
  },
  plugins: [],
};

export default config;
