import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Font optimization settings
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  
  // Reduce preload warnings
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
};

export default nextConfig;
