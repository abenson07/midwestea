import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { ErrorReporter } from "@/components/ErrorReporter";
import { UtmCapture } from "@/components/UtmCapture";
import "./globals.css";

export const metadata: Metadata = {
  title: "Midwest EA",
  description: "Midwest Emergency Academy",
  icons: {
    icon: "/images/favicon.png",
    shortcut: "/images/favicon.png",
    apple: "/images/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <ErrorReporter />
        <UtmCapture />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
