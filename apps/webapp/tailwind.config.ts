import type { Config } from "tailwindcss";
import relumeTailwindPreset from "@relume_io/relume-tailwind";

/*
  Admin section (colors/fontSize/shadows/etc named "mercury-*", "admin-*",
  "brand", "blue-light", "theme-*") was ported from updated-admin-migrate's
  Tailwind v4 setup as part of BEN-1517's cutover. Marketing/checkout's own
  tokens above are untouched.

  Dropped in the port: the "Untitled UI" bg-primary/text-secondary/etc
  semantic layer and several shadow/dropShadow/outline tokens that existed
  in the source config — confirmed zero usage anywhere in the actual moved
  components (the real theming there is linearTokens.ts, see below), so
  they'd have been unused dead weight here too.

  `gray`/`orange`/`success`/`error`/`warning` are deliberately renamed to
  `admin-gray`/`admin-orange`/etc: those five names collide with Tailwind's
  own built-in default palette, which marketing/checkout may already rely
  on. Renaming them means adding this config changes nothing for
  marketing/checkout — confirmed by the fact this file's own `colors`
  object never defined those five names before now. Everything else below
  (mercury-*, brand, blue-light, theme-pink/purple) had genuinely unique
  names with nothing to collide with, so those aren't renamed.

  `screens` is set at the top level (not `extend`), matching how the admin
  source intentionally replaces rather than extends the default breakpoint
  set — but the standard sm/md/lg/xl/2xl values are unchanged from
  Tailwind's real defaults (640/768/1024/1280/1536), only three custom ones
  (2xsm/xsm/3xl) are added, so this has zero effect on existing responsive
  behavior anywhere else in the app.

  `darkMode: "class"` is new (previously unset, defaulting to the
  OS-preference "media" strategy) — confirmed no `dark:` classes exist
  anywhere in marketing or checkout code, so this changes nothing for them
  either. The admin's actual light/dark system (linearTokens.ts) doesn't
  use Tailwind's dark: variant at all, it's independent CSS custom
  properties scoped to its own wrapper element — this setting exists only
  for the handful of `dark:` utility classes still used inside the moved
  admin components (e.g. the sidebar's menu-item styles).
*/
const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/marketing/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@relume_io/relume-ui/dist/**/*.{js,ts,jsx,tsx}",
  ],
  presets: [relumeTailwindPreset],
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
      fontFamily: {
        body: ["var(--font-body)", "sans-serif"],
        heading: ["var(--font-heading)", "Impact", "sans-serif"],
        "noto-sans": "var(--font-noto-sans)",
        "mercury-text": "var(--font-mercury-text)",
        "mercury-display": "var(--font-mercury-display)",
      },
      fontSize: {
        "mercury-display": ["28px", "36px"],
        "mercury-h1": ["24px", "32px"],
        "mercury-h2": ["20.44px", "28px"],
        "mercury-h3": ["20px", "28px"],
        "mercury-h4": ["19px", "26px"],
        "mercury-body-lg": ["17px", "28px"],
        "mercury-body": ["16.6667px", "26px"],
        "mercury-small": ["16px", "24px"],
        "mercury-xs": ["15px", "22px"],
        "mercury-caption": ["14px", "20px"],
        "title-2xl": ["72px", "90px"],
        "title-xl": ["60px", "72px"],
        "title-lg": ["48px", "60px"],
        "title-md": ["36px", "44px"],
        "title-sm": ["30px", "38px"],
        "theme-xl": ["20px", "30px"],
        "theme-sm": ["14px", "20px"],
        "theme-xs": ["12px", "18px"],
        md: ["16px", "24px"],
      },
      colors: {
        mea: {
          red: "#ff4b33",
          "red-lighter": "#ff704a",
          "red-darker": "#d83c30",
          yellow: "#ffb452",
          "yellow-lighter": "#ffc46e",
          "yellow-darker": "#f2a141",
          background: "#f7f6f3",
          text: "#191920",
        },
        neutral: {
          lightest: "#eeede8",
          lighter: "#d9d8d4",
          light: "#c3c3c0",
          DEFAULT: "#999898",
          dark: "#6e6e70",
          darker: "#444348",
          darkest: "#191920",
          black: "#141419",
          white: "#f7f6f3",
        },
        background: {
          DEFAULT: "#f7f6f3",
          primary: "#f7f6f3",
          secondary: "#eeede8",
          tertiary: "#999898",
          alternative: "#191920",
        },
        text: {
          DEFAULT: "#191920",
          primary: "#191920",
          secondary: "#999898",
          alternative: "#f7f6f3",
        },
        border: {
          DEFAULT: "#191920",
          primary: "#191920",
          secondary: "#c3c3c0",
          tertiary: "#444348",
          alternative: "#f7f6f3",
        },
        link: {
          DEFAULT: "#191920",
          primary: "#191920",
          secondary: "#999898",
          alternative: "#f7f6f3",
        },
        beige: {
          light: "#f5f5f0",
        },
        // --- Admin (BEN-1517) below ---
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
        "admin-gray": {
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
        "admin-orange": {
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
        "admin-success": {
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
        "admin-error": {
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
        "admin-warning": {
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
      boxShadow: {
        "mercury-low":
          "rgba(175, 178, 206, 0.56) 0px 0px 2px 0px, rgba(4, 4, 52, 0.1) 0px 1px 4px 0px",
        "mercury-high": "rgba(112, 115, 147, 0.1) 0px 0px 20px 0px",
        "mercury-ambient-low":
          "rgba(183, 187, 219, 0.14) 0px 1px 4px 0px, rgba(175, 178, 206, 0.9) 0px 0px 1px 0px",
        "theme-md":
          "rgba(175, 178, 206, 0.45) 0px 0px 2px 0px, rgba(4, 4, 52, 0.09) 0px 4px 8px 0px",
        "theme-lg": "rgba(112, 115, 147, 0.1) 0px 0px 20px 0px",
        "theme-sm":
          "rgba(175, 178, 206, 0.56) 0px 0px 2px 0px, rgba(4, 4, 52, 0.1) 0px 1px 4px 0px",
        "theme-xs":
          "rgba(183, 187, 219, 0.14) 0px 1px 4px 0px, rgba(175, 178, 206, 0.9) 0px 0px 1px 0px",
        "theme-xl": "rgba(112, 115, 147, 0.1) 0px 0px 20px 0px",
        datepicker: "-5px 0 0 #363644, 5px 0 0 #363644",
        "focus-ring": "0px 0px 0px 4px rgba(159, 232, 112, 0.28)",
      },
      zIndex: {
        1: "1",
        9: "9",
        99: "99",
        999: "999",
        9999: "9999",
        99999: "99999",
        999999: "999999",
      },
      borderRadius: {
        "mea-xs": "0.25rem",
        "mea-sm": "0.5rem",
        "mea-md": "0.75rem",
        "mea-lg": "1rem",
        "mercury-subtle": "4px",
        "mercury-button": "8px",
        "mercury-card": "12px",
        "mercury-button-lg": "16px",
        "mercury-pill": "100px",
      },
      spacing: {
        "6.5": "1.625rem",
      },
    },
  },
  plugins: [],
};

export default config;
