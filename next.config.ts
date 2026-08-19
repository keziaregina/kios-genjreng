import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Server Actions cap request bodies at 1MB by default, which a 2MB photo would blow past.
  experimental: { serverActions: { bodySizeLimit: "3mb" } },
};

export default nextConfig;
