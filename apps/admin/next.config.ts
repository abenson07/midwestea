import type { NextConfig } from "next";

// Conditionally set basePath: empty string in development (unless BASE_PATH is explicitly set),
// or use BASE_PATH env var, or default to '/admin' in production
const getBasePath = (): string => {
  if (process.env.BASE_PATH) {
    return process.env.BASE_PATH;
  }
  // In development, serve at root path for easier local development
  if (process.env.NODE_ENV === 'development') {
    return '';
  }
  // In production, default to '/admin'
  return '/admin';
};

const basePath = getBasePath();

const nextConfig: NextConfig = {
  // Configure the base path and asset prefix to reflect the mount path of your environment
  // For example, if your app is mounted at /admin, set basePath and assetPrefix to '/admin'
  basePath,
  assetPrefix: basePath,
  
  // Additional Next.js configuration options can be added here
  reactStrictMode: true,
  
  // Explicitly set output to standalone for OpenNext compatibility
  output: 'standalone',
};

export default nextConfig;





