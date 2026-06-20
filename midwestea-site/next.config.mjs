import { programRedirects } from "./lib/redirects.mjs";

/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return programRedirects;
  },
};

export default nextConfig;
