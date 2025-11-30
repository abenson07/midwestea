import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: '/app',
  assetPrefix: '/app',
  reactStrictMode: true,
  // Explicitly set output to standalone for OpenNext compatibility
  output: 'standalone',
};

export default nextConfig;

