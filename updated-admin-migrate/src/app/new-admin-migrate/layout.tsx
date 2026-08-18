import type { ReactNode } from "react";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/patterns/foundation/ThemeContext";
import { DemoModeProvider } from "@/components/patterns/foundation/DemoModeContext";
import { WipFeaturesProvider } from "@/components/patterns/foundation/WipFeaturesContext";
import { OpenClassesProvider } from "@/lib/staging/OpenClassesContext";
import { listOpenClassesForNav } from "@/lib/staging/listOpenClasses";
import { QueryProvider } from "@/providers/QueryProvider";
import "./isolation.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

// Real-data fork: demo mode stays off so views do not overlay local fixtures.
export default async function DemoLayout({ children }: { children: ReactNode }) {
  const openClasses = await listOpenClassesForNav();

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
            <DemoModeProvider defaultEnabled={false}>
              <OpenClassesProvider value={openClasses}>{children}</OpenClassesProvider>
            </DemoModeProvider>
          </WipFeaturesProvider>
        </ThemeProvider>
        <Toaster richColors position="bottom-right" />
      </QueryProvider>
    </div>
  );
}
