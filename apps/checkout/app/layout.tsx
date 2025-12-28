import type { Metadata } from 'next';
import './globals.css';
// Uncomment after running: npm run webflow:devlink:sync
// import '@/devlink/global.css';
// import { DevLinkProvider } from '@/devlink/DevLinkProvider';

export const metadata: Metadata = {
  title: 'Checkout - Midwest EA',
  description: 'Complete your purchase',
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
        {/* Uncomment DevLinkProvider after running: npm run webflow:devlink:sync */}
        {/* <DevLinkProvider> */}
        {children}
        {/* </DevLinkProvider> */}
      </body>
    </html>
  );
}

