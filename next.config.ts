import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Server Actions cap request bodies at 1MB by default, which a 2MB photo would blow past.
  experimental: { serverActions: { bodySizeLimit: "3mb" } },
  // The Prisma engine is loaded by path at runtime, so tracing never sees it and must be told.
  outputFileTracingIncludes: {
    "/**/*": ["./lib/generated/prisma/**/*"],
  },
  // Product photos live on Vercel Blob, so next/image needs its host whitelisted.
  images: {
    remotePatterns: [{ protocol: "https", hostname: "*.public.blob.vercel-storage.com" }],
  },
};

export default nextConfig;
