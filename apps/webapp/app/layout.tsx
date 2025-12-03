import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Midwest EA",
  description: "Midwest EA Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="data:," />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}


