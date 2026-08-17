import type { ReactNode } from "react";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/patterns/foundation/ThemeContext";
import { DemoModeProvider } from "@/components/patterns/foundation/DemoModeContext";
import { WipFeaturesProvider } from "@/components/patterns/foundation/WipFeaturesContext";
import { QueryProvider } from "@/providers/QueryProvider";
import "./isolation.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

// No auth, no server-side data — this bundle is a static frontend export.
// Demo mode is forced on so every view reads from local mocks/localStorage only.
export default function DemoLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className={`admin-migrate-root ${inter.variable}`}
      style={{
        height: "100vh",
        fontFamily: "var(--font-inter), system-ui, sans-serif",
      }}
    >
      <QueryProvider>
        <ThemeProvider>
          <WipFeaturesProvider defaultEnabled={true}>
            <DemoModeProvider defaultEnabled={true}>{children}</DemoModeProvider>
          </WipFeaturesProvider>
        </ThemeProvider>
        <Toaster richColors position="bottom-right" />
      </QueryProvider>
    </div>
  );
}
