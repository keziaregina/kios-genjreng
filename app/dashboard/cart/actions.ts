"use server";

import { redirect } from "next/navigation";

import { formatAddress } from "@/lib/addresses";
import { requireUser } from "@/lib/auth/guards";
import { groupByMerchant } from "@/lib/cart";
import {
  MAX_NOTE_LENGTH,
  findCourier,
  orderTotal,
  protectionFee,
} from "@/lib/checkout";
import { MAX_QUANTITY } from "@/lib/orders";
import { prisma } from "@/lib/prisma";
import { cartInclude } from "@/lib/queries";
import { createRateLimiter } from "@/lib/rate-limit";
import { revalidateCart, revalidateOrders } from "@/lib/revalidate";
import type { ActionResult } from "@/types/action";
import type { CheckoutInput } from "@/types/checkout";
import { PaymentMethod } from "@/types/order";

const MAX_CART_ITEMS = 20;

// A stuck plus button should not be able to rewrite the cart a thousand times a minute.
const cartLimiter = createRateLimiter({ limit: 30, windowMs: 60_000 });
const checkoutLimiter = createRateLimiter({ limit: 5, windowMs: 60_000 });

const FAILURES: Record<string, string> = {
  PRODUCT_NOT_FOUND: "Produk tidak ditemukan",
  ITEM_NOT_FOUND: "Barang tidak ada di keranjang",
  OWN_PRODUCT: "Tidak bisa membeli produk sendiri",
  OUT_OF_STOCK: "Stok tidak mencukupi",
  STOCK_CHANGED: "Stok berubah saat checkout, periksa keranjangmu.",
  EMPTY_CART: "Keranjang masih kosong",
  CART_FULL: `Keranjang penuh, maksimal ${MAX_CART_ITEMS} produk`,
  LIMIT_REACHED: "Jumlah sudah mencapai batas stok",
  ADDRESS_NOT_FOUND: "Alamat pengiriman tidak ditemukan",
  BAD_PAYMENT: "Metode pembayaran tidak dikenal",
  MISSING_GROUP: "Ada penjual yang belum dipilih pengirimannya",
  COURIER_NOT_FOUND: "Kurir tidak tersedia",
  NOTE_TOO_LONG: `Catatan maksimal ${MAX_NOTE_LENGTH} karakter`,
};

const PAYMENT_METHODS: PaymentMethod[] = Object.values(PaymentMethod);

function failureMessage(error: unknown): string | undefined {
  return error instanceof Error ? FAILURES[error.message] : undefined;
}

function invalidQuantity(quantity: number) {
  return !Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QUANTITY;
}

export async function addToCart(
  productId: number,
  quantity: number,
): Promise<ActionResult> {
  const session = await requireUser();

  if (!Number.isInteger(productId) || productId <= 0) {
    return { ok: false, message: FAILURES.PRODUCT_NOT_FOUND };
  }
  if (invalidQuantity(quantity)) {
    return { ok: false, message: `Jumlah harus antara 1 dan ${MAX_QUANTITY}` };
  }

  const key = `cart:${session.userId}`;
  if (!cartLimiter.check(key).allowed) {
    return {
      ok: false,
      message: "Terlalu banyak perubahan keranjang, coba lagi sebentar lagi.",
    };
  }

  try {
    await prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({
        where: { id: productId },
        select: { id: true, userId: true, stock: true },
      });

      if (!product) throw new Error("PRODUCT_NOT_FOUND");
      if (product.userId === session.userId) throw new Error("OWN_PRODUCT");
      if (product.stock === 0) throw new Error("OUT_OF_STOCK");

      const existing = await tx.cartItem.findUnique({
        where: { userId_productId: { userId: session.userId, productId } },
        select: { quantity: true },
      });

      if (!existing) {
        const items = await tx.cartItem.count({ where: { userId: session.userId } });
        if (items >= MAX_CART_ITEMS) throw new Error("CART_FULL");
      }

      // Computing the merged value instead of incrementing is what keeps the stock ceiling honest.
      const ceiling = Math.min(product.stock, MAX_QUANTITY);
      if (existing && existing.quantity >= ceiling) throw new Error("LIMIT_REACHED");

      await tx.cartItem.upsert({
        where: { userId_productId: { userId: session.userId, productId } },
        create: {
          userId: session.userId,
          productId,
          quantity: Math.min(quantity, ceiling),
        },
        update: {
          quantity: Math.min((existing?.quantity ?? 0) + quantity, ceiling),
        },
      });
    });
  } catch (error) {
    const message = failureMessage(error);
    if (message) return { ok: false, message };

    console.error("[addToCart]", error);
    return { ok: false, message: "Gagal mengubah keranjang" };
  }

  cartLimiter.record(key);
  revalidateCart();
  return { ok: true };
}

export async function updateCartItemQuantity(
  itemId: number,
  quantity: number,
): Promise<ActionResult> {
  const session = await requireUser();

  if (!Number.isInteger(itemId) || itemId <= 0) {
    return { ok: false, message: FAILURES.ITEM_NOT_FOUND };
  }
  if (invalidQuantity(quantity)) {
    return { ok: false, message: `Jumlah harus antara 1 dan ${MAX_QUANTITY}` };
  }

  const key = `cart:${session.userId}`;
  if (!cartLimiter.check(key).allowed) {
    return {
      ok: false,
      message: "Terlalu banyak perubahan keranjang, coba lagi sebentar lagi.",
    };
  }

  // Filtering by the joined stock means a stale stepper can never park a quantity above what the merchant has.
  const updated = await prisma.cartItem.updateMany({
    where: {
      id: itemId,
      userId: session.userId,
      product: { stock: { gte: quantity } },
    },
    data: { quantity },
  });

  if (updated.count === 0) {
    const owned = await prisma.cartItem.findFirst({
      where: { id: itemId, userId: session.userId },
      select: { id: true },
    });

    return {
      ok: false,
      message: owned ? FAILURES.OUT_OF_STOCK : FAILURES.ITEM_NOT_FOUND,
    };
  }

  cartLimiter.record(key);
  revalidateCart();
  return { ok: true };
}

export async function removeCartItem(itemId: number): Promise<ActionResult> {
  const session = await requireUser();

  if (!Number.isInteger(itemId) || itemId <= 0) {
    return { ok: false, message: FAILURES.ITEM_NOT_FOUND };
  }

  const removed = await prisma.cartItem.deleteMany({
    where: { id: itemId, userId: session.userId },
  });

  if (removed.count === 0) {
    return { ok: false, message: FAILURES.ITEM_NOT_FOUND };
  }

  revalidateCart();
  return { ok: true };
}

export async function clearCart(): Promise<ActionResult> {
  const session = await requireUser();

  await prisma.cartItem.deleteMany({ where: { userId: session.userId } });

  revalidateCart();
  return { ok: true };
}

export async function checkout(input: CheckoutInput): Promise<ActionResult> {
  const session = await requireUser();

  if (!Number.isInteger(input.addressId) || input.addressId <= 0) {
    return { ok: false, message: FAILURES.ADDRESS_NOT_FOUND };
  }
  if (!PAYMENT_METHODS.includes(input.paymentMethod)) {
    return { ok: false, message: FAILURES.BAD_PAYMENT };
  }

  const key = `checkout:${session.userId}`;
  if (!checkoutLimiter.check(key).allowed) {
    return { ok: false, message: "Terlalu banyak checkout, coba lagi sebentar lagi." };
  }

  let orderIds: number[] = [];
  let productIds: number[] = [];

  try {
    const created = await prisma.$transaction(async (tx) => {
      const address = await tx.address.findFirst({
        where: { id: input.addressId, userId: session.userId },
      });

      if (!address) throw new Error("ADDRESS_NOT_FOUND");

      const items = await tx.cartItem.findMany({
        where: { userId: session.userId },
        include: cartInclude,
        orderBy: { productId: "asc" },
      });

      if (items.length === 0) throw new Error("EMPTY_CART");

      for (const item of items) {
        if (item.product.userId === session.userId) throw new Error("OWN_PRODUCT");

        // Claiming in productId order stops two overlapping carts from locking each other in reverse.
        const claimed = await tx.product.updateMany({
          where: { id: item.productId, stock: { gte: item.quantity } },
          data: { stock: { decrement: item.quantity } },
        });

        if (claimed.count === 0) throw new Error("STOCK_CHANGED");
      }

      const ids: number[] = [];

      for (const group of groupByMerchant(items)) {
        // The form only names a courier; every rupiah is recomputed here so a patched payload cannot set its own price.
        const draft = input.groups.find(
          (entry) => entry.merchantId === group.merchant.id,
        );

        if (!draft) throw new Error("MISSING_GROUP");

        const courier = findCourier(draft.courierId);
        if (!courier) throw new Error("COURIER_NOT_FOUND");

        const note = String(draft.note ?? "").trim();
        if (note.length > MAX_NOTE_LENGTH) throw new Error("NOTE_TOO_LONG");

        const costs = {
          subtotal: group.subtotal,
          shippingCost: courier.cost,
          protectionFee: protectionFee(draft.protection === true),
        };

        const order = await tx.order.create({
          data: {
            buyerId: session.userId,
            merchantId: group.merchant.id,
            subtotal: costs.subtotal,
            shippingCourier: courier.name,
            shippingCost: costs.shippingCost,
            shippingEta: courier.eta,
            protectionFee: costs.protectionFee,
            note: note === "" ? null : note,
            paymentMethod: input.paymentMethod,
            shipRecipient: address.recipient,
            shipPhone: address.phone,
            shipAddress: formatAddress(address),
            total: orderTotal(costs),
            items: {
              create: group.items.map((item) => ({
                productId: item.productId,
                name: item.product.name,
                price: item.product.price,
                quantity: item.quantity,
              })),
            },
          },
          select: { id: true },
        });

        ids.push(order.id);
      }

      await tx.cartItem.deleteMany({ where: { userId: session.userId } });

      return { ids, productIds: items.map((item) => item.productId) };
    });

    orderIds = created.ids;
    productIds = created.productIds;
  } catch (error) {
    const message = failureMessage(error);
    if (message) {
      revalidateCart();
      return { ok: false, message };
    }

    console.error("[checkout]", error);
    return { ok: false, message: "Gagal memproses checkout" };
  }

  checkoutLimiter.record(key);
  revalidateCart();
  revalidateOrders(productIds);
  redirect(orderIds.length === 1 ? `/dashboard/orders/${orderIds[0]}` : "/dashboard/orders");
}
