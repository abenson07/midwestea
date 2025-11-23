import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configure the base path and asset prefix to reflect the mount path of your environment
  // For example, if your app is mounted at /admin, set basePath and assetPrefix to '/admin'
  basePath: process.env.BASE_PATH || '/admin',
  assetPrefix: process.env.BASE_PATH || '/admin',
  
  // Additional Next.js configuration options can be added here
  reactStrictMode: true,
};

export default nextConfig;

