import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configure the base path and asset prefix to reflect the mount path of your environment
  // For example, if your app is mounted at /student, set basePath and assetPrefix to '/student'
  basePath: process.env.BASE_PATH || '/student',
  assetPrefix: process.env.BASE_PATH || '/student',
  
  // Additional Next.js configuration options can be added here
  reactStrictMode: true,
};

export default nextConfig;




