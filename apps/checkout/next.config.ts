import type { NextConfig } from "next";

// Conditionally set basePath: empty string in development (unless BASE_PATH is explicitly set),
// or use BASE_PATH env var, or default to '/checkout' in production
const getBasePath = (): string => {
  if (process.env.BASE_PATH) {
    return process.env.BASE_PATH;
  }
  // In development, serve at root path for easier local development
  if (process.env.NODE_ENV === 'development') {
    return '';
  }
  // In production, default to '/checkout'
  return '/checkout';
};

const nextConfig: NextConfig = {
  basePath: getBasePath(),
  assetPrefix: getBasePath(),
  reactStrictMode: true,
};

export default nextConfig;





