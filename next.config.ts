import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Garante que rotas /api/* não sejam interceptadas pelo Next.js
  async rewrites() {
    return [];
  },
};

export default nextConfig;
