import type { Metadata } from "next";
import { DebugRuntimeProbe } from "@/components/debug-runtime-probe";
import { Footer } from "@/components/footer";
import { Navigation } from "@/components/navigation";
import { dmSans, ppNeueCorp } from "@/lib/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Midwest EA",
  description: "Midwest EA site",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${dmSans.variable} ${ppNeueCorp.variable}`}>
      <body className="bg-background font-body text-text antialiased">
        <DebugRuntimeProbe />
        <Navigation />
        {children}
        <Footer />
      </body>
    </html>
  );
}
