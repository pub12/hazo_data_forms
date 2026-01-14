import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["hazo_data_forms", "hazo_pdf"],
  webpack: (config, { isServer }) => {
    // Ensure hazo_pdf dynamic imports are properly resolved
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
      };
    }
    return config;
  },
  experimental: {
    optimizePackageImports: ["hazo_pdf"],
  },
};

export default nextConfig;
