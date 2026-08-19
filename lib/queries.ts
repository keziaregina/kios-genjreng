import { Prisma } from "@/lib/generated/prisma/client";
import { publicUserSelect } from "@/lib/api";
import { prisma } from "@/lib/prisma";

// Single include shape for products so every caller gets the same object graph.
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

export function getProductsByUser(userId: number) {
  return prisma.product.findMany({
    where: { userId },
    include: productInclude,
    orderBy: { createdAt: "desc" },
  });
}

// Chat tools and search share one query so a recommendation always matches what the catalogue shows.
export function searchProducts(filter: {
  category?: string;
  keyword?: string;
  maxPrice?: number;
  limit?: number;
}) {
  const where: Prisma.ProductWhereInput = {};

  if (filter.category) {
    where.category = { name: { equals: filter.category, mode: "insensitive" } };
  }
  if (filter.keyword) {
    where.name = { contains: filter.keyword, mode: "insensitive" };
  }
  if (filter.maxPrice !== undefined) {
    where.price = { lte: filter.maxPrice };
  }

  return prisma.product.findMany({
    where,
    include: productInclude,
    orderBy: { price: "asc" },
    take: filter.limit ?? 8,
  });
}
