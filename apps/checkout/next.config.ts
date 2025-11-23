import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configure the base path and asset prefix to reflect the mount path of your environment
  // For example, if your app is mounted at /checkout, set basePath and assetPrefix to '/checkout'
  basePath: process.env.BASE_PATH || '/checkout',
  assetPrefix: process.env.BASE_PATH || '/checkout',
  
  // Additional Next.js configuration options can be added here
  reactStrictMode: true,
};

export default nextConfig;

