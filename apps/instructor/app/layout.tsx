import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Instructor Dashboard - Midwest EA',
  description: 'Instructor dashboard',
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

