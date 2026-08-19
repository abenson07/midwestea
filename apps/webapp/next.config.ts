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

// BEN-1517: old admin routes with no direct new-admin equivalent, or that
// moved to a differently-named segment. Keeps old bookmarks/links out of
// a 404 instead of porting the old page.
const adminCutoverRedirects = [
  { source: "/new-admin-migrate", destination: "/admin", permanent: true },
  { source: "/new-admin-migrate/:path*", destination: "/admin/:path*", permanent: true },
  // Order matters: specific segments must come before the :id wildcard below.
  { source: "/admin/classes/add", destination: "/admin/classes", permanent: true },
  // Negative-lookahead excludes the real /admin/classes/open and /classes/closed list routes.
  { source: "/admin/classes/:id((?!open|closed)[^/]+)", destination: "/admin/class/:id", permanent: true },
  { source: "/admin/students/:id/classes/:classId", destination: "/admin/students/:id", permanent: true },
  { source: "/admin/instructors", destination: "/admin/settings/trainers", permanent: true },
  { source: "/admin/instructors/:id", destination: "/admin/settings/trainers", permanent: true },
  { source: "/admin/payments", destination: "/admin/transactions", permanent: true },
  { source: "/admin/reconcile", destination: "/admin/settings/reconcile", permanent: true },
  { source: "/admin/approvals", destination: "/admin/prerequisites", permanent: true },
  { source: "/admin/follow-up", destination: "/admin/prerequisites", permanent: true },
  { source: "/admin/recommend-courses", destination: "/admin/overview", permanent: true },
];

const studentPortalRedirects = [
  { source: "/student/billing", destination: "/student/invoices", permanent: false },
  { source: "/student/certificates", destination: "/student/documents", permanent: false },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  serverExternalPackages: ["@react-pdf/renderer"],
  async redirects() {
    return [
      ...programRedirects,
      ...templateRedirects,
      ...legacyRedirects,
      ...adminCutoverRedirects,
      ...studentPortalRedirects,
    ];
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
