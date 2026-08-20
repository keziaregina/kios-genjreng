import { Prisma } from "@/lib/generated/prisma/client";
import { publicUserSelect } from "@/lib/api";
import { prisma } from "@/lib/prisma";

// Single include shape for products so every caller gets the same object graph.
const productInclude = {
  category: true,
  user: { select: publicUserSelect },
} as const;

export function getProducts(limit?: number) {
  return prisma.product.findMany({
    include: productInclude,
    orderBy: { createdAt: "desc" },
    take: limit,
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

export type ProductSort = "termurah" | "terpopuler" | "terbaru";

// Sold count decides popularity first because a 5.0 from one buyer is not a bestseller.
const productOrderBy: Record<ProductSort, Prisma.ProductOrderByWithRelationInput[]> = {
  termurah: [{ price: "asc" }],
  terpopuler: [{ soldCount: "desc" }, { rating: "desc" }],
  terbaru: [{ createdAt: "desc" }],
};

// Chat tools and search share one query so a recommendation always matches what the catalogue shows.
export function searchProducts(filter: {
  category?: string;
  keyword?: string;
  maxPrice?: number;
  limit?: number;
  sort?: ProductSort;
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
    orderBy: productOrderBy[filter.sort ?? "termurah"],
    take: filter.limit ?? 8,
  });
}

// Single include shape for orders so buyer history and merchant inbox never diverge.
const orderInclude = {
  items: { include: { product: true } },
  buyer: { select: publicUserSelect },
  merchant: { select: publicUserSelect },
} as const;

export function getOrdersByBuyer(buyerId: number) {
  return prisma.order.findMany({
    where: { buyerId },
    include: orderInclude,
    orderBy: { createdAt: "desc" },
  });
}

export function getOrdersByMerchant(merchantId: number) {
  return prisma.order.findMany({
    where: { merchantId },
    include: orderInclude,
    orderBy: { createdAt: "desc" },
  });
}

// Ownership is not filtered here; the page decides who may read the row.
export function getOrder(id: number) {
  return prisma.order.findUnique({ where: { id }, include: orderInclude });
}
