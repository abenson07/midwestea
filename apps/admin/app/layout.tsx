import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Midwest EA Admin",
  description: "Admin dashboard for Midwest EA",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-white">{children}</body>
    </html>
  );
}

