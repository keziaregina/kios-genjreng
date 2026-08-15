import { publicUserSelect } from "@/lib/api";
import { prisma } from "@/lib/prisma";

/**
 * Single include shape for products so route handlers and Server Components
 * always hand back the same object graph.
 */
const productInclude = {
  category: true,
  user: { select: publicUserSelect },
} as const;

export function getProducts() {
  return prisma.product.findMany({
    include: productInclude,
    orderBy: { createdAt: "desc" },
  });
}

export function getProduct(id: number) {
  return prisma.product.findUnique({ where: { id }, include: productInclude });
}

export function getCategories() {
  return prisma.category.findMany({ orderBy: { name: "asc" } });
}

export function getUsers() {
  return prisma.user.findMany({
    select: publicUserSelect,
    orderBy: { name: "asc" },
  });
}
