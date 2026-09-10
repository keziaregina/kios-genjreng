import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Server Actions cap request bodies at 1MB by default, which a 2MB photo would blow past.
  experimental: { serverActions: { bodySizeLimit: "3mb" } },
  // Product photos live on Vercel Blob, so next/image needs its host whitelisted.
  images: {
    remotePatterns: [{ protocol: "https", hostname: "*.public.blob.vercel-storage.com" }],
  },
};

export default nextConfig;
