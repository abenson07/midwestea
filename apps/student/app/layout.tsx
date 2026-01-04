import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Student Dashboard - Midwest EA',
  description: 'Student dashboard',
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
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}

