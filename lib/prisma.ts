import { readdirSync } from "node:fs";
import path from "node:path";

import { PrismaClient } from "./generated/prisma/client";

// Bundling freezes the build-time path into the client, so the engine is located again from the deploy root.
function bundledEnginePath() {
  const dir = path.join(process.cwd(), "lib", "generated", "prisma");
  try {
    const file = readdirSync(dir).find((name) => name.endsWith(".so.node"));
    return file ? path.join(dir, file) : null;
  } catch {
    return null;
  }
}

if (!process.env.PRISMA_QUERY_ENGINE_LIBRARY) {
  const engine = bundledEnginePath();
  if (engine) process.env.PRISMA_QUERY_ENGINE_LIBRARY = engine;
}

// Reuse one client across HMR reloads in dev, otherwise every reload exhausts the connection pool.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
