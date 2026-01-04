import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: '/app',
  assetPrefix: '/app',
  reactStrictMode: true,
  // Explicitly set output to standalone for OpenNext compatibility
  output: 'standalone',
  webpack: (config, { isServer }) => {
    // Mark Node.js built-in modules as external for server-side only
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

