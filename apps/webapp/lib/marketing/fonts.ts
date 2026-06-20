import { DM_Sans } from "next/font/google";
import localFont from "next/font/local";

export const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap",
});

export const ppNeueCorp = localFont({
  src: [
    { path: "../../public/fonts/PPNeueCorp-CompactMedium.otf", weight: "500" },
    { path: "../../public/fonts/PPNeueCorp-TightUltrabold.otf", weight: "800" },
  ],
  variable: "--font-heading",
  display: "swap",
});
