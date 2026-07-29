import type { ReactNode } from "react";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/patterns/foundation/ThemeContext";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export default function AdminPreviewLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className={inter.variable}
      style={{
        height: "100vh",
        fontFamily: "var(--font-inter), system-ui, sans-serif",
      }}
    >
      <ThemeProvider>{children}</ThemeProvider>
    </div>
  );
}
