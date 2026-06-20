import type { Config } from "tailwindcss";
import relumeTailwindPreset from "@relume_io/relume-tailwind";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@relume_io/relume-ui/dist/**/*.{js,ts,jsx,tsx}",
  ],
  presets: [relumeTailwindPreset],
  theme: {
    extend: {
      fontFamily: {
        body: ["var(--font-body)", "sans-serif"],
        heading: ["var(--font-heading)", "Impact", "sans-serif"],
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
      },
      borderRadius: {
        "mea-xs": "0.25rem",
        "mea-sm": "0.5rem",
        "mea-md": "0.75rem",
        "mea-lg": "1rem",
      },
    },
  },
};

export default config;
