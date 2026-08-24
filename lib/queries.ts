import { Prisma } from "@/lib/generated/prisma/client";
import { publicUserSelect } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { Role } from "@/types/user";

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

// Only a merchant row owns a storefront, so a buyer id resolves to nothing instead of an empty shelf.
export function getMerchant(id: number) {
  return prisma.user.findFirst({ where: { id, role: Role.MERCHANT }, select: publicUserSelect });
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
  reviews: { select: { productId: true } },
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

// One include shape for reviews so every surface reads the same graph.
const reviewInclude = { buyer: { select: publicUserSelect } } as const;

export function getProductReviews(productId: number, limit?: number) {
  return prisma.review.findMany({
    where: { productId },
    include: reviewInclude,
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

// Cart rows join the live catalogue so the price a buyer sees is today's price, not last week's.
export const cartInclude = {
  product: { include: productInclude },
} as const;

export function getCart(userId: number) {
  return prisma.cartItem.findMany({
    where: { userId },
    include: cartInclude,
    orderBy: { createdAt: "asc" },
  });
}

export function getCartItemCount(userId: number) {
  return prisma.cartItem.count({ where: { userId } });
}

// The default address sorts first so checkout can preselect it without a second query.
export function getAddresses(userId: number) {
  return prisma.address.findMany({
    where: { userId },
    orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
  });
}

export function getAddress(id: number, userId: number) {
  return prisma.address.findFirst({ where: { id, userId } });
}

// Buying straight from a product page skips the address picker, so it falls back to whatever is marked default.
export function getDefaultAddress(userId: number) {
  return prisma.address.findFirst({
    where: { userId },
    orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
  });
}

// A code is matched inside its owner merchant's scope, so two sellers can reuse the same word.
export function getVoucherByCode(userId: number, code: string) {
  return prisma.voucher.findUnique({ where: { userId_code: { userId, code } } });
}

export function getVouchersByMerchant(userId: number) {
  return prisma.voucher.findMany({ where: { userId }, orderBy: { createdAt: "desc" } });
}

export function getVoucher(id: number, userId: number) {
  return prisma.voucher.findFirst({ where: { id, userId } });
}
