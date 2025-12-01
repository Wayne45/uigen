import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  experimental: {
    instrumentationHook: true,
  },
};

export default nextConfig;
