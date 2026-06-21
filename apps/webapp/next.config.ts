import type { NextConfig } from "next";
import { programRedirects } from "./lib/marketing/redirects";

const templateRedirects = [
  { source: "/course-template", destination: "/courses", permanent: true },
  { source: "/program-template", destination: "/programs", permanent: true },
  { source: "/program-gallery", destination: "/programs", permanent: true },
  { source: "/order-confirmation", destination: "/purchase-confirmation/general", permanent: false },
];

const legacyRedirects = [
  { source: "/dashboard", destination: "/admin", permanent: true },
  { source: "/dashboard/:path*", destination: "/admin/:path*", permanent: true },
  { source: "/app/dashboard/:path*", destination: "/admin/:path*", permanent: true },
  { source: "/app/checkout/:path*", destination: "/checkout/:path*", permanent: true },
  { source: "/app/admin/:path*", destination: "/admin/:path*", permanent: true },
  { source: "/app/:path*", destination: "/:path*", permanent: true },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [...programRedirects, ...templateRedirects, ...legacyRedirects];
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
      };
    }
    return config;
  },
};

export default nextConfig;
